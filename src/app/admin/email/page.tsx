"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Select, Textarea } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, formatDateTime, fetchAdminData, statusColor, timeAgo } from "@/lib/admin/data";
import { Mail, Plus, RefreshCw, Pencil, Trash2, X, Save, Send, Users, Eye } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  body_html: string;
  trigger: string;
  active: boolean;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  source: string;
  status: string;
  subscribed_at: string;
}

const EMPTY: Partial<Template> = {
  name: "",
  subject: "",
  preheader: "",
  body_html: "<p>Olá {{nome}},</p><p>Aqui é o Clodoaldo!</p><p>{{mensagem}}</p><p>Abraço,<br/>Clodoaldo Silva</p>",
  trigger: "manual",
  active: true,
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual (disparo único)",
  welcome: "Boas-vindas (novo lead)",
  abandoned_cart: "Carrinho abandonado",
  post_purchase: "Pós-compra",
  upsell: "Upsell",
};

export default function AdminEmailPage() {
  const [tab, setTab] = useState<"templates" | "subscribers" | "sends">("templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [t, s] = await Promise.all([
      fetchAdminData<Template>("email_templates", 100),
      fetchAdminData<Subscriber>("email_subscribers", 500),
    ]);
    setTemplates(t || []);
    setSubscribers(s || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { error } = await (editing.id ? adminUpdate("email_templates", editing.id, editing)
      : adminInsert("email_templates", editing));
    setSaving(false);
    if (error) return alert("Erro: " + error);
    setEditing(null);
    await load();
  }

  async function remove(t: Template) {
    if (!confirm(`Remover template "${t.name}"?`)) return;
    const { error } = await adminDelete("email_templates", t.id);
    if (error) return alert("Erro: " + error);
    await load();
  }

  async function toggleActive(t: Template) {
    const { error } = await adminUpdate("email_templates", t.id, { active: !t.active });
    if (error) return alert("Erro: " + error);
    await load();
  }

  async function removeSub(s: Subscriber) {
    if (!confirm(`Remover ${s.email}?`)) return;
    const { error } = await adminDelete("email_subscribers", s.id);
    if (error) return alert("Erro: " + error);
    await load();
  }

  return (
    <AdminShell title="E-mail Marketing">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Templates" value={String(templates.length)} />
        <StatBox label="Ativos" value={String(templates.filter((t) => t.active).length)} accent="emerald" />
        <StatBox label="Inscritos" value={String(subscribers.length)} accent="blue" />
        <StatBox label="Ativos" value={String(subscribers.filter((s) => s.status === "active").length)} accent="violet" />
      </div>

      <div className="mb-4 inline-flex items-center gap-0.5 rounded-full border border-white/5 bg-white/[0.03] p-0.5">
        {[
          { key: "templates", label: "Templates", icon: Mail },
          { key: "subscribers", label: "Inscritos", icon: Users },
          { key: "sends", label: "Envios", icon: Send },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                tab === t.key ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-3 w-3" /> {t.label}
            </button>
          );
        })}
      </div>

      <Widget
        title={tab === "templates" ? "Templates de e-mail" : tab === "subscribers" ? "Lista de inscritos" : "Envios recentes"}
        icon={<Mail className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            {tab === "templates" && (
              <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
                <Plus className="h-3.5 w-3.5" /> Novo template
              </Button>
            )}
          </div>
        }
      >
        {tab === "templates" && (
          <>
            {loading ? (
              <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
            ) : templates.length === 0 ? (
              <EmptyState
                title="Nenhum template"
                description="Crie templates para boas-vindas, carrinho abandonado, pós-compra, etc."
                icon={<Mail className="h-8 w-8" />}
                action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Criar template</Button>}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="truncate text-sm font-bold text-white">{t.name}</h4>
                          <Badge variant={t.active ? "success" : "muted"}>{t.active ? "ativo" : "inativo"}</Badge>
                        </div>
                        <p className="truncate text-xs text-zinc-400">{t.subject}</p>
                      </div>
                      <Badge variant="info">{TRIGGER_LABELS[t.trigger] || t.trigger}</Badge>
                    </div>
                    {t.preheader && <p className="text-[11px] italic text-zinc-500">{t.preheader}</p>}
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                      <Toggle checked={t.active} onChange={() => toggleActive(t)} label="Ativo" />
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(t)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(t)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "subscribers" && (
          <>
            {loading ? (
              <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
            ) : subscribers.length === 0 ? (
              <EmptyState title="Nenhum inscrito" description="Inscreveremos automaticamente leads e clientes." icon={<Users className="h-8 w-8" />} />
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Nome</th>
                      <th className="px-3 py-2 font-medium">Fonte</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Inscrito em</th>
                      <th className="px-3 py-2 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2.5 text-zinc-200">{s.email}</td>
                        <td className="px-3 py-2.5 text-zinc-300">{s.name || "—"}</td>
                        <td className="px-3 py-2.5"><Badge variant="info">{s.source}</Badge></td>
                        <td className="px-3 py-2.5"><Badge variant={statusColor(s.status)}>{s.status}</Badge></td>
                        <td className="px-3 py-2.5 text-[12px] text-zinc-400">{formatDateTime(s.subscribed_at)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button onClick={() => removeSub(s)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "sends" && (
          <EmptyState title="Envio de e-mails" description="Os envios manuais e automáticos aparecerão aqui. Use o botão abaixo para testar." icon={<Send className="h-8 w-8" />} />
        )}
      </Widget>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar template" : "Novo template"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome (interno)</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Boas-vindas" />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select value={editing.trigger} onChange={(e) => setEditing({ ...editing, trigger: e.target.value })}>
                  <option value="manual">Manual</option>
                  <option value="welcome">Boas-vindas</option>
                  <option value="abandoned_cart">Carrinho abandonado</option>
                  <option value="post_purchase">Pós-compra</option>
                  <option value="upsell">Upsell</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Assunto</Label>
                <Input value={editing.subject || ""} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="Bem-vindo ao ecossistema!" />
              </div>
              <div className="sm:col-span-2">
                <Label>Preheader</Label>
                <Input value={editing.preheader || ""} onChange={(e) => setEditing({ ...editing, preheader: e.target.value })} placeholder="Resumo curto do email…" />
              </div>
              <div className="sm:col-span-2">
                <Label>Corpo (HTML — variáveis: {`{{nome}}`}, {`{{mensagem}}`})</Label>
                <Textarea value={editing.body_html || ""} onChange={(e) => setEditing({ ...editing, body_html: e.target.value })} rows={10} className="font-mono text-xs" />
              </div>
              <div className="sm:col-span-2">
                <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Template ativo" />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                <Save className="h-3.5 w-3.5" /> {saving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function StatBox({ label, value, accent = "emerald" }: { label: string; value: string; accent?: "emerald" | "amber" | "rose" | "blue" | "violet" }) {
  const accents = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
    violet: "text-violet-300",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accents[accent]}`}>{value}</div>
    </div>
  );
}
