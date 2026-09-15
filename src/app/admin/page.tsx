"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { KpiCard, Widget, Badge, EmptyState, PeriodFilter, Button } from "@/components/admin/ui";
import { DailySummary } from "@/components/admin/daily-summary";
import { fetchAdminData, brl, num, pct, timeAgo, statusColor } from "@/lib/admin/data";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Mail,
  Bell,
  Activity,
  ArrowRight,
  Trophy,
  Clock,
  Target,
  Zap,
  AlertCircle,
  Send,
  MessageCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Order {
  id: string;
  service_slug: string;
  service_name: string;
  total_cents: number;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  created_at: string;
}

interface Briefing {
  id: string;
  offer_slug: string;
  name: string;
  email: string;
  status: string;
  goal: string;
  created_at: string;
}

interface QueueEntry {
  id: string;
  service_slug: string;
  position: number;
  status: string;
  created_at: string;
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function AdminOverviewPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all">("week");
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [enviosChart, setEnviosChart] = useState<{ data: any[]; totals: any } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersR, leadsR, briefingsR, queueR, statsR, enviosChartR] = await Promise.all([
      fetchAdminData<Order>("orders", 200),
      fetchAdminData<Lead>("leads", 200),
      fetchAdminData<Briefing>("briefings", 200),
      fetchAdminData<QueueEntry>("queue", 500),
      fetch("/api/admin/stats?period=today").then(r => r.json()).catch(() => null),
      fetch("/api/admin/envios/chart?days=14").then(r => r.json()).catch(() => null),
    ]);
    setOrders(ordersR || []);
    setLeads(leadsR || []);
    setBriefings(briefingsR || []);
    setQueue(queueR || []);
    setStats(statsR);
    setEnviosChart(enviosChartR);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const periodStart = (() => {
    const d = new Date(now);
    if (period === "today") d.setHours(0, 0, 0, 0);
    else if (period === "week") d.setDate(d.getDate() - 7);
    else if (period === "month") d.setDate(d.getDate() - 30);
    else d.setFullYear(2000);
    return d;
  })();

  const filteredOrders = orders.filter((o) => new Date(o.created_at) >= periodStart);
  const filteredLeads = leads.filter((l) => new Date(l.created_at) >= periodStart);
  const filteredBriefings = briefings.filter((b) => new Date(b.created_at) >= periodStart);

  const revenueCents = filteredOrders.filter((o) => o.status === "paid").reduce((s, o) => s + (o.total_cents || 0), 0);
  const pendingCents = filteredOrders.filter((o) => o.status === "pending").reduce((s, o) => s + (o.total_cents || 0), 0);
  const conversionRate = filteredLeads.length > 0 ? (filteredOrders.length / filteredLeads.length) * 100 : 0;
  const pendingQueue = queue.filter((q) => q.status === "waiting").length;

  // Chart data: revenue by day for last 14 days
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const chartData = last14.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      const od = new Date(o.created_at);
      return od >= d && od < next && o.status === "paid";
    });
    const dayLeads = leads.filter((l) => {
      const ld = new Date(l.created_at);
      return ld >= d && ld < next;
    });
    return {
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      receita: dayOrders.reduce((s, o) => s + (o.total_cents || 0) / 100, 0),
      pedidos: dayOrders.length,
      leads: dayLeads.length,
    };
  });

  // Top services by revenue
  const byService: Record<string, { name: string; revenue: number; count: number }> = {};
  filteredOrders.forEach((o) => {
    const key = o.service_slug;
    if (!byService[key]) byService[key] = { name: o.service_name || o.service_slug, revenue: 0, count: 0 };
    byService[key].revenue += (o.total_cents || 0) / 100;
    byService[key].count += 1;
  });
  const topServices = Object.entries(byService)
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <AdminShell title="Visão Geral">
      {/* Resumo do dia — IA Assistente (Sprint B) */}
      <DailySummary />

      {/* Top: Welcome + period filter */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-2xl">Bem-vindo de volta 👋</h2>
          <p className="mt-0.5 text-sm text-zinc-400">Acompanhe a saúde do seu negócio em tempo real.</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* KPI Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Receita aprovada"
          value={brl(revenueCents)}
          icon={DollarSign}
          accent="emerald"
          delta={period === "today" ? 0 : undefined}
          deltaLabel={period === "all" ? "total acumulado" : `últimos ${period === "today" ? "dias" : period === "week" ? "7d" : "30d"}`}
        />
        <KpiCard
          label="Pedidos"
          value={num(filteredOrders.length)}
          icon={ShoppingCart}
          accent="blue"
          hint={`${filteredOrders.filter((o) => o.status === "paid").length} pagos · ${filteredOrders.filter((o) => o.status === "pending").length} pendentes`}
        />
        <KpiCard
          label="Leads capturados"
          value={num(filteredLeads.length)}
          icon={Users}
          accent="violet"
          hint={`${filteredBriefings.length} briefings enviados`}
        />
        <KpiCard
          label="Taxa de conversão"
          value={pct(conversionRate)}
          icon={Target}
          accent="amber"
          hint="leads → pedidos"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard label="Receita pendente" value={brl(pendingCents)} icon={Clock} accent="amber" hint="aguardando pagamento" />
        <KpiCard label="Fila de espera" value={num(pendingQueue)} icon={Package} accent="cyan" hint="clientes aguardando vaga" />
        <KpiCard
          label="Ticket médio"
          value={brl(filteredOrders.length > 0 ? revenueCents / Math.max(filteredOrders.filter((o) => o.status === "paid").length, 1) : 0)}
          icon={TrendingUp}
          accent="emerald"
          hint="por pedido pago"
        />
        <KpiCard
          label="Briefings novos"
          value={num(filteredBriefings.filter((b) => b.status === "new").length)}
          icon={Mail}
          accent="rose"
          hint="aguardando resposta"
        />
      </div>

      {/* Prospecting KPIs — bulk sends / prospects */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Disparos hoje"
          value={num(stats?.envios_today ?? 0)}
          icon={Send}
          accent="emerald"
          hint="envios registrados hoje"
        />
        <KpiCard
          label="Total disparos"
          value={num(stats?.envios_total ?? 0)}
          icon={MessageCircle}
          accent="blue"
          hint="histórico completo"
        />
        <KpiCard
          label="Leads prospectados"
          value={num(stats?.prospects_total ?? 0)}
          icon={Users}
          accent="violet"
          hint="no pipeline"
        />
        <KpiCard
          label="Leads contatados"
          value={num(stats?.prospects_contacted ?? 0)}
          icon={Target}
          accent="amber"
          hint={
            stats?.prospects_total
              ? `${Math.round((stats.prospects_contacted / stats.prospects_total) * 100)}% do pipeline`
              : "—"
          }
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Widget
          title="Receita & Pedidos — últimos 14 dias"
          icon={<Activity className="h-4 w-4 text-emerald-400" />}
          className="lg:col-span-2"
          action={
            <Link href="/admin/analytics" className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300">
              Ver detalhes →
            </Link>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#g1)"
                  name="Receita (R$)"
                />
                <Area
                  type="monotone"
                  dataKey="pedidos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#g2)"
                  name="Pedidos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Top serviços" icon={<Trophy className="h-4 w-4 text-amber-400" />}>
          {topServices.length === 0 ? (
            <EmptyState title="Sem dados ainda" description="Os serviços mais vendidos aparecerão aqui." icon={<Trophy className="h-8 w-8" />} />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topServices}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {topServices.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a0f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>
      </div>

      {/* === Envios & Respostas chart === */}
      {enviosChart && enviosChart.data && (
        <Widget
          title="Disparos & Respostas — últimos 14 dias"
          icon={<Send className="h-4 w-4 text-emerald-400" />}
          className="mt-6"
          action={
            <Link href="/admin/parceiros" className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300">
              Ver envios →
            </Link>
          }
        >
          {/* Stats badges */}
          {enviosChart.totals && (
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-300">
                <Send className="h-3 w-3" />
                {enviosChart.totals.envios || 0} disparos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 font-semibold text-blue-300">
                <Mail className="h-3 w-3" />
                {enviosChart.totals.respostas || 0} respostas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-300">
                <Target className="h-3 w-3" />
                {enviosChart.totals.replyRate || 0}% taxa de resposta
              </span>
            </div>
          )}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enviosChart.data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="g-envios" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-respostas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Area
                  type="monotone"
                  dataKey="envios"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#g-envios)"
                  name="Disparos"
                />
                <Area
                  type="monotone"
                  dataKey="respostas"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#g-respostas)"
                  name="Respostas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Widget>
      )}

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Widget
          title="Pedidos recentes"
          icon={<ShoppingCart className="h-4 w-4 text-emerald-400" />}
          action={
            <Link href="/admin/orders" className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300">
              Ver todos →
            </Link>
          }
        >
          {orders.length === 0 ? (
            <EmptyState title="Nenhum pedido ainda" description="Os pedidos aparecerão aqui assim que recebermos." icon={<ShoppingCart className="h-8 w-8" />} />
          ) : (
            <div className="-mx-2 divide-y divide-white/5">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center gap-3 px-2 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-200">{o.service_name || o.service_slug}</div>
                    <div className="truncate text-[11px] text-zinc-500">{o.customer_email || o.customer_name || "—"}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-white">{brl(o.total_cents)}</span>
                    <Badge variant={statusColor(o.status)}>{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Widget>

        <Widget
          title="Briefings & leads recentes"
          icon={<Mail className="h-4 w-4 text-blue-400" />}
          action={
            <Link href="/admin/briefings" className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300">
              Ver todos →
            </Link>
          }
        >
          {briefings.length === 0 && leads.length === 0 ? (
            <EmptyState title="Sem atividade" description="Briefings e leads aparecerão aqui." icon={<Mail className="h-8 w-8" />} />
          ) : (
            <div className="-mx-2 divide-y divide-white/5">
              {briefings.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-2 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-200">{b.name} · {b.offer_slug}</div>
                    <div className="truncate text-[11px] text-zinc-500">{b.email} · {timeAgo(b.created_at)}</div>
                  </div>
                  <Badge variant={statusColor(b.status)}>{b.status}</Badge>
                </div>
              ))}
              {leads.slice(0, 2).map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-2 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-200">{l.name}</div>
                    <div className="truncate text-[11px] text-zinc-500">{l.email} · {timeAgo(l.created_at)}</div>
                  </div>
                  <Badge variant="info">{l.source}</Badge>
                </div>
              ))}
            </div>
          )}
        </Widget>
      </div>

      {/* Quick actions */}
      <Widget
        title="Ações rápidas"
        icon={<Zap className="h-4 w-4 text-amber-400" />}
        className="mt-4"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/admin/parceiros" icon={<Send className="h-4 w-4" />} title="Prospecção" desc="Disparo em massa" />
          <QuickAction href="/admin/coupons" icon={<Trophy className="h-4 w-4" />} title="Criar cupom" desc="Promoção sazonal" />
          <QuickAction href="/admin/testimonials" icon={<Target className="h-4 w-4" />} title="Adicionar depoimento" desc="Prova social" />
          <QuickAction href="/admin/countdown" icon={<Clock className="h-4 w-4" />} title="Contagem regressiva" desc="Criar urgência" />
          <QuickAction href="/admin/affiliates" icon={<Users className="h-4 w-4" />} title="Cadastrar afiliado" desc="Vender mais" />
          <QuickAction href="/admin/pixels" icon={<Activity className="h-4 w-4" />} title="Configurar pixel" desc="Meta / Google" />
          <QuickAction href="/admin/whatsapp" icon={<Mail className="h-4 w-4" />} title="Configurar WhatsApp" desc="Atendimento" />
          <QuickAction href="/admin/email" icon={<Bell className="h-4 w-4" />} title="E-mail marketing" desc="Nutrir leads" />
          <QuickAction href="/admin/settings" icon={<AlertCircle className="h-4 w-4" />} title="Configurações" desc="Sistema" />
        </div>
      </Widget>
    </AdminShell>
  );
}

function QuickAction({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-emerald-500/20 hover:bg-emerald-500/[0.04]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-zinc-200">{title}</div>
        <div className="truncate text-[11px] text-zinc-500">{desc}</div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
    </Link>
  );
}
