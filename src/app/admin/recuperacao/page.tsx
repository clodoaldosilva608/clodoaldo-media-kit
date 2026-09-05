"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Widget,
  Badge,
  Button,
  Input,
  Select,
  KpiCard,
  EmptyState,
} from "@/components/admin/ui";
import {
  ShoppingCart,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Mail,
  Phone,
  ExternalLink,
  RotateCw,
  Trophy,
  AlertCircle,
} from "lucide-react";

interface Cart {
  id: string;
  session_id: string;
  service_slug: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total_cents: number;
  created_at: string;
  updated_at: string | null;
  recovery_email_sent: boolean;
  recovery_variant: "A" | "B" | "C" | null;
  recovery_link: string | null;
  recovery_attempted_at: string | null;
  recovered: boolean;
  recovered_order_id: string | null;
}

interface ABStat {
  variant: string;
  name: string;
  description: string;
  sent: number;
  recovered: number;
  conversion_rate: number;
}

interface Summary {
  total: number;
  pending: number;
  sent_not_recovered: number;
  recovered: number;
  potential_revenue_cents: number;
  recovered_revenue_cents: number;
  recovery_rate: number;
}

const VARIANT_BADGE: Record<string, { color: string; label: string }> = {
  A: { color: "bg-blue-500/15 text-blue-300 ring-blue-500/20", label: "A — Ajuda" },
  B: { color: "bg-amber-500/15 text-amber-300 ring-amber-500/20", label: "B — Urgência" },
  C: { color: "bg-violet-500/15 text-violet-300 ring-violet-500/20", label: "C — Cupom" },
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function AdminRecuperacaoPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [abStats, setAbStats] = useState<ABStat[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [variantFilter, setVariantFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (variantFilter !== "all") params.set("variant", variantFilter);
      params.set("limit", "200");
      const resp = await fetch(`/api/admin/recovery?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Erro");
      setCarts(json.carts || []);
      setAbStats(json.stats?.ab_variants || []);
      setSummary(json.stats?.summary || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, variantFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(cartId: string, action: "mark_recovered" | "resend") {
    try {
      const resp = await fetch("/api/admin/recovery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cartId, action }),
      });
      if (!resp.ok) {
        const j = await resp.json();
        alert(j.error || "Erro");
        return;
      }
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const filteredCarts = carts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customer_name?.toLowerCase().includes(q) ||
      c.customer_email?.toLowerCase().includes(q) ||
      c.customer_phone?.toLowerCase().includes(q) ||
      c.service_slug.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell title="Recuperação de Carrinhos">
      <div className="space-y-6">
        {/* KPIs */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              label="Total Carts"
              value={summary.total}
              icon={ShoppingCart}
              accent="blue"
            />
            <KpiCard
              label="Pendentes"
              value={summary.pending}
              icon={Clock}
              accent="amber"
              hint="Aguardando cron"
            />
            <KpiCard
              label="Enviados"
              value={summary.sent_not_recovered}
              icon={Mail}
              accent="violet"
              hint="Sem conversão"
            />
            <KpiCard
              label="Recuperados"
              value={summary.recovered}
              icon={CheckCircle2}
              accent="emerald"
            />
            <KpiCard
              label="Receita Recuperada"
              value={formatCurrency(summary.recovered_revenue_cents)}
              icon={DollarSign}
              accent="emerald"
            />
            <KpiCard
              label="Taxa de Recuperação"
              value={`${summary.recovery_rate}%`}
              icon={TrendingUp}
              accent="cyan"
            />
          </div>
        )}

        {/* A/B Test Panel */}
        <Widget
          title="A/B Test — Variantes de Recuperação"
          icon={<Trophy className="h-4 w-4 text-amber-400" />}
        >
          {abStats.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="h-8 w-8 text-zinc-600" />}
              title="Sem dados ainda"
              description="Quando o cron rodar, as métricas das 3 variantes aparecerão aqui."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {abStats.map((stat) => {
                const v = VARIANT_BADGE[stat.variant] || VARIANT_BADGE.A;
                const isWinner =
                  stat.conversion_rate ===
                  Math.max(...abStats.map((s) => s.conversion_rate));
                return (
                  <div
                    key={stat.variant}
                    className={`relative rounded-xl border p-4 ${
                      isWinner && stat.recovered > 0
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    {isWinner && stat.recovered > 0 && (
                      <div className="absolute -top-2 left-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        🏆 Líder
                      </div>
                    )}
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${v.color}`}
                      >
                        {v.label}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {stat.conversion_rate}%
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-zinc-400">{stat.description}</p>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <div className="text-zinc-500">Enviadas</div>
                        <div className="font-semibold text-white">{stat.sent}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Recuperadas</div>
                        <div className="font-semibold text-emerald-300">
                          {stat.recovered}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Widget>

        {/* Filters */}
        <Widget
          title="Carrinhos Abandonados"
          icon={<ShoppingCart className="h-4 w-4 text-blue-400" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              <span className="ml-1">Atualizar</span>
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Input
              placeholder="Buscar por nome, email, telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="max-w-[180px]"
            >
              <option value="all">Todos status</option>
              <option value="pending">Pendentes</option>
              <option value="sent">Enviados</option>
              <option value="recovered">Recuperados</option>
            </Select>
            <Select
              value={variantFilter}
              onChange={(e) => setVariantFilter(e.target.value)}
              className="max-w-[180px]"
            >
              <option value="all">Todas variantes</option>
              <option value="A">A — Ajuda</option>
              <option value="B">B — Urgência</option>
              <option value="C">C — Cupom</option>
            </Select>
          </div>

          {error && (
            <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-zinc-500">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
              Carregando...
            </div>
          ) : filteredCarts.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8 text-zinc-600" />}
              title="Nenhum carrinho encontrado"
              description="Carrinhos abandonados aparecerão aqui automaticamente."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Serviço</th>
                    <th className="py-2 pr-3">Valor</th>
                    <th className="py-2 pr-3">Tempo</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Variante</th>
                    <th className="py-2 pr-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCarts.map((cart) => (
                    <tr
                      key={cart.id}
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-medium text-white">
                          {cart.customer_name || "(sem nome)"}
                        </div>
                        {cart.customer_email && (
                          <div className="text-xs text-zinc-500">
                            {cart.customer_email}
                          </div>
                        )}
                        {cart.customer_phone && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Phone className="h-3 w-3" />
                            {cart.customer_phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="text-zinc-300">
                          {cart.service_slug.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-semibold text-white">
                        {formatCurrency(cart.total_cents)}
                      </td>
                      <td className="py-3 pr-3 text-xs text-zinc-400">
                        {timeAgo(cart.created_at)}
                      </td>
                      <td className="py-3 pr-3">
                        {cart.recovered ? (
                          <Badge variant="success">Recuperado</Badge>
                        ) : cart.recovery_email_sent ? (
                          <Badge variant="info">Enviado</Badge>
                        ) : (
                          <Badge variant="warning">Pendente</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {cart.recovery_variant &&
                          VARIANT_BADGE[cart.recovery_variant] && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${
                                VARIANT_BADGE[cart.recovery_variant].color
                              }`}
                            >
                              {cart.recovery_variant}
                            </span>
                          )}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <div className="flex justify-end gap-1">
                          {/* WhatsApp button */}
                          {cart.recovery_link ? (
                            <a
                              href={cart.recovery_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25"
                              title="Enviar mensagem de recuperação no WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                              WhatsApp
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-600">
                              Aguardando cron
                            </span>
                          )}
                          {/* Mark recovered */}
                          {!cart.recovered && (
                            <button
                              onClick={() => handleAction(cart.id, "mark_recovered")}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25"
                              title="Marcar como recuperado manualmente"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </button>
                          )}
                          {/* Resend */}
                          {cart.recovery_email_sent && !cart.recovered && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Reenviar notificação de recuperação? O cron vai pegar este cart na próxima execução.",
                                  )
                                ) {
                                  handleAction(cart.id, "resend");
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/20 hover:bg-blue-500/25"
                              title="Reenviar notificação"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Widget>
      </div>
    </AdminShell>
  );
}
