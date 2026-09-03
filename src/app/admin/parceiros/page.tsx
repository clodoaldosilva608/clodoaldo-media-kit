"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Select, Textarea } from "@/components/admin/ui";
import { fetchAdminData, adminInsert, adminUpdate, adminDelete, brl, formatDateTime, statusColor, timeAgo } from "@/lib/admin/data";
import { UserPlus, Plus, RefreshCw, Pencil, Trash2, X, Save, ExternalLink, Copy, Check, Users, DollarSign, Link as LinkIcon, TrendingUp, Award } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company?: string | null;
  type?: string;
  slug: string;
  website?: string | null;
  instagram?: string | null;
  commission_percent: number;
  clicks: number;
  signups: number;
  sales: number;
  earnings_cents: number;
  paid_out_cents: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const EMPTY: Partial<Partner> = {
  name: "",
  email: "",
  phone: "",
  company: "",
  type: "creator",
  slug: "",
  website: "",
  instagram: "",
  commission_percent: 20,
  status: "active",
  notes: "",
};

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  creator: { label: "Creator", emoji: "📹" },
  brand: { label: "Marca", emoji: "🏢" },
  agency: { label: "Agência", emoji: "🎯" },
  freelancer: { label: "Freelancer", emoji: "💼" },
};

function genSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20) + "-" + Math.random().toString(36).slice(2, 6);
}

