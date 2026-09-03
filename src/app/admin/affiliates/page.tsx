"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Select, Textarea } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, brl, formatDateTime, fetchAdminData, statusColor } from "@/lib/admin/data";
import { UserPlus, Plus, RefreshCw, Pencil, Trash2, X, Save, ExternalLink, Copy, Check, Users, DollarSign } from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pix_key: string | null;
  slug: string;
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

const EMPTY: Partial<Affiliate> = {
  name: "",
  email: "",
  phone: "",
  pix_key: "",
  slug: "",
  commission_percent: 20,
  status: "active",
  notes: "",
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

export default function AdminAffiliatesPage() {
  const [items, setItems] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Affiliate> | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Affiliate>("affiliates", 500);
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
      slug: editing.slug || genSlug(editing.name || "afiliado"),
      commission_percent: Number(editing.commission_percent) || 20,
    };
    const { error } = editing.id
      ? adminUpdate("affiliates", editing.id, payload)
      : adminInsert("affiliates", payload);
    setSaving(false);
    if (error) return alert("Erro: " + error.message);
    setEditing(null);
    await load();
  }

  async function remove(a: Affiliate) {
    if (!confirm(`Remover afiliado ${a.name}?`)) return;
    const { error } = adminDelete("affiliates", a.id);
    if (error) return alert("Erro: " + error.message);
    await load();
  }

  async function toggleStatus(a: Affiliate) {
    const next = a.status === "active" ? "blocked" : "active";
    const { error } = adminUpdate("affiliates", a.id, { status: next });
    if (error) return alert("Erro: " + error.message);
    await load();
  }

  function copyLink(a: Affiliate) {
    const link = `${window.location.origin}/?ref=${a.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(a.id);
    setTimeout(() => setCopied(null), 1500);
  }

  const totalEarnings = items.reduce((s, a) => s + (a.earnings_cents || 0), 0);
  const totalPaid = items.reduce((s, a) => s + (a.paid_out_cents || 0), 0);
  const totalClicks = items.reduce((s, a) => s + (a.clicks || 0), 0);
  const totalSales = items.reduce((s, a) => s + (a.sales || 0), 0);

  return (
    <AdminShell title="Afiliados">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Afiliados" value={String(items.length)} icon={<Users className="h-3.5 w-3.5" />} />
        <StatBox label="Cliques gerados" value={String(totalClicks)} accent="blue" icon={<UserPlus className="h-3.5 w-3.5" />} />
        <StatBox label="Vendas via afiliados" value={String(totalSales)} accent="violet" icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatBox label="Comissões a pagar" value={brl(totalEarnings - totalPaid)} accent="amber" icon={<DollarSign className="h-3.5 w-3.5" />} />
      </div>

      <Widget
        title="Programa de afiliados"
        icon={<UserPlus className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-3.5 w-3.5" /> Novo afiliado
            </Button>
          </div>
        }
      >
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-xs text-emerald-200">
          <strong>Como funciona:</strong> Cada afiliado recebe um link único <code className="rounded bg-emerald-500/10 px-1">?ref=SLUG</code>.
          Quando um cliente compra via esse link, o afiliado ganha comissão automática. Os links funcionam em todas as páginas.
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum afiliado"
            description="Cadastre afiliados para vender mais sem custo de ads."
            icon={<UserPlus className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Cadastrar afiliado</Button>}
          />
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Afiliado</th>
                  <th className="px-3 py-2 font-medium">Link</th>
                  <th className="px-3 py-2 font-medium">Comissão</th>
                  <th className="px-3 py-2 font-medium">Métricas</th>
                  <th className="px-3 py-2 font-medium">Ganhos</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-200">{a.name}</div>
                      <div className="text-[11px] text-zinc-500">{a.email}</div>
                      {a.pix_key && <div className="text-[10px] text-zinc-600">PIX: {a.pix_key}</div>}
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => copyLink(a)} className="inline-flex items-center gap-1 font-mono text-xs text-emerald-300 hover:text-emerald-200">
                        /?ref={a.slug}
                        {copied === a.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-amber-300">{a.commission_percent}%</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="text-zinc-300">{a.clicks || 0} cliques</div>
                      <div className="text-zinc-500">{a.signups || 0} cadastros · {a.sales || 0} vendas</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-emerald-300">{brl(a.earnings_cents)}</div>
                      <div className="text-[10px] text-zinc-500">pago: {brl(a.paid_out_cents)}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusColor(a.status)}>{a.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(a)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(a)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar afiliado" : "Novo afiliado"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="João Silva" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="joao@email.com" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label>Chave PIX</Label>
                <Input value={editing.pix_key || ""} onChange={(e) => setEditing({ ...editing, pix_key: e.target.value })} placeholder="email/cpf/telefone/aleatoria" />
              </div>
              <div>
                <Label>Slug (código do afiliado)</Label>
                <Input
                  value={editing.slug || ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="auto-gerado se vazio"
                  className="font-mono"
                />
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
                <Label>Status</Label>
                <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="pending">Pendente</option>
                  <option value="active">Ativo</option>
                  <option value="blocked">Bloqueado</option>
                  <option value="paid">Pago</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Notas (interno)</Label>
                <Textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} />
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

function StatBox({
  label,
  value,
  icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "emerald" | "amber" | "rose" | "blue" | "violet";
}) {
  const accents = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
    violet: "text-violet-300",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
        <div className="text-zinc-500">{icon}</div>
      </div>
      <div className={`mt-1 text-2xl font-bold ${accents[accent]}`}>{value}</div>
    </div>
  );
}
