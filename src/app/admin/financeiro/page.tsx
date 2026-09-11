"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button } from "@/components/admin/ui";
import {
  RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle,
  Coins, FileWarning,
} from "lucide-react";
import { brl } from "@/lib/admin/data";

export default function ReconciliationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/admin/finance/reconciliation");
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Erro ${resp.status}`);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary;

  return (
    <AdminShell title="Reconciliação Financeira">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Compara pedidos locais com eventos de pagamento do gateway. Identifica divergências de status, valor e duplicidades.
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-zinc-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Comparando…</div>
      ) : s ? (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatBox label="Pedidos sem pagamento" value={String(s.orders_without_payment)} accent={s.orders_without_payment > 0 ? "amber" : "emerald"} icon={FileWarning} />
            <StatBox label="Pagamentos sem pedido" value={String(s.payments_without_order)} accent={s.payments_without_order > 0 ? "amber" : "emerald"} icon={AlertTriangle} />
            <StatBox label="Status divergente" value={String(s.status_mismatches)} accent={s.status_mismatches > 0 ? "rose" : "emerald"} icon={XCircle} />
            <StatBox label="Valor divergente" value={String(s.amount_mismatches)} accent={s.amount_mismatches > 0 ? "rose" : "emerald"} icon={Coins} />
            <StatBox label="Pagamentos duplicados" value={String(s.duplicate_payments)} accent={s.duplicate_payments > 0 ? "rose" : "emerald"} icon={AlertTriangle} />
          </div>

          {s.orders_without_payment === 0 && s.payments_without_order === 0 && s.status_mismatches === 0 && s.amount_mismatches === 0 && s.duplicate_payments === 0 ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-200">Tudo reconciliado!</h3>
              <p className="text-xs text-zinc-400 mt-1">Nenhuma divergência encontrada entre pedidos e pagamentos.</p>
            </div>
          ) : (
            <>
              {/* Pedidos sem pagamento */}
              {data.orders_without_payment.length > 0 && (
                <Widget title={`Pedidos sem pagamento (${data.orders_without_payment.length})`} icon={<FileWarning className="h-4 w-4 text-amber-400" />} className="mt-4">
                  <p className="text-[11px] text-zinc-500 mb-3">Pedidos criados mas sem evento de pagamento no gateway. Pode ser checkout abandonado ou webhook não configurado.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                          <th className="py-2 pr-3">Pedido</th>
                          <th className="py-2 pr-3">Cliente</th>
                          <th className="py-2 pr-3">Valor</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Criado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orders_without_payment.slice(0, 20).map((o: any) => (
                          <tr key={o.id} className="border-b border-white/5">
                            <td className="py-2 pr-3 font-mono text-[10px] text-zinc-400">{o.id.slice(0, 8)}</td>
                            <td className="py-2 pr-3 text-zinc-300">{o.customer_email || "—"}</td>
                            <td className="py-2 pr-3 text-zinc-300">{brl(o.total_cents)}</td>
                            <td className="py-2 pr-3"><Badge variant="warning">{o.status}</Badge></td>
                            <td className="py-2 pr-3 text-zinc-500">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Widget>
              )}

              {/* Status divergentes */}
              {data.status_mismatches.length > 0 && (
                <Widget title={`Status divergente (${data.status_mismatches.length})`} icon={<XCircle className="h-4 w-4 text-rose-400" />} className="mt-4">
                  <p className="text-[11px] text-zinc-500 mb-3">Pedido marcado como "paid" mas gateway não confirmou (ou vice-versa). Pode indicar webhook quebrado ou atualização manual indevida.</p>
                  <div className="space-y-2">
                    {data.status_mismatches.slice(0, 20).map((m: any, i: number) => (
                      <div key={i} className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-[10px] text-zinc-400">{m.order_id.slice(0, 8)}</code>
                          <span className="text-[10px] text-zinc-500">{new Date(m.received_at).toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-zinc-300">
                          <span>Pedido: <Badge variant={m.order_status === "paid" ? "success" : "warning"}>{m.order_status}</Badge></span>
                          <span>Gateway ({m.gateway}): <Badge variant={m.payment_status === "paid" ? "success" : "warning"}>{m.payment_status}</Badge></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Widget>
              )}

              {/* Valor divergente */}
              {data.amount_mismatches.length > 0 && (
                <Widget title={`Valor divergente (${data.amount_mismatches.length})`} icon={<Coins className="h-4 w-4 text-rose-400" />} className="mt-4">
                  <p className="text-[11px] text-zinc-500 mb-3">Valor do pedido ≠ valor recebido no gateway. Pode indicar cobrança parcial, juros, ou erro de cadastro.</p>
                  <div className="space-y-2">
                    {data.amount_mismatches.slice(0, 20).map((m: any, i: number) => (
                      <div key={i} className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-[10px] text-zinc-400">{m.order_id.slice(0, 8)}</code>
                          <span className="text-[10px] text-zinc-500">{new Date(m.received_at).toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-zinc-300">
                          <span>Pedido: <strong className="text-white">{brl(m.order_cents)}</strong></span>
                          <span>→</span>
                          <span>Pago: <strong className="text-rose-300">{brl(m.payment_cents)}</strong></span>
                          <span className="text-rose-400">({brl(m.payment_cents - m.order_cents)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Widget>
              )}

              {/* Duplicados */}
              {data.duplicate_payments.length > 0 && (
                <Widget title={`Pagamentos duplicados (${data.duplicate_payments.length})`} icon={<AlertTriangle className="h-4 w-4 text-rose-400" />} className="mt-4">
                  <p className="text-[11px] text-zinc-500 mb-3">Pedidos com 2+ eventos "paid". Pode indicar webhook duplicado — considerar reembolso de um dos pagamentos.</p>
                  <div className="space-y-2">
                    {data.duplicate_payments.slice(0, 20).map((d: any, i: number) => (
                      <div key={i} className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-[10px] text-zinc-400">{d.order_id?.slice(0, 8) || "(sem order_id)"}</code>
                          <Badge variant="danger">{d.paid_count}x pago</Badge>
                        </div>
                        <div className="mt-1 text-[10px] text-zinc-500">Event IDs: {d.event_ids?.join(", ")}</div>
                      </div>
                    ))}
                  </div>
                </Widget>
              )}
            </>
          )}
        </>
      ) : null}
    </AdminShell>
  );
}

function StatBox({ label, value, accent, icon: Icon }: { label: string; value: string; accent: "emerald" | "amber" | "rose"; icon: any }) {
  const colors = {
    emerald: "border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-300",
    amber: "border-amber-500/20 bg-amber-500/[0.03] text-amber-300",
    rose: "border-rose-500/20 bg-rose-500/[0.03] text-rose-300",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[accent]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
        </div>
        <Icon className="h-5 w-5 opacity-60" />
      </div>
    </div>
  );
}
