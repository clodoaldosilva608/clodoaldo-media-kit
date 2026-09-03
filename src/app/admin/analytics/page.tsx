"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, EmptyState, PeriodFilter, Badge } from "@/components/admin/ui";
import { fetchAdminData, brl, num, pct } from "@/lib/admin/data";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Activity,
  Globe,
  Monitor,
  Smartphone,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
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
  created_at: string;
}

interface AnalyticsEvent {
  id: string;
  event_name: string;
  path: string | null;
  offer_slug: string | null;
  created_at: string;
  props: Record<string, any>;
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all">("month");
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersR, eventsR] = await Promise.all([
      fetchAdminData<Order>("orders", 1000),
      fetchAdminData<AnalyticsEvent>("analytics_events", 2000),
    ]);
    setOrders(ordersR || []);
    setEvents(eventsR || []);
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
  const filteredEvents = events.filter((e) => new Date(e.created_at) >= periodStart);

  // Revenue by day (last 30 days)
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const dailyData = last30.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = filteredOrders.filter((o) => {
      const od = new Date(o.created_at);
      return od >= d && od < next && o.status === "paid";
    });
    const dayEvents = filteredEvents.filter((e) => {
      const ed = new Date(e.created_at);
      return ed >= d && ed < next;
    });
    return {
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      receita: dayOrders.reduce((s, o) => s + (o.total_cents || 0) / 100, 0),
      pedidos: dayOrders.length,
      visitas: dayEvents.filter((e) => e.event_name === "page_view" || e.event_name === "PageView").length,
      leads: dayEvents.filter((e) => e.event_name === "lead" || e.event_name === "Lead").length,
    };
  });

  // Top events
  const eventCounts: Record<string, number> = {};
  filteredEvents.forEach((e) => {
    eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
  });
  const topEvents = Object.entries(eventCounts)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Top paths
  const pathCounts: Record<string, number> = {};
  filteredEvents.forEach((e) => {
    if (e.path) {
      pathCounts[e.path] = (pathCounts[e.path] || 0) + 1;
    }
  });
  const topPaths = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top services
  const serviceCounts: Record<string, { name: string; revenue: number; orders: number }> = {};
  filteredOrders.forEach((o) => {
    const key = o.service_slug;
    if (!serviceCounts[key]) serviceCounts[key] = { name: o.service_name || o.service_slug, revenue: 0, orders: 0 };
    serviceCounts[key].revenue += (o.total_cents || 0) / 100;
    serviceCounts[key].orders += 1;
  });
  const topServices = Object.entries(serviceCounts)
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // Conversion funnel
  const visits = filteredEvents.filter((e) => e.event_name === "page_view" || e.event_name === "PageView").length;
  const checkouts = filteredEvents.filter((e) => e.event_name === "InitiateCheckout" || e.event_name === "checkout_started").length;
  const purchases = filteredOrders.filter((o) => o.status === "paid").length;
  const funnel = [
    { stage: "Visitas", value: visits || 1, color: "#3b82f6" },
    { stage: "Checkout iniciado", value: checkouts, color: "#f59e0b" },
    { stage: "Compra paga", value: purchases, color: "#10b981" },
  ];

  return (
    <AdminShell title="Analytics">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">Acompanhe métricas de tráfego, conversão e vendas.</p>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI label="Visitas" value={num(visits)} icon={Globe} accent="blue" />
        <KPI label="Checkouts" value={num(checkouts)} icon={ShoppingCart} accent="amber" />
        <KPI label="Compras" value={num(purchases)} icon={TrendingUp} accent="emerald" />
        <KPI label="Conversão" value={pct(visits > 0 ? (purchases / visits) * 100 : 0)} icon={Activity} accent="violet" />
      </div>

      {/* Revenue chart */}
      <Widget title="Receita diária — últimos 30 dias" icon={<BarChart3 className="h-4 w-4 text-emerald-400" />} className="mb-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#fafafa" }}
                formatter={(v: any, n: string) => (n === "receita" ? `R$ ${Number(v).toFixed(2)}` : num(v))}
              />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Widget>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Widget title="Funil de conversão" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
          <div className="space-y-3 py-2">
            {funnel.map((stage, i) => {
              const prevValue = i > 0 ? funnel[i - 1].value : stage.value;
              const conv = i > 0 ? (stage.value / Math.max(prevValue, 1)) * 100 : 100;
              const width = (stage.value / Math.max(funnel[0].value, 1)) * 100;
              return (
                <div key={stage.stage}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">{stage.stage}</span>
                    <span className="text-zinc-400">
                      {num(stage.value)} {i > 0 && <span className="text-zinc-500">({pct(conv, 1)})</span>}
                    </span>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-lg bg-white/5">
                    <div
                      className="flex h-full items-center justify-end rounded-lg px-2 text-[10px] font-bold text-white"
                      style={{ width: `${Math.max(width, 8)}%`, backgroundColor: stage.color }}
                    >
                      {num(stage.value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Widget>

        <Widget title="Top eventos" icon={<Activity className="h-4 w-4 text-blue-400" />}>
          {topEvents.length === 0 ? (
            <EmptyState title="Sem eventos" description="Os eventos rastreados aparecerão aqui." icon={<Activity className="h-8 w-8" />} />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topEvents} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                    {topEvents.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Widget title="Páginas mais visitadas" icon={<Globe className="h-4 w-4 text-violet-400" />}>
          {topPaths.length === 0 ? (
            <EmptyState title="Sem dados" description="As páginas mais visitadas aparecerão aqui." icon={<Globe className="h-8 w-8" />} />
          ) : (
            <div className="space-y-1.5">
              {topPaths.map((p, i) => (
                <div key={p.path} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-300">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-zinc-300">{p.path}</span>
                  <Badge variant="muted">{num(p.count)} visitas</Badge>
                </div>
              ))}
            </div>
          )}
        </Widget>

        <Widget title="Serviços por receita" icon={<ShoppingCart className="h-4 w-4 text-emerald-400" />}>
          {topServices.length === 0 ? (
            <EmptyState title="Sem vendas" description="Os serviços mais vendidos aparecerão aqui." icon={<ShoppingCart className="h-8 w-8" />} />
          ) : (
            <div className="space-y-1.5">
              {topServices.map((s, i) => (
                <div key={s.slug} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-300">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-zinc-300">{s.name}</span>
                  <span className="text-zinc-500">{num(s.orders)} vendas</span>
                  <span className="font-semibold text-emerald-300">{brl(s.revenue * 100)}</span>
                </div>
              ))}
            </div>
          )}
        </Widget>
      </div>
    </AdminShell>
  );
}

function KPI({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "emerald" | "blue" | "amber" | "violet";
}) {
  const accents = {
    emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
    amber: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
    violet: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-white">{value}</div>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
