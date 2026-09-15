"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button, EmptyState } from "@/components/admin/ui";
import {
  Lightbulb,
  RefreshCcw,
  Loader2,
  Send,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Clock,
  Target,
  Minus,
} from "lucide-react";

/**
 * Insights Semanais (Sprint C) — compara nichos, cidades, horários e
 * variantes de roteiro entre a última semana e a anterior.
 * Dados: GET /api/admin/insights (determinístico, sem custo de IA).
 */

interface Bucket {
  nome: string;
  envios: number;
  respostas: number;
  reply_rate_pct: number;
  leads_novos?: number;
}

interface InsightsData {
  janela: { atual: { start: string; end: string }; anterior: { start: string; end: string }; db_envios_disponivel: boolean };
  resumo: {
    atual: { envios: number; respostas: number; reply_rate_pct: number; novos_leads: number; avancados: number; fechados: number; valor_fechado_brl: number };
    anterior: { envios: number; respostas: number; reply_rate_pct: number; novos_leads: number; fechados: number };
  };
  por_nicho: Bucket[];
  por_cidade: Bucket[];
  por_horario: Bucket[];
  por_variante: Bucket[];
  insights: string[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Delta({ cur, prev, invert = false }: { cur: number; prev: number; invert?: boolean }) {
  if (prev === 0 && cur === 0) return <span className="text-[11px] text-zinc-600">—</span>;
  if (prev === 0) return <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400"><TrendingUp className="h-3 w-3" /> novos dados</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-500"><Minus className="h-3 w-3" /> estável</span>;
  const up = pct > 0;
  const good = invert ? !up : up;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${good ? "text-emerald-400" : "text-rose-400"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{pct}%
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, delta }: { icon: any; label: string; value: string | number; sub?: string; delta?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
            <Icon className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-[12px] font-semibold text-zinc-300">{label}</p>
        </div>
        {delta}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-zinc-500">{sub}</p>}
    </div>
  );
}

function RankTable({ title, icon: Icon, buckets, extraCol }: { title: string; icon: any; buckets: Bucket[]; extraCol?: boolean }) {
  const maxEnvios = Math.max(...buckets.map((b) => b.envios), 1);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      {buckets.length === 0 ? (
        <p className="text-[12px] text-zinc-600">Sem envios suficientes nesta categoria ainda.</p>
      ) : (
        <div className="space-y-2.5">
          {buckets.map((b) => (
            <div key={b.nome}>
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-medium text-zinc-200">{b.nome}</span>
                <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                  {b.envios} env · <span className={b.reply_rate_pct >= 20 ? "text-emerald-400" : b.reply_rate_pct >= 8 ? "text-amber-400" : "text-zinc-500"}>{b.reply_rate_pct}%</span>
                  {extraCol && b.leads_novos ? <span className="text-zinc-600"> · {b.leads_novos} leads</span> : null}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  style={{ width: `${Math.max((b.envios / maxEnvios) * 100, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/insights");
        if (!res.ok) throw new Error("fail");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <AdminShell title="Insights Semanais">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-2xl">Inteligência da prospecção 🧠</h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            Últimos 7 dias ({data ? `${fmtDate(data.janela.atual.start)} – ${fmtDate(data.janela.atual.end)}` : "…"}) comparados com a semana anterior.
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCcw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-16 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="text-sm">Calculando comparações…</span>
        </div>
      )}

      {!loading && (error || !data) && (
        <EmptyState icon={<Lightbulb className="h-8 w-8" />} title="Não foi possível carregar os insights" description="Tente atualizar em alguns segundos." />
      )}

      {!loading && data && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <KpiCard
              icon={Send}
              label="Envios"
              value={data.resumo.atual.envios}
              delta={<Delta cur={data.resumo.atual.envios} prev={data.resumo.anterior.envios} />}
              sub={`semana passada: ${data.resumo.anterior.envios}`}
            />
            <KpiCard
              icon={MessageCircle}
              label="Respostas"
              value={data.resumo.atual.respostas}
              delta={<Delta cur={data.resumo.atual.respostas} prev={data.resumo.anterior.respostas} />}
              sub={`semana passada: ${data.resumo.anterior.respostas}`}
            />
            <KpiCard
              icon={Target}
              label="Reply rate"
              value={`${data.resumo.atual.reply_rate_pct}%`}
              delta={<Delta cur={data.resumo.atual.reply_rate_pct} prev={data.resumo.anterior.reply_rate_pct} invert />}
              sub={`semana passada: ${data.resumo.anterior.reply_rate_pct}%`}
            />
            <KpiCard
              icon={Users}
              label="Novos leads"
              value={data.resumo.atual.novos_leads}
              delta={<Delta cur={data.resumo.atual.novos_leads} prev={data.resumo.anterior.novos_leads} />}
              sub={`${data.resumo.atual.avancados} avançaram · ${data.resumo.atual.fechados} fechou`}
            />
          </div>

          {/* Insights */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">O que os dados dizem</h3>
            </div>
            <ul className="space-y-1.5">
              {data.insights.map((s, i) => (
                <li key={i} className="text-[13px] leading-relaxed text-emerald-50/90">{s}</li>
              ))}
            </ul>
          </div>

          {/* Comparações */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RankTable title="Por nicho" icon={Target} buckets={data.por_nicho} extraCol />
            <RankTable title="Por cidade" icon={MapPin} buckets={data.por_cidade} />
            <RankTable title="Por variante de roteiro" icon={Send} buckets={data.por_variante} />
            <RankTable title="Por horário de envio" icon={Clock} buckets={data.por_horario} />
          </div>

          {!data.janela.db_envios_disponivel && (
            <p className="text-[11px] text-zinc-600">
              ⚠️ Tabelas de envio/resposta indisponíveis — as comparações usam apenas o funil do CRM.
            </p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
