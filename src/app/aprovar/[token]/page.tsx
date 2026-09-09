"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2, Clock, Send, AlertCircle, MessageCircle, DollarSign,
  Eye, ExternalLink, Sun, Moon, Smartphone, Globe, FileText, Package,
  X, ChevronLeft, ChevronRight, MapPin, Reply, Loader2,
} from "lucide-react";
import {
  STATUS_LABELS, STATUS_COLORS, CR_STATUS_LABELS, CR_STATUS_COLORS,
  CATEGORY_LABELS, formatCurrency, type ApprovalProject, type ApprovalRevision,
  type ApprovalChangeRequest, type AdditionalService, type ApprovalImageComment,
} from "@/lib/approvals";

interface PublicData {
  project: ApprovalProject;
  revisions: ApprovalRevision[];
  change_requests: ApprovalChangeRequest[];
  image_comments: ApprovalImageComment[];
  services: AdditionalService[];
  settings: {
    brand_name: string;
    brand_logo_url: string | null;
    default_theme: string;
    limit_reached_message: string;
    out_of_scope_message: string;
    pix_key: string | null;
    pix_key_type: string | null;
    pix_recipient_name: string | null;
    whatsapp_for_receipts: string | null;
  } | null;
}

const TIMELINE_STEPS = [
  { key: "sent", label: "Projeto enviado", icon: Send },
  { key: "in_review", label: "Em revisão", icon: Eye },
  { key: "changes_requested", label: "Alterações solicitadas", icon: MessageCircle },
  { key: "in_progress", label: "Em andamento", icon: Loader2 },
  { key: "approved", label: "Aprovado", icon: CheckCircle2 },
];

