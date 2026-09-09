"use client";

import { useEffect, useState, useCallback } from "react";
import { Widget, Badge, Button, Input, Label, Select, Textarea, EmptyState } from "@/components/admin/ui";
import {
  ArrowLeft, Send, Eye, Copy, Check, Trash2, Loader2, ExternalLink,
  MessageCircle, DollarSign, CheckCircle2, XCircle, Clock, Smartphone,
  Share2,
} from "lucide-react";
import {
  STATUS_LABELS, STATUS_COLORS, CR_STATUS_LABELS, CR_STATUS_COLORS,
  CATEGORY_LABELS, PROJECT_TYPE_LABELS, formatCurrency, buildPublicUrl,
  type ApprovalProject, type ApprovalRevision, type ApprovalChangeRequest,
} from "@/lib/approvals";
import { ShareProjectModal } from "./share-modal";

interface ProjectEditorProps {
  projectId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProjectEditor({ projectId, onClose, onSaved }: ProjectEditorProps) {
  const [project, setProject] = useState<ApprovalProject | null>(null);
  const [revisions, setRevisions] = useState<ApprovalRevision[]>([]);
  const [changeRequests, setChangeRequests] = useState<ApprovalChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "revisions" | "requests" | "send">("details");

  // Form state
  const [form, setForm] = useState({
    client_name: "", client_email: "", client_whatsapp: "",
    project_title: "", project_type: "website",
    preview_url: "", preview_html: "",
    notes_for_client: "", project_scope: "", out_of_scope_examples: "",
    max_revisions: 3, theme: "inherit",
    expires_at: "", access_password: "",
  });

  // Para enviar nova revisão
  const [newRevision, setNewRevision] = useState({
    preview_url: "", preview_html: "", notes: "", images: "",
  });

  const [showShare, setShowShare] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (!projectId) {
      // Novo projeto — lê query params para pré-preencher (vindo do modal do lead)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        if (params.get("new") === "1" || params.get("client_name")) {
          setForm({
            client_name: params.get("client_name") || "",
            client_email: params.get("client_email") || "",
            client_whatsapp: params.get("client_whatsapp") || "",
            project_title: params.get("project_title") || "",
            project_type: "website",
            preview_url: params.get("preview_url") || "",
            preview_html: "",
            notes_for_client: "",
            project_scope: "",
            out_of_scope_examples: "",
            max_revisions: 3,
            theme: "inherit",
            expires_at: "",
            access_password: "",
          });
        }
      }
      setProject(null);
      setLoading(false);
      return;
    }
    try {
      const r = await fetch(`/api/admin/approvals/projects/${projectId}`, { cache: "no-store" });
      const json = await r.json();
      if (json.data) {
        setProject(json.data);
        setRevisions(json.data.revisions || []);
        setChangeRequests(json.data.change_requests || []);
        setForm({
          client_name: json.data.client_name || "",
          client_email: json.data.client_email || "",
          client_whatsapp: json.data.client_whatsapp || "",
          project_title: json.data.project_title || "",
          project_type: json.data.project_type || "website",
          preview_url: json.data.preview_url || "",
          preview_html: json.data.preview_html || "",
          notes_for_client: json.data.notes_for_client || "",
          project_scope: json.data.project_scope || "",
          out_of_scope_examples: json.data.out_of_scope_examples || "",
          max_revisions: json.data.max_revisions || 3,
          theme: json.data.theme || "inherit",
          expires_at: json.data.expires_at ? json.data.expires_at.split("T")[0] : "",
          access_password: json.data.access_password || "",
        });
      }
    } catch {}
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (projectId) {
        await fetch(`/api/admin/approvals/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const r = await fetch("/api/admin/approvals/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await r.json();
        if (json.data) {
          await load();
        }
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function sendRevision() {
    if (!projectId) return;
    setSaving(true);
    try {
      const images = newRevision.images
        ? newRevision.images.split("\n").map((s) => s.trim()).filter(Boolean)
        : null;
      await fetch(`/api/admin/approvals/projects/${projectId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preview_url: newRevision.preview_url || undefined,
          preview_html: newRevision.preview_html || undefined,
          notes: newRevision.notes || undefined,
          images,
        }),
      });
      setNewRevision({ preview_url: "", preview_html: "", notes: "", images: "" });
      await load();
      setActiveTab("revisions");
    } finally {
      setSaving(false);
    }
  }

  async function respondToChangeRequest(crId: string, body: Record<string, unknown>) {
    await fetch(`/api/admin/approvals/change-requests/${crId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
  }

  async function deleteProject() {
    if (!projectId) return;
    if (!confirm("Excluir projeto? Esta ação não pode ser desfeita.")) return;
    await fetch(`/api/admin/approvals/projects/${projectId}`, { method: "DELETE" });
    onSaved();
  }

  function copyLink() {
    if (project) {
      navigator.clipboard.writeText(buildPublicUrl(project.client_token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return <div className="py-12 text-center text-zinc-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  const publicUrl = project ? buildPublicUrl(project.client_token) : "";

  return (
    <Widget
      title={projectId ? `Editar: ${project?.project_title || ""}` : "Novo projeto de aprovação"}
      icon={<Eye className="h-4 w-4 text-emerald-400" />}
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}><ArrowLeft className="h-3 w-3" /><span className="ml-1">Voltar</span></Button>
          {projectId && <Button variant="outline" size="sm" onClick={deleteProject}><Trash2 className="h-3 w-3" /><span className="ml-1">Excluir</span></Button>}
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            <span className="ml-1">Salvar</span>
          </Button>
        </div>
      }
    >
      {project && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
          <span className="text-xs font-bold text-emerald-300">Link público do cliente:</span>
          <code className="text-[11px] text-zinc-300 break-all flex-1 min-w-0">{publicUrl}</code>
          <button
            onClick={() => setShowShare(true)}
            className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-[10px] font-bold text-white hover:opacity-90 shrink-0 shadow-md"
            title="Compartilhar em diversas redes sociais + email"
          >
            <Share2 className="h-3 w-3" /> Compartilhar
          </button>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30 shrink-0"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/25 shrink-0"
          >
            <ExternalLink className="h-3 w-3" /> Abrir
          </a>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${STATUS_COLORS[project.status]}`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>
      )}

      {/* Modal de compartilhamento */}
      {project && (
        <ShareProjectModal
          open={showShare}
          onClose={() => setShowShare(false)}
          publicUrl={publicUrl}
          projectTitle={project.project_title}
          clientName={project.client_name}
          clientWhatsapp={project.client_whatsapp}
          clientEmail={project.client_email}
        />
      )}

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-white/5">
        {[
          ["details", "Detalhes"],
          ["revisions", `Revisões (${revisions.length})`],
          ["requests", `Alterações (${changeRequests.filter(c => c.status === "pending" || c.status === "awaiting_payment" || c.status === "in_progress").length})`],
          ["send", "Enviar nova versão"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setActiveTab(k as any)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition ${activeTab === k ? "border-emerald-500 text-emerald-300" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Nome do cliente *</Label>
              <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Ex: João Silva" />
            </div>
            <div>
              <Label>Título do projeto *</Label>
              <Input value={form.project_title} onChange={(e) => setForm({ ...form, project_title: e.target.value })} placeholder="Ex: Site institucional para Padaria Irajá" />
            </div>
            <div>
              <Label>Email do cliente</Label>
              <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} placeholder="cliente@email.com" />
            </div>
            <div>
              <Label>WhatsApp do cliente</Label>
              <Input value={form.client_whatsapp} onChange={(e) => setForm({ ...form, client_whatsapp: e.target.value })} placeholder="5581..." />
            </div>
            <div>
              <Label>Tipo do projeto</Label>
              <Select value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
                {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
            <div>
              <Label>Limite de revisões inclusas</Label>
              <Input type="number" min={0} max={50} value={form.max_revisions} onChange={(e) => setForm({ ...form, max_revisions: Number(e.target.value) })} />
              <p className="mt-1 text-[10px] text-zinc-500">Default: 3. Após esse limite, cliente recebe aviso de possível custo adicional.</p>
            </div>
            <div>
              <Label>Tema padrão</Label>
              <Select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
                <option value="inherit">Herdar das configurações globais</option>
                <option value="system">Seguir sistema do cliente</option>
                <option value="dark">Escuro (premium)</option>
                <option value="light">Claro (corporativo)</option>
              </Select>
            </div>
            <div>
              <Label>Data de expiração (opcional)</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Senha de acesso (opcional)</Label>
              <Input value={form.access_password} onChange={(e) => setForm({ ...form, access_password: e.target.value })} placeholder="Deixe vazio para acesso livre pelo link" />
              <p className="mt-1 text-[10px] text-zinc-500">Se preenchido, cliente precisa digitar essa senha ao abrir o link.</p>
            </div>
          </div>

          <div>
            <Label>URL do preview (externa: Lovable, Vercel preview, etc.)</Label>
            <Input value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} placeholder="https://..." />
          </div>

          <div>
            <Label>Notas para o cliente</Label>
            <Textarea rows={3} value={form.notes_for_client} onChange={(e) => setForm({ ...form, notes_for_client: e.target.value })} placeholder="Mensagem explicando o projeto..." />
          </div>

          <div>
            <Label>Escopo do projeto (o que está incluso)</Label>
            <Textarea rows={4} value={form.project_scope} onChange={(e) => setForm({ ...form, project_scope: e.target.value })} placeholder="Ex: Home + Sobre + Serviços + Contato + 3 rodadas de revisão..." />
          </div>

          <div>
            <Label>Exemplos do que gera custo adicional</Label>
            <Textarea rows={4} value={form.out_of_scope_examples} onChange={(e) => setForm({ ...form, out_of_scope_examples: e.target.value })} placeholder="Ex: Adicionar nova página (R$ 197), integração com pagamento, sistema de agendamento..." />
          </div>
        </div>
      )}

      {activeTab === "revisions" && (
        <div className="space-y-3">
          {revisions.length === 0 ? (
            <EmptyState icon={<Clock className="h-8 w-8" />} title="Nenhuma revisão enviada ainda" description="Vá em 'Enviar nova versão' para criar a revisão #1." />
          ) : (
            revisions.slice().reverse().map((r) => (
              <div key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Revisão #{r.revision_number}</h4>
                      <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "info"}>
                        {r.status === "approved" ? "Aprovada" : r.status === "rejected" ? "Rejeitada" : r.status === "superseded" ? "Substituída" : "Enviada"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">{new Date(r.sent_at).toLocaleString("pt-BR")}</p>
                  </div>
                  {r.preview_url && (
                    <a href={r.preview_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/25">
                      <ExternalLink className="h-3 w-3" /> Abrir preview
                    </a>
                  )}
                </div>
                {r.notes && <p className="text-sm text-zinc-300 mb-2">{r.notes}</p>}
                {r.images && r.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {r.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="space-y-3">
          {changeRequests.length === 0 ? (
            <EmptyState icon={<MessageCircle className="h-8 w-8" />} title="Nenhum pedido de alteração" description="Os pedidos feitos pelo cliente aparecerão aqui." />
          ) : (
            changeRequests.slice().reverse().map((cr) => (
              <ChangeRequestCard key={cr.id} cr={cr} onRespond={respondToChangeRequest} />
            ))
          )}
        </div>
      )}

      {activeTab === "send" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3 text-xs text-blue-200">
            💡 Enviar nova versão criará a revisão #{(project?.current_revision || 0) + 1} e notificará o cliente por email (se configurado).
          </div>
          <div>
            <Label>URL do preview (opcional — se vazio, usa o default do projeto)</Label>
            <Input value={newRevision.preview_url} onChange={(e) => setNewRevision({ ...newRevision, preview_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Notas desta versão</Label>
            <Textarea rows={3} value={newRevision.notes} onChange={(e) => setNewRevision({ ...newRevision, notes: e.target.value })} placeholder="Ex: Ajustes solicitados na última rodada foram aplicados..." />
          </div>
          <div>
            <Label>URLs de imagens (uma por linha)</Label>
            <Textarea rows={4} value={newRevision.images} onChange={(e) => setNewRevision({ ...newRevision, images: e.target.value })} placeholder={"https://.../imagem1.png\nhttps://.../imagem2.png"} />
            <p className="mt-1 text-[10px] text-zinc-500">Use o upload do Supabase Storage ou URLs públicas das artes.</p>
          </div>
          <Button variant="primary" onClick={sendRevision} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-2">Enviar ao cliente</span>
          </Button>
        </div>
      )}
    </Widget>
  );
}

function ChangeRequestCard({ cr, onRespond }: { cr: ApprovalChangeRequest; onRespond: (id: string, body: Record<string, unknown>) => void }) {
  const [adminResponse, setAdminResponse] = useState(cr.admin_response || "");
  const [extraCost, setExtraCost] = useState(cr.extra_cost_amount?.toString() || "");
  const [extraReason, setExtraReason] = useState(cr.extra_cost_reason || "");
  const [kiwifyUrl, setKiwifyUrl] = useState(cr.extra_cost_kiwify_url || "");
  const [showCostForm, setShowCostForm] = useState(cr.has_extra_cost);

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="muted">{CATEGORY_LABELS[cr.category]}</Badge>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${CR_STATUS_COLORS[cr.status]}`}>
              {CR_STATUS_LABELS[cr.status]}
            </span>
            {cr.has_extra_cost && <Badge variant="warning"><DollarSign className="h-2.5 w-2.5" /> Custo: {formatCurrency(Number(cr.extra_cost_amount) * 100 || 0)}</Badge>}
            {cr.payment_status === "confirmed" && <Badge variant="success"><CheckCircle2 className="h-2.5 w-2.5" /> Pago</Badge>}
          </div>
          <p className="mt-2 text-sm text-zinc-200 whitespace-pre-wrap">{cr.client_message}</p>
          {cr.image_x !== null && cr.image_y !== null && (
            <p className="mt-1 text-[10px] text-zinc-500">📍 Comentário em imagem (x: {(Number(cr.image_x) * 100).toFixed(0)}%, y: {(Number(cr.image_y) * 100).toFixed(0)}%)</p>
          )}
          <p className="mt-1 text-[10px] text-zinc-500">{new Date(cr.created_at).toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {cr.status === "pending" && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
          <Textarea rows={2} placeholder="Sua resposta ao cliente..." value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`cost-${cr.id}`}
              checked={showCostForm}
              onChange={(e) => setShowCostForm(e.target.checked)}
            />
            <label htmlFor={`cost-${cr.id}`} className="text-xs">Esta alteração tem custo adicional</label>
          </div>

          {showCostForm && (
            <div className="grid sm:grid-cols-3 gap-2">
              <Input type="number" placeholder="R$ (ex: 97)" value={extraCost} onChange={(e) => setExtraCost(e.target.value)} />
              <Input placeholder="Motivo (ex: fora do escopo)" value={extraReason} onChange={(e) => setExtraReason(e.target.value)} />
              <Input placeholder="URL Kiwify (opcional)" value={kiwifyUrl} onChange={(e) => setKiwifyUrl(e.target.value)} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRespond(cr.id, {
                status: "in_progress",
                admin_response: adminResponse,
                is_fine_tune: !showCostForm,
                counts_as_revision: !showCostForm,
                has_extra_cost: showCostForm,
                extra_cost_amount: showCostForm ? Number(extraCost) : null,
                extra_cost_reason: showCostForm ? extraReason : null,
                extra_cost_kiwify_url: showCostForm ? kiwifyUrl : null,
              })}
            >
              <Check className="h-3 w-3" /> Aceitar e fazer
            </Button>
            {showCostForm && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => onRespond(cr.id, {
                  status: "awaiting_payment",
                  admin_response: adminResponse,
                  has_extra_cost: true,
                  extra_cost_amount: Number(extraCost),
                  extra_cost_reason: extraReason,
                  extra_cost_kiwify_url: kiwifyUrl,
                  payment_status: "pending",
                })}
              >
                <DollarSign className="h-3 w-3" /> Aguardar pagamento
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRespond(cr.id, { status: "rejected", admin_response: adminResponse })}
            >
              <XCircle className="h-3 w-3" /> Rejeitar
            </Button>
            {cr.status === "awaiting_payment" && (
              <Button
                variant="success"
                size="sm"
                onClick={() => onRespond(cr.id, {
                  payment_status: "confirmed",
                  payment_confirmed_at: new Date().toISOString(),
                  status: "in_progress",
                })}
              >
                <CheckCircle2 className="h-3 w-3" /> Confirmar pagamento
              </Button>
            )}
            {cr.status === "in_progress" && (
              <Button
                variant="success"
                size="sm"
                onClick={() => onRespond(cr.id, {
                  status: "resolved",
                  resolved_at: new Date().toISOString(),
                })}
              >
                <CheckCircle2 className="h-3 w-3" /> Marcar como resolvido
              </Button>
            )}
          </div>
        </div>
      )}

      {cr.admin_response && cr.status !== "pending" && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Sua resposta:</p>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap mt-1">{cr.admin_response}</p>
        </div>
      )}
    </div>
  );
}
