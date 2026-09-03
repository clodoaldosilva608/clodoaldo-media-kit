"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Select, Textarea } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, brl, formatDateTime, fetchAdminData, statusColor } from "@/lib/admin/data";
import { CreditCard, Plus, RefreshCw, Pencil, Trash2, X, Save, Check, Sparkles } from "lucide-react";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: "month" | "year";
  interval_count: number;
  trial_days: number;
  features: string[];
  highlight: boolean;
  active: boolean;
  kiwify_product_id: string | null;
  created_at: string;
}

const EMPTY: Partial<Plan> = {
  slug: "",
  name: "",
  description: "",
  price_cents: 2900,
  currency: "brl",
  interval: "month",
  interval_count: 1,
  trial_days: 7,
  features: [],
  highlight: false,
  active: true,
  kiwify_product_id: "",
};

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<"plans" | "subs">("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      fetchAdminData<Plan>("subscription_plans", 100),
      fetchAdminData<any>("subscriptions", 500),
    ]);
    setPlans(p || []);
    setSubs(s || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const payload = {
      ...editing,
      price_cents: Number(editing.price_cents) || 0,
      interval_count: Number(editing.interval_count) || 1,
      trial_days: Number(editing.trial_days) || 0,
      features: Array.isArray(editing.features)
        ? editing.features
        : String(editing.features || "")
            .split("\n")
            .map((s: string) => s.trim())
            .filter(Boolean),
    };
    const { error } = editing.id
      ? adminUpdate("subscription_plans", editing.id, payload)
      : adminInsert("subscription_plans", payload);
    setSaving(false);
    if (error) return alert("Erro: " + error.message);
    setEditing(null);
    await load();
  }

  async function remove(p: Plan) {
    if (!confirm(`Remover plano "${p.name}"?`)) return;
    const { error } = adminDelete("subscription_plans", p.id);
    if (error) return alert("Erro: " + error.message);
    await load();
  }

  async function toggleActive(p: Plan) {
    const { error } = adminUpdate("subscription_plans", p.id, { active: !p.active });
    if (error) return alert("Erro: " + error.message);
    await load();
  }

  return (
    <AdminShell title="Assinaturas">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Planos" value={String(plans.length)} />
        <StatBox label="Ativos" value={String(plans.filter((p) => p.active).length)} accent="emerald" />
        <StatBox label="Assinantes" value={String(subs.length)} accent="blue" />
        <StatBox label="MRR estimado" value={brl(plans.reduce((s, p) => s + (p.active ? p.price_cents : 0), 0) * Math.max(subs.length, 0))} accent="violet" />
      </div>

      <div className="mb-4 inline-flex items-center gap-0.5 rounded-full border border-white/5 bg-white/[0.03] p-0.5">
        <button
          onClick={() => setTab("plans")}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${tab === "plans" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Planos
        </button>
        <button
          onClick={() => setTab("subs")}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${tab === "subs" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Assinantes
        </button>
      </div>

      <Widget
        title={tab === "plans" ? "Planos de assinatura" : "Assinantes ativos"}
        icon={<CreditCard className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            {tab === "plans" && (
              <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
                <Plus className="h-3.5 w-3.5" /> Novo plano
              </Button>
            )}
          </div>
        }
      >
        {tab === "plans" && (
          <>
            {loading ? (
              <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
            ) : plans.length === 0 ? (
              <EmptyState
                title="Nenhum plano"
                description="Crie planos de assinatura mensal ou anual para receita recorrente."
                icon={<CreditCard className="h-8 w-8" />}
                action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Criar plano</Button>}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((p) => (
                  <div key={p.id} className={`rounded-xl border p-4 ${p.highlight ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-white/5 bg-white/[0.02]"}`}>
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {p.highlight && <Sparkles className="h-3.5 w-3.5 text-emerald-400" />}
                          <h4 className="text-sm font-bold text-white">{p.name}</h4>
                          <Badge variant={p.active ? "success" : "muted"}>{p.active ? "ativo" : "inativo"}</Badge>
                        </div>
                        <div className="text-[11px] text-zinc-500">{p.slug}</div>
                      </div>
                    </div>
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-emerald-300">{brl(p.price_cents)}</span>
                      <span className="text-[11px] text-zinc-500">/{p.interval === "month" ? "mês" : "ano"}</span>
                    </div>
                    {p.trial_days > 0 && <p className="text-[11px] text-zinc-400">{p.trial_days} dias de trial</p>}
                    {p.description && <p className="mt-2 text-xs text-zinc-400">{p.description}</p>}
                    {p.features && p.features.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {p.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                      <Toggle checked={p.active} onChange={() => toggleActive(p)} label="Ativo" />
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
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

        {tab === "subs" && (
          <>
            {loading ? (
              <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
            ) : subs.length === 0 ? (
              <EmptyState title="Nenhum assinante" description="Os assinantes aparecerão aqui." icon={<CreditCard className="h-8 w-8" />} />
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">User ID</th>
                      <th className="px-3 py-2 font-medium">Plano</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Início</th>
                      <th className="px-3 py-2 font-medium">Próxima cobrança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subs.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2.5 font-mono text-[11px] text-zinc-300">{s.user_id?.slice(0, 8)}…</td>
                        <td className="px-3 py-2.5 text-zinc-200">{s.plan_id?.slice(0, 8)}…</td>
                        <td className="px-3 py-2.5"><Badge variant={statusColor(s.status)}>{s.status}</Badge></td>
                        <td className="px-3 py-2.5 text-[12px] text-zinc-400">{formatDateTime(s.started_at)}</td>
                        <td className="px-3 py-2.5 text-[12px] text-zinc-400">{formatDateTime(s.current_period_end)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Widget>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar plano" : "Novo plano"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="pro-mensal" />
              </div>
              <div>
                <Label>Nome</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="PRO Mensal" />
              </div>
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" value={(editing.price_cents ?? 2900) / 100} onChange={(e) => setEditing({ ...editing, price_cents: Math.round(Number(e.target.value) * 100) })} step="0.01" />
              </div>
              <div>
                <Label>Ciclo</Label>
                <Select value={editing.interval} onChange={(e) => setEditing({ ...editing, interval: e.target.value as any })}>
                  <option value="month">Mensal</option>
                  <option value="year">Anual</option>
                </Select>
              </div>
              <div>
                <Label>A cada (qtd de ciclos)</Label>
                <Input type="number" min={1} value={editing.interval_count ?? 1} onChange={(e) => setEditing({ ...editing, interval_count: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Trials (dias)</Label>
                <Input type="number" min={0} value={editing.trial_days ?? 0} onChange={(e) => setEditing({ ...editing, trial_days: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>Features (uma por linha)</Label>
                <Textarea
                  value={Array.isArray(editing.features) ? editing.features.join("\n") : String(editing.features || "")}
                  onChange={(e) => setEditing({ ...editing, features: e.target.value.split("\n") })}
                  rows={5}
                  placeholder="Acesso a todos os e-books&#10;Atualizações mensais&#10;Suporte prioritário"
                />
              </div>
              <div>
                <Label>Kiwify Product ID</Label>
                <Input value={editing.kiwify_product_id || ""} onChange={(e) => setEditing({ ...editing, kiwify_product_id: e.target.value })} placeholder="ID do produto Kiwify" />
              </div>
              <div className="flex items-end gap-4">
                <Toggle checked={editing.highlight ?? false} onChange={(v) => setEditing({ ...editing, highlight: v })} label="Destaque" />
                <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Ativo" />
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