export default function ApprovalPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeRevisionIdx, setActiveRevisionIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Tema inicial
  useEffect(() => {
    const saved = localStorage.getItem("approval-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    } else if (data?.project?.theme && data.project.theme !== "inherit") {
      if (data.project.theme !== "system") setTheme(data.project.theme as "dark" | "light");
    } else if (data?.settings?.default_theme && data.settings.default_theme !== "system") {
      setTheme(data.settings.default_theme as "dark" | "light");
    } else if (typeof window !== "undefined") {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, [data]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = needsPassword && passwordInput
        ? `/api/public/approval/${token}?p=${encodeURIComponent(passwordInput)}`
        : `/api/public/approval/${token}`;
      const r = await fetch(url, { cache: "no-store" });
      const json = await r.json();
      if (r.status === 401 && json.requires_password) {
        setNeedsPassword(true);
      } else if (!r.ok) {
        setError(json.error || "Erro ao carregar projeto");
      } else {
        setData(json.data);
        setNeedsPassword(false);
        // Define última revisão como ativa
        if (json.data.revisions?.length) {
          setActiveRevisionIdx(json.data.revisions.length - 1);
        }
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [token, needsPassword, passwordInput]);

  useEffect(() => { load(); }, [load, refreshKey]);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("approval-theme", newTheme);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <Lock className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-center mb-2">Senha necessária</h1>
          <p className="text-xs text-zinc-400 text-center mb-4">Digite a senha que você recebeu para acessar este projeto.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={load}
            className="mt-3 w-full rounded-lg bg-emerald-500 text-zinc-950 py-2 text-sm font-bold hover:bg-emerald-400"
          >
            Acessar
          </button>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold mb-2">Não foi possível acessar</h1>
          <p className="text-sm text-zinc-400">{error || "Link inválido ou expirado."}</p>
        </div>
      </div>
    );
  }

  const { project, revisions, change_requests, image_comments, services, settings } = data;
  const activeRevision = revisions[activeRevisionIdx];
  const isFinished = ["approved", "archived", "expired"].includes(project.status);
  const remaining = project.max_revisions - project.current_revision;

  const themeClass = theme === "dark"
    ? "bg-zinc-950 text-zinc-100 border-white/10"
    : "bg-zinc-50 text-zinc-900 border-zinc-200";

  const cardClass = theme === "dark"
    ? "bg-white/[0.03] border-white/10"
    : "bg-white border-zinc-200 shadow-sm";

  const inputClass = theme === "dark"
    ? "bg-white/5 border-white/10 placeholder-zinc-500"
    : "bg-zinc-50 border-zinc-200 placeholder-zinc-400";

  return (
    <div className={`min-h-screen ${themeClass} transition-colors`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur ${theme === "dark" ? "bg-zinc-950/80 border-white/10" : "bg-white/80 border-zinc-200"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {settings?.brand_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.brand_logo_url} alt={settings.brand_name} className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center text-white font-bold">
                {(settings?.brand_name || "C")[0]}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs text-zinc-500 truncate">Portal de Aprovação · {settings?.brand_name || "Clodoaldo Silva"}</div>
              <div className="text-sm font-bold truncate">{project.project_title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`hidden sm:inline-flex rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${STATUS_COLORS[project.status]}`}>
              {STATUS_LABELS[project.status]}
            </span>
            <button
              onClick={toggleTheme}
              className={`rounded-full p-2 ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-zinc-100 hover:bg-zinc-200"}`}
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32 sm:pb-12">
        {/* Timeline */}
        {!isFinished && (
          <div className={`mb-6 rounded-2xl border ${cardClass} p-4`}>
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              {TIMELINE_STEPS.map((step, i) => {
                const Icon = step.icon;
                const stepOrder = ["sent", "in_review", "changes_requested", "in_progress", "approved"];
                const currentIdx = stepOrder.indexOf(project.status);
                const stepIdx = i;
                const isPast = currentIdx >= stepIdx;
                const isCurrent = currentIdx === stepIdx;
                return (
                  <div key={step.key} className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center gap-1.5 ${isPast ? "text-emerald-500" : "text-zinc-400"}`}>
                      <div className={`h-7 w-7 rounded-full grid place-items-center ${isPast ? "bg-emerald-500 text-white" : "bg-zinc-500/20"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-[11px] font-semibold ${isCurrent ? "" : "hidden sm:inline"}`}>{step.label}</span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && <div className={`w-4 sm:w-8 h-px ${isPast ? "bg-emerald-500" : "bg-zinc-500/20"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Aviso de projeto aprovado */}
        {project.status === "approved" && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] p-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-emerald-300">Projeto aprovado!</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Aprovado em {project.approved_at ? new Date(project.approved_at).toLocaleString("pt-BR") : "-"}.
              Este projeto está arquivado. Para novas mudanças, entre em contato para um novo projeto.
            </p>
          </div>
        )}

        {/* Aviso de expirado */}
        {project.status === "expired" && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-4 text-center">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-rose-300">Link expirado</h2>
            <p className="text-xs text-zinc-400 mt-1">Este link não está mais disponível. Entre em contato para reativar.</p>
          </div>
        )}

        {/* Notas do profissional */}
        {project.notes_for_client && (
          <div className={`mb-6 rounded-2xl border ${cardClass} p-4`}>
            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Mensagem do profissional</h3>
            <p className="text-sm whitespace-pre-wrap">{project.notes_for_client}</p>
          </div>
        )}

        {/* Escopo */}
        {project.project_scope && (
          <div className={`mb-6 rounded-2xl border ${cardClass} p-4`}>
            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Escopo do projeto</h3>
            <p className="text-sm whitespace-pre-wrap text-zinc-300">{project.project_scope}</p>
            {project.out_of_scope_examples && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase text-amber-400 mb-1">⚠️ Fora do escopo (pode gerar custo adicional):</h4>
                <p className="text-xs whitespace-pre-wrap text-zinc-400">{project.out_of_scope_examples}</p>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {activeRevision && (
          <div className={`mb-6 rounded-2xl border ${cardClass} overflow-hidden`}>
            <div className={`flex items-center justify-between p-3 border-b ${theme === "dark" ? "border-white/10" : "border-zinc-200"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">Revisão #{activeRevision.revision_number}</span>
                {revisions.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveRevisionIdx(Math.max(0, activeRevisionIdx - 1))}
                      disabled={activeRevisionIdx === 0}
                      className="rounded p-1 disabled:opacity-30 hover:bg-white/10"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] text-zinc-500">{activeRevisionIdx + 1} / {revisions.length}</span>
                    <button
                      onClick={() => setActiveRevisionIdx(Math.min(revisions.length - 1, activeRevisionIdx + 1))}
                      disabled={activeRevisionIdx === revisions.length - 1}
                      className="rounded p-1 disabled:opacity-30 hover:bg-white/10"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              {activeRevision.preview_url && (
                <a
                  href={activeRevision.preview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Abrir em tela cheia
                </a>
              )}
            </div>

            {activeRevision.notes && (
              <div className={`p-3 text-sm border-b ${theme === "dark" ? "border-white/10" : "border-zinc-200"}`}>
                <p className="text-zinc-300">{activeRevision.notes}</p>
              </div>
            )}

            {/* Preview iframe */}
            {activeRevision.preview_url && (
              <div className="aspect-[16/10] w-full bg-zinc-950">
                <iframe
                  src={activeRevision.preview_url}
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                  title="Preview do projeto"
                />
              </div>
            )}

            {/* Galeria de imagens */}
            {activeRevision.images && activeRevision.images.length > 0 && (
              <ImageGallery
                images={activeRevision.images}
                activeIdx={activeImageIdx}
                onChange={setActiveImageIdx}
                comments={image_comments.filter((c) => c.revision_id === activeRevision.id)}
                theme={theme}
                revisionId={activeRevision.id}
                onCommentAdded={() => setRefreshKey((k) => k + 1)}
              />
            )}
          </div>
        )}

        {/* Ações principais */}
        {!isFinished && (
          <div className="mb-6 grid sm:grid-cols-2 gap-3">
            <button
              onClick={async () => {
                if (!confirm("Confirmar aprovação deste projeto? Esta ação é definitiva.")) return;
                const r = await fetch(`/api/public/approval/${token}/approve`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password: passwordInput }),
                });
                if (r.ok) {
                  alert("✅ Projeto aprovado com sucesso! O profissional foi notificado.");
                  setRefreshKey((k) => k + 1);
                } else {
                  const j = await r.json();
                  alert("Erro: " + (j.error || "desconhecido"));
                }
              }}
              className="rounded-xl bg-emerald-500 text-zinc-950 py-4 font-bold hover:bg-emerald-400 transition inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" /> Aprovar projeto
            </button>
            <button
              onClick={() => setShowChangeForm(true)}
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 py-4 font-bold hover:bg-amber-500/20 transition inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" /> Pedir alteração
              {remaining <= 0 && <span className="text-[10px] bg-rose-500/30 px-2 py-0.5 rounded-full">limite atingido</span>}
            </button>
          </div>
        )}

        {/* Aviso de limite */}
        {limitWarning && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4">
            <AlertCircle className="h-6 w-6 text-amber-400 inline mr-2" />
            <span className="text-sm text-amber-200">{limitWarning}</span>
          </div>
        )}

        {/* Status das revisões */}
        <div className={`mb-6 rounded-2xl border ${cardClass} p-4`}>
          <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">Revisões</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-400">Revisões inclusas: <strong className="text-foreground">{project.max_revisions}</strong></span>
            <span className="text-zinc-400">Já utilizadas: <strong className="text-foreground">{project.current_revision}</strong></span>
            <span className={remaining > 0 ? "text-emerald-400" : "text-rose-400"}>
              Restantes: <strong>{Math.max(0, remaining)}</strong>
            </span>
          </div>
        </div>

        {/* Pedidos de alteração */}
        {change_requests.length > 0 && (
          <div className={`mb-6 rounded-2xl border ${cardClass} p-4`}>
            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">Seus pedidos de alteração</h3>
            <div className="space-y-2">
              {change_requests.map((cr) => (
                <ChangeRequestItem key={cr.id} cr={cr} theme={theme} settings={settings} token={token} password={passwordInput} />
              ))}
            </div>
          </div>
        )}

        {/* Catálogo de serviços adicionais */}
        {services.length > 0 && (
          <div className={`mb-6 rounded-2xl border ${cardClass} p-4`}>
            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">Serviços adicionais disponíveis</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {services.map((s) => (
                <div key={s.id} className={`rounded-lg border p-3 ${theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-zinc-200 bg-zinc-50"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold">{s.name}</h4>
                    <span className="text-sm font-bold text-emerald-400">{s.price_label || formatCurrency(s.price_cents)}</span>
                  </div>
                  {s.description && <p className="text-[11px] text-zinc-500">{s.description}</p>}
                  {s.kiwify_checkout_url && (
                    <a
                      href={s.kiwify_checkout_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Contratar
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações de contato */}
        {settings?.whatsapp_for_receipts && (
          <div className={`rounded-2xl border ${cardClass} p-4 text-center`}>
            <p className="text-xs text-zinc-500">Precisa de ajuda? Comprovantes de pagamento devem ser enviados para:</p>
            <a
              href={`https://wa.me/${settings.whatsapp_for_receipts.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp: +{settings.whatsapp_for_receipts}
            </a>
          </div>
        )}
      </main>

      {/* Modal de pedido de alteração */}
      {showChangeForm && (
        <ChangeRequestModal
          theme={theme}
          onClose={() => { setShowChangeForm(false); setLimitWarning(null); }}
          token={token}
          password={passwordInput}
          remaining={remaining}
          limitMessage={settings?.limit_reached_message}
          onSuccess={() => {
            setShowChangeForm(false);
            setRefreshKey((k) => k + 1);
          }}
          onLimitReached={(msg) => setLimitWarning(msg)}
        />
      )}
    </div>
  );
}

// =====================================================
// Galeria de imagens com comentários por área (markup)
// =====================================================
function ImageGallery({
  images, activeIdx, onChange, comments, theme, revisionId, onCommentAdded,
}: {
  images: string[];
  activeIdx: number;
  onChange: (i: number) => void;
  comments: ApprovalImageComment[];
  theme: "dark" | "light";
  revisionId: string;
  onCommentAdded: () => void;
}) {
  const [addingComment, setAddingComment] = useState(false);
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const activeComments = comments.filter((c) => c.image_index === activeIdx);

  function handleClickImg(e: React.MouseEvent<HTMLImageElement>) {
    if (!addingComment || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPendingPos({ x, y });
  }

  async function saveComment() {
    if (!pendingPos || !commentText.trim()) return;
    // NOTE: o token precisa ser obtido via useParams no parent. Aqui usamos location.pathname.
    const token = window.location.pathname.split("/").pop();
    const r = await fetch(`/api/public/approval/${token}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revision_id: revisionId,
        image_index: activeIdx,
        x: pendingPos.x,
        y: pendingPos.y,
        comment: commentText,
      }),
    });
    if (r.ok) {
      setCommentText("");
      setPendingPos(null);
      setAddingComment(false);
      onCommentAdded();
    }
  }

  return (
    <div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={images[activeIdx]}
          alt={`Imagem ${activeIdx + 1}`}
          onClick={handleClickImg}
          className={`w-full h-auto ${addingComment ? "cursor-crosshair" : ""}`}
        />

        {/* Comentários existentes */}
        {activeComments.map((c) => (
          <div
            key={c.id}
            className="absolute"
            style={{
              left: `${Number(c.x_percent) * 100}%`,
              top: `${Number(c.y_percent) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ${c.author_role === "admin" ? "bg-blue-500 text-white" : "bg-emerald-500 text-zinc-950"} shadow-lg`}>
              {c.author_role === "admin" ? "C" : "👤"}
            </div>
            {c.comment && (
              <div className={`absolute top-7 left-1/2 -translate-x-1/2 max-w-[200px] rounded-lg p-2 text-[10px] ${theme === "dark" ? "bg-zinc-900 border border-white/10 text-zinc-100" : "bg-white border border-zinc-200 text-zinc-900 shadow-lg"}`}>
                {c.comment}
              </div>
            )}
          </div>
        ))}

        {/* Comentário pendente */}
        {pendingPos && (
          <div
            className="absolute"
            style={{
              left: `${pendingPos.x * 100}%`,
              top: `${pendingPos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="h-6 w-6 rounded-full bg-amber-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className={`flex items-center justify-between p-2 border-t ${theme === "dark" ? "border-white/10" : "border-zinc-200"}`}>
        <div className="flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`h-2 rounded-full transition-all ${i === activeIdx ? "w-6 bg-emerald-500" : "w-2 bg-zinc-500"}`}
            />
          ))}
        </div>
        {!addingComment ? (
          <button
            onClick={() => setAddingComment(true)}
            className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" /> Comentar ponto
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Clique na imagem e descreva..."
              className={`text-xs rounded px-2 py-1 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"}`}
            />
            <button onClick={saveComment} disabled={!commentText || !pendingPos} className="text-xs text-emerald-400 disabled:opacity-30">
              Salvar
            </button>
            <button
              onClick={() => { setAddingComment(false); setPendingPos(null); setCommentText(""); }}
              className="text-xs text-zinc-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Modal de pedido de alteração
// =====================================================
function ChangeRequestModal({
  theme, onClose, token, password, remaining, limitMessage, onSuccess, onLimitReached,
}: {
  theme: "dark" | "light";
  onClose: () => void;
  token: string;
  password: string;
  remaining: number;
  limitMessage?: string;
  onSuccess: () => void;
  onLimitReached: (msg: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("other");
  const [forceWithCost, setForceWithCost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    const r = await fetch(`/api/public/approval/${token}/change-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        category,
        password,
        force_with_cost: forceWithCost,
      }),
    });
    const j = await r.json();
    setSubmitting(false);

    if (r.status === 402 && j.error === "limit_reached") {
      // Limite atingido — mostrar opção de forçar com custo
      onLimitReached(j.message);
      setForceWithCost(true);
      return;
    }
    if (!r.ok) {
      alert("Erro: " + (j.error || "desconhecido"));
      return;
    }
    alert("✅ Pedido de alteração enviado! O profissional foi notificado.");
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border ${theme === "dark" ? "bg-zinc-950 border-white/10" : "bg-white border-zinc-200"}`}
      >
        <div className={`sticky top-0 p-4 border-b ${theme === "dark" ? "border-white/10 bg-zinc-950" : "border-zinc-200 bg-white"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Pedir alteração</h2>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {remaining <= 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              ⚠️ {limitMessage || "Você atingiu o limite de revisões gratuitas. Continuar pode gerar custo adicional."}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={forceWithCost}
                  onChange={(e) => setForceWithCost(e.target.checked)}
                />
                <span>Estou ciente de que pode ter custo adicional e quero continuar</span>
              </label>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase text-zinc-500">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full mt-1 rounded-lg px-3 py-2 text-sm border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"}`}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500">Descreva a alteração</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Ex: O botão do WhatsApp não está funcionando no mobile. Gostaria de mudar a cor principal para azul..."
              className={`w-full mt-1 rounded-lg px-3 py-2 text-sm border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"}`}
            />
          </div>
          <button
            onClick={submit}
            disabled={submitting || !message.trim() || (remaining <= 0 && !forceWithCost)}
            className="w-full rounded-xl bg-emerald-500 text-zinc-950 py-3 font-bold hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Enviar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Item de change request exibido no portal do cliente
// =====================================================
function ChangeRequestItem({
  cr, theme, settings, token, password,
}: {
  cr: ApprovalChangeRequest;
  theme: "dark" | "light";
  settings: PublicData["settings"];
  token: string;
  password: string;
}) {
  const [showPayment, setShowPayment] = useState(false);

  if (cr.has_extra_cost && cr.payment_status !== "confirmed" && (cr.status === "awaiting_payment" || cr.status === "pending")) {
    return (
      <div className={`rounded-lg border p-3 ${theme === "dark" ? "border-amber-500/30 bg-amber-500/[0.05]" : "border-amber-500/30 bg-amber-50"}`}>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${CR_STATUS_COLORS[cr.status]}`}>{CR_STATUS_LABELS[cr.status]}</span>
          <span className="text-amber-300 font-bold text-sm">💰 {formatCurrency(Number(cr.extra_cost_amount) * 100 || 0)}</span>
        </div>
        <p className="text-xs text-zinc-300 mb-1"><strong>Seu pedido:</strong> {cr.client_message}</p>
        {cr.extra_cost_reason && <p className="text-xs text-amber-200"><strong>Motivo do custo:</strong> {cr.extra_cost_reason}</p>}
        {cr.admin_response && <p className="text-xs text-zinc-400 mt-2"><strong>Resposta:</strong> {cr.admin_response}</p>}

        {settings?.pix_key && (
          <div className={`mt-3 rounded-lg p-3 ${theme === "dark" ? "bg-zinc-900" : "bg-white"} border ${theme === "dark" ? "border-white/10" : "border-zinc-200"}`}>
            <p className="text-xs font-bold mb-1">Para liberar esta alteração:</p>
            <p className="text-xs">PIX: <strong>{settings.pix_key}</strong> ({settings.pix_key_type})</p>
            <p className="text-xs">Recebedor: <strong>{settings.pix_recipient_name || "-"}</strong></p>
            <p className="text-xs">Valor: <strong className="text-emerald-400">{formatCurrency(Number(cr.extra_cost_amount) * 100 || 0)}</strong></p>

            <div className="mt-3 flex flex-wrap gap-2">
              {cr.extra_cost_kiwify_url && (
                <a
                  href={cr.extra_cost_kiwify_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 text-zinc-950 px-3 py-2 text-xs font-bold hover:bg-emerald-400"
                >
                  <ExternalLink className="h-3 w-3" /> Pagar via Kiwify
                </a>
              )}
              {settings.whatsapp_for_receipts && (
                <a
                  href={`https://wa.me/${settings.whatsapp_for_receipts.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Comprovante - Projeto "${cr.project_id}" - Valor: ${formatCurrency(Number(cr.extra_cost_amount) * 100 || 0)}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 text-emerald-300 px-3 py-2 text-xs font-bold hover:bg-emerald-500/30"
                >
                  <MessageCircle className="h-3 w-3" /> Já paguei — enviar comprovante
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-3 ${theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-zinc-200 bg-zinc-50"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${CR_STATUS_COLORS[cr.status]}`}>{CR_STATUS_LABELS[cr.status]}</span>
        <span className="text-[10px] text-zinc-500">{CATEGORY_LABELS[cr.category]}</span>
        {cr.payment_status === "confirmed" && <span className="text-[10px] text-emerald-400">✓ pago</span>}
      </div>
      <p className="text-xs"><strong>Você:</strong> {cr.client_message}</p>
      {cr.admin_response && <p className="text-xs mt-1 text-zinc-400"><strong>Resposta:</strong> {cr.admin_response}</p>}
    </div>
  );
}

function Lock({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
}
