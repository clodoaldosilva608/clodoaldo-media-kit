"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button } from "@/components/admin/ui";
import { fetchAdminData, timeAgo, formatDateTime, statusColor } from "@/lib/admin/data";
import { ListOrdered, RefreshCw, Users } from "lucide-react";

interface QueueEntry {
  id: string;
  service_slug: string;
  position: number;
  status: string;
  cycle_month: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function AdminQueuePage() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"service" | "cycle">("service");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<QueueEntry>("queue", 1000);
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups: Record<string, QueueEntry[]> = {};
  entries.forEach((e) => {
    const key = groupBy === "service" ? e.service_slug : e.cycle_month?.slice(0, 7) || "—";
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  return (
    <AdminShell title="Fila de Espera">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total na fila" value={String(entries.length)} />
        <StatBox label="Aguardando" value={String(entries.filter((e) => e.status === "waiting").length)} accent="amber" />
        <StatBox label="Em checkout" value={String(entries.filter((e) => e.status === "checkout_started").length)} accent="blue" />
        <StatBox label="Pagos" value={String(entries.filter((e) => e.status === "paid").length)} accent="emerald" />
      </div>

      <Widget
        title="Entradas da fila"
        icon={<ListOrdered className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setGroupBy(groupBy === "service" ? "cycle" : "service")}>
              Agrupar por: {groupBy === "service" ? "Serviço" : "Ciclo"}
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : entries.length === 0 ? (
          <EmptyState title="Fila vazia" description="Nenhum cliente entrou na fila ainda." icon={<Users className="h-8 w-8" />} />
        ) : (
          <div className="space-y-5">
            {Object.entries(groups).map(([key, items]) => (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{key}</h4>
                  <Badge variant="muted">{items.length} {items.length === 1 ? "entrada" : "entradas"}</Badge>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/5">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Posição</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Ciclo</th>
                        <th className="px-3 py-2 font-medium">Entrou em</th>
                        <th className="px-3 py-2 font-medium">Atualizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {items.map((e) => (
                        <tr key={e.id} className="hover:bg-white/[0.02]">
                          <td className="px-3 py-2.5">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300">
                              {e.position}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant={statusColor(e.status)}>{e.status}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-zinc-300">{e.cycle_month?.slice(0, 10) || "—"}</td>
                          <td className="px-3 py-2.5 text-[12px] text-zinc-400">{formatDateTime(e.created_at)}</td>
                          <td className="px-3 py-2.5 text-[12px] text-zinc-500">{timeAgo(e.updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>
    </AdminShell>
  );
}

function StatBox({ label, value, accent = "blue" }: { label: string; value: string; accent?: "emerald" | "amber" | "rose" | "blue" }) {
  const accents = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accents[accent]}`}>{value}</div>
    </div>
  );
}