export default function AdminParceirosPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    // Use the affiliates table (it has the same structure we need)
    const data = await fetchAdminData<Partner>("affiliates", 500);
    setItems(data || []);
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
      slug: editing.slug || genSlug(editing.name || "parceiro"),
      commission_percent: Number(editing.commission_percent) || 20,
    };
    const { error } = editing.id
      ? await adminUpdate("affiliates", editing.id, payload)
      : await adminInsert("affiliates", payload);
    setSaving(false);
    if (error) return alert("Erro: " + error);
    setEditing(null);
    await load();
  }

  async function remove(p: Partner) {
    if (!confirm(`Remover parceiro ${p.name}?`)) return;
    const { error } = await adminDelete("affiliates", p.id);
    if (error) return alert("Erro: " + error);
    await load();
  }

  async function toggleStatus(p: Partner) {
    const next = p.status === "active" ? "blocked" : "active";
    const { error } = await adminUpdate("affiliates", p.id, { status: next });
    if (error) return alert("Erro: " + error);
    await load();
  }

  function copyLink(p: Partner) {
    const link = `${window.location.origin}/?ref=${p.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = items.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchType = filterType === "all" || p.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalEarnings = items.reduce((s, p) => s + (p.earnings_cents || 0), 0);
  const totalPaid = items.reduce((s, p) => s + (p.paid_out_cents || 0), 0);
  const totalClicks = items.reduce((s, p) => s + (p.clicks || 0), 0);
  const totalSales = items.reduce((s, p) => s + (p.sales || 0), 0);
  const activeCount = items.filter((p) => p.status === "active").length;

  return (
    <AdminShell title="Parceiros">
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Parceiros" value={String(items.length)} hint={`${activeCount} ativos`} icon={Users} accent="emerald" />
        <KpiCard label="Cliques gerados" value={String(totalClicks)} icon={TrendingUp} accent="blue" />
        <KpiCard label="Vendas via parceiros" value={String(totalSales)} icon={Award} accent="violet" />
        <KpiCard label="Comissões totais" value={brl(totalEarnings)} icon={DollarSign} accent="amber" />
        <KpiCard label="A pagar" value={brl(totalEarnings - totalPaid)} icon={DollarSign} accent="rose" />
      </div>

      <Widget
        title="Catálogo de parceiros"
        icon={<UserPlus className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-3.5 w-3.5" /> Novo parceiro
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por nome, email ou slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:flex-1"
          />
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="sm:w-40">
            <option value="all">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="sm:w-40">
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
            <option value="blocked">Bloqueado</option>
            <option value="paid">Pago</option>
          </Select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum parceiro"
            description="Cadastre creators, marcas, agências ou freelancers para ampliar suas vendas via indicação."
            icon={<UserPlus className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Cadastrar parceiro</Button>}
          />
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Parceiro</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Link</th>
                  <th className="px-3 py-2 font-medium">Comissão</th>
                  <th className="px-3 py-2 font-medium">Métricas</th>
                  <th className="px-3 py-2 font-medium">Ganhos</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-200">{p.name}</div>
                      <div className="text-[11px] text-zinc-500">{p.email}</div>
                      {p.company && <div className="text-[10px] text-zinc-600">{p.company}</div>}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="info">
                        {TYPE_LABELS[p.type as keyof typeof TYPE_LABELS]?.emoji || "👤"} {TYPE_LABELS[p.type as keyof typeof TYPE_LABELS]?.label || p.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => copyLink(p)}
                        className="inline-flex items-center gap-1 font-mono text-xs text-emerald-300 hover:text-emerald-200"
                        title="Copiar link"
                      >
                        <LinkIcon className="h-3 w-3" />
                        /?ref={p.slug}
                        {copied === p.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-amber-300">{p.commission_percent}%</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="text-zinc-300">{p.clicks || 0} cliques</div>
                      <div className="text-zinc-500">{p.signups || 0} leads · {p.sales || 0} vendas</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-emerald-300">{brl(p.earnings_cents)}</div>
                      <div className="text-[10px] text-zinc-500">pago: {brl(p.paid_out_cents)}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.website && (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-blue-300"
                            title="Visitar site"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar parceiro" : "Novo parceiro"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome *</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="João Silva" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="joao@email.com" />
              </div>
              <div>
                <Label>Telefone / WhatsApp</Label>
                <Input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label>Empresa (opcional)</Label>
                <Input value={editing.company || ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} placeholder="Agência XYZ" />
              </div>
              <div>
                <Label>Tipo de parceiro</Label>
                <Select
                  value={editing.type || "creator"}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Comissão (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editing.commission_percent ?? 20}
                  onChange={(e) => setEditing({ ...editing, commission_percent: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Slug (código do link)</Label>
                <Input
                  value={editing.slug || ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="auto-gerado se vazio"
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="pending">Pendente</option>
                  <option value="active">Ativo</option>
                  <option value="blocked">Bloqueado</option>
                  <option value="paid">Pago</option>
                </Select>
              </div>
              <div>
                <Label>Website (opcional)</Label>
                <Input value={editing.website || ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>Instagram (opcional)</Label>
                <Input value={editing.instagram || ""} onChange={(e) => setEditing({ ...editing, instagram: e.target.value })} placeholder="@usuario" />
              </div>
              <div className="sm:col-span-2">
                <Label>Notas (interno)</Label>
                <Textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} placeholder="Contrato, condições especiais, etc." />
              </div>
            </div>

            {/* Preview do link */}
            {editing.slug && (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-xs">
                <div className="text-zinc-400 mb-1">Link de divulgação:</div>
                <code className="font-mono text-emerald-300 break-all">
                  {typeof window !== "undefined" ? window.location.origin : "https://clodoaldo.vercel.app"}/?ref={editing.slug}
                </code>
              </div>
            )}

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

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "emerald" | "blue" | "amber" | "rose" | "violet";
}) {
  const accents = {
    emerald: "text-emerald-300 bg-emerald-500/10 ring-emerald-500/20",
    blue: "text-blue-300 bg-blue-500/10 ring-blue-500/20",
    amber: "text-amber-300 bg-amber-500/10 ring-amber-500/20",
    rose: "text-rose-300 bg-rose-500/10 ring-rose-500/20",
    violet: "text-violet-300 bg-violet-500/10 ring-violet-500/20",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-1 truncate text-xl font-bold text-white lg:text-2xl">{value}</div>
          {hint && <div className="mt-0.5 truncate text-[10px] text-zinc-500">{hint}</div>}
        </div>
        {Icon && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
