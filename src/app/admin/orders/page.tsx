"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Select } from "@/components/admin/ui";
import { fetchAdminData, brl, timeAgo, formatDateTime, statusColor } from "@/lib/admin/data";
import { ShoppingCart, Search, Download, RefreshCw, Filter, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  service_slug: string;
  service_name: string;
  total_cents: number;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  addons: any[];
  answers: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Order>("orders", 500);
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.service_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + (o.total_cents || 0), 0);
  const pendingRevenue = orders.filter((o) => o.status === "pending").reduce((s, o) => s + (o.total_cents || 0), 0);

  async function updateStatus(order: Order, status: string) {
    const { error } = await adminUpdate("orders", order.id, { status, updated_at: new Date().toISOString() });
    if (error) {
      alert("Erro ao atualizar: " + error.message);
      return;
    }
    await load();
    if (selected?.id === order.id) setSelected({ ...order, status });
  }

  function exportCSV() {
    const rows = [
      ["ID", "Serviço", "Cliente", "Email", "Total", "Status", "Criado em"],
      ...filtered.map((o) => [
        o.id,
        o.service_name || o.service_slug,
        o.customer_name || "",
        o.customer_email || "",
        (o.total_cents / 100).toFixed(2),
        o.status,
        new Date(o.created_at).toLocaleString("pt-BR"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell title="Pedidos">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total de pedidos" value={String(orders.length)} accent="emerald" />
        <StatBox label="Pagos" value={String(orders.filter((o) => o.status === "paid").length)} accent="emerald" />
        <StatBox label="Receita aprovada" value={brl(totalRevenue)} accent="emerald" />
        <StatBox label="Pendente" value={brl(pendingRevenue)} accent="amber" />
      </div>

      <Widget
        title="Todos os pedidos"
        icon={<ShoppingCart className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Buscar por cliente, email, serviço…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="refunded">Reembolsado</option>
            <option value="failed">Falhou</option>
            <option value="cancelled">Cancelado</option>
          </Select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum pedido encontrado" description="Ajuste os filtros ou aguarde novos pedidos." icon={<ShoppingCart className="h-8 w-8" />} />
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Serviço</th>
                  <th className="px-3 py-2 font-medium">Cliente</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-200">{o.service_name || o.service_slug}</div>
                      <div className="text-[11px] text-zinc-500">{o.service_slug}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-zinc-300">{o.customer_name || "—"}</div>
                      <div className="text-[11px] text-zinc-500">{o.customer_email || "—"}</div>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-white">{brl(o.total_cents)}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusColor(o.status)}>{o.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-zinc-400">
                      <div>{formatDateTime(o.created_at)}</div>
                      <div className="text-[10px] text-zinc-600">{timeAgo(o.created_at)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(o)}>
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-2xl rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selected.service_name || selected.service_slug}</h3>
                <p className="text-xs text-zinc-500">Pedido · {selected.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                ✕
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Cliente" value={selected.customer_name || "—"} />
              <Detail label="Email" value={selected.customer_email || "—"} />
              <Detail label="Total" value={brl(selected.total_cents)} />
              <Detail label="Status atual" value={<Badge variant={statusColor(selected.status)}>{selected.status}</Badge>} />
              <Detail label="Criado em" value={formatDateTime(selected.created_at)} />
              <Detail label="Atualizado em" value={formatDateTime(selected.updated_at)} />
            </div>

            {selected.addons && selected.addons.length > 0 && (
              <div className="mt-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Add-ons</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.addons.map((a: any, i: number) => (
                    <Badge key={i} variant="muted">{typeof a === "string" ? a : a?.name || JSON.stringify(a)}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selected.answers && Object.keys(selected.answers).length > 0 && (
              <div className="mt-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Respostas do briefing</div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  {Object.entries(selected.answers).map(([k, v]) => (
                    <div key={k} className="flex gap-2 py-0.5 text-xs">
                      <span className="font-medium text-zinc-400">{k}:</span>
                      <span className="text-zinc-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-white/5 pt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Alterar status</div>
              <div className="flex flex-wrap gap-2">
                {["pending", "paid", "refunded", "failed", "cancelled"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selected.status === s ? "primary" : "outline"}
                    onClick={() => updateStatus(selected, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent: "emerald" | "amber" | "rose" | "blue" }) {
  const accents = {
    emerald: "from-emerald-500/10 to-emerald-500/[0.02] text-emerald-300",
    amber: "from-amber-500/10 to-amber-500/[0.02] text-amber-300",
    rose: "from-rose-500/10 to-rose-500/[0.02] text-rose-300",
    blue: "from-blue-500/10 to-blue-500/[0.02] text-blue-300",
  };
  return (
    <div className={cn("rounded-2xl border border-white/5 bg-gradient-to-br p-4", accents[accent])}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-0.5 text-sm text-zinc-200">{value}</div>
    </div>
  );
}
