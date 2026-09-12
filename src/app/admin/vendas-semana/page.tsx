"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, Button, EmptyState } from "@/components/admin/ui";
import {
  RefreshCw, Sparkles, CheckCircle2, FileText, DollarSign, TrendingUp,
  Globe, AlertTriangle, AlertCircle, ShieldCheck, Clock,
} from "lucide-react";
import { brl } from "@/lib/admin/data";

export default function VendasSemanaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/vendas-semana?days=${days}`);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Erro ${resp.status}`);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const m = data?.metrics;

  return (
    <AdminShell title="Vendas da Semana — Método Gabriel Miranda">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Métricas de funil: demo → WhatsApp → BANT → proposta → venda. Ticket médio: R$1.700 (R$1.400-2.000 instalação + R$200-500/mês).
        </p>
        <div className="flex items-center gap-2">
          <select
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
          >
            <option value="7">7 dias</option>
            <option value="14">14 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-zinc-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Carregando métricas…</div>
      ) : m ? (
        <>
          {/* KPIs principais */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Demos gerados" value={String(m.demos_gerados)} icon={Sparkles} accent="violet" />
            <KpiCard label="BANT qualificados" value={String(m.bant_qualificados)} icon={CheckCircle2} accent="amber" />
            <KpiCard label="Propostas enviadas" value={String(m.propostas_enviadas)} icon={FileText} accent="blue" />
            <KpiCard label="Vendas fechadas" value={String(m.vendas_fechadas)} icon={TrendingUp} accent="emerald" />
          </div>

          {/* Receita */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Receita realizada</span>
              </div>
              <div className="text-2xl font-bold text-emerald-300">{brl(m.receita_realizada_cents)}</div>
              <div className="text-[10px] text-zinc-500 mt-1">{m.vendas_fechadas} venda(s) × ticket médio</div>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Pipeline projetado</span>
              </div>
              <div className="text-2xl font-bold text-blue-300">{brl(m.receita_projetada_cents)}</div>
              <div className="text-[10px] text-zinc-500 mt-1">{m.propostas_enviadas} proposta(s) em aberto</div>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Taxa de conversão</span>
              </div>
              <div className="text-2xl font-bold text-violet-300">{m.conversao_proposta_venda_pct}%</div>
              <div className="text-[10px] text-zinc-500 mt-1">proposta → venda</div>
            </div>
          </div>

          {/* Funil visual */}
          <Widget title="Funil de conversão" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} className="mb-4">
            <FunnelChart
              stages={[
                { label: "Demos gerados", value: m.demos_gerados, color: "#8b5cf6" },
                { label: "BANT qualificados", value: m.bant_qualificados, color: "#f59e0b" },
                { label: "Propostas enviadas", value: m.propostas_enviadas, color: "#3b82f6" },
                { label: "Vendas fechadas", value: m.vendas_fechadas, color: "#10b981" },
              ]}
            />
          </Widget>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Distribuição por status do site */}
            <Widget title="Status dos sites dos leads" icon={<Globe className="h-4 w-4 text-blue-400" />}>
              <div className="space-y-2">
                {Object.entries(data.distributions.por_status_site).map(([status, count]: any) => (
                  <SiteStatusRow key={status} status={status} count={count} total={m.total_leads} />
                ))}
              </div>
            </Widget>

            {/* Distribuição por origem */}
            <Widget title="Origem dos leads" icon={<FileText className="h-4 w-4 text-violet-400" />}>
              <div className="space-y-2">
                {Object.entries(data.distributions.por_origem).map(([origem, count]: any) => (
                  <div key={origem} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                    <span className="text-xs text-zinc-300">{origem || "desconhecido"}</span>
                    <Badge variant="muted">{count}</Badge>
                  </div>
                ))}
              </div>
            </Widget>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            {/* Demos recentes */}
            <Widget title="Demos recentes" icon={<Sparkles className="h-4 w-4 text-violet-400" />}>
              {data.recent_demos.length === 0 ? (
                <EmptyState title="Nenhum demo gerado" description="Gere demos pelo modal do lead no CRM." icon={<Sparkles className="h-8 w-8" />} />
              ) : (
                <div className="space-y-2">
                  {data.recent_demos.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{d.name}</div>
                        <div className="text-[10px] text-zinc-500">{new Date(d.demo_generated_at).toLocaleString("pt-BR")}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={d.stage === "fechado" ? "success" : "muted"}>{d.stage}</Badge>
                        <a href={d.demo_url} target="_blank" rel="noreferrer" className="text-violet-400 hover:text-violet-300 text-xs underline">Abrir →</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Widget>

            {/* BANT qualificados recentes */}
            <Widget title="BANT qualificados recentes" icon={<CheckCircle2 className="h-4 w-4 text-amber-400" />}>
              {data.recent_bant.length === 0 ? (
                <EmptyState title="Nenhum BANT qualificado" description="Marque 3+ critérios BANT no modal do lead." icon={<CheckCircle2 className="h-8 w-8" />} />
              ) : (
                <div className="space-y-2">
                  {data.recent_bant.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{b.name}</div>
                        <div className="text-[10px] text-zinc-500">BANT score: {b.bant_score}/4</div>
                      </div>
                      <Badge variant={b.stage === "fechado" ? "success" : "warning"}>{b.stage}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Widget>
          </div>

          {/* Pricing reference */}
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">💰 Pricing método Gabriel Miranda</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-zinc-400">Instalação (entregar site)</div>
                <div className="text-white font-bold">R$1.400 - R$2.000</div>
                <div className="text-[10px] text-zinc-500">em até 12x (você recebe à vista)</div>
              </div>
              <div>
                <div className="text-zinc-400">Manutenção c/ Funcionário IA</div>
                <div className="text-white font-bold">R$400 - R$500/mês</div>
                <div className="text-[10px] text-zinc-500">depende do volume</div>
              </div>
              <div>
                <div className="text-zinc-400">Manutenção s/ Funcionário IA</div>
                <div className="text-white font-bold">R$200 - R$250/mês</div>
                <div className="text-[10px] text-zinc-500">manutenção básica</div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent: "emerald" | "blue" | "amber" | "violet" }) {
  const colors = {
    emerald: "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300",
    blue: "border-blue-500/20 bg-blue-500/[0.04] text-blue-300",
    amber: "border-amber-500/20 bg-amber-500/[0.04] text-amber-300",
    violet: "border-violet-500/20 bg-violet-500/[0.04] text-violet-300",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
        </div>
        <Icon className="h-5 w-5 opacity-60" />
      </div>
    </div>
  );
}

function FunnelChart({ stages }: { stages: Array<{ label: string; value: number; color: string }> }) {
  const max = Math.max(...stages.map(s => s.value), 1);
  return (
    <div className="space-y-3 py-2">
      {stages.map((s, i) => {
        const prev = i > 0 ? stages[i - 1].value : s.value;
        const conv = i > 0 && prev > 0 ? Math.round((s.value / prev) * 100) : 100;
        const width = (s.value / max) * 100;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">{s.label}</span>
              <span className="text-zinc-400">
                {s.value} {i > 0 && <span className="text-zinc-500">({conv}%)</span>}
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-lg bg-white/5">
              <div
                className="flex h-full items-center justify-end rounded-lg px-2 text-[10px] font-bold text-white"
                style={{ width: `${Math.max(width, 8)}%`, backgroundColor: s.color }}
              >
                {s.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SiteStatusRow({ status, count, total }: { status: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const config: Record<string, { color: string; label: string; icon: any }> = {
    ok: { color: "text-emerald-300", label: "Site OK", icon: ShieldCheck },
    broken: { color: "text-rose-300", label: "Site quebrado", icon: AlertTriangle },
    slow: { color: "text-amber-300", label: "Site lento", icon: Clock },
    ssl_invalid: { color: "text-rose-300", label: "SSL inválido", icon: AlertCircle },
    no_site: { color: "text-zinc-300", label: "Sem site", icon: Globe },
    unknown: { color: "text-zinc-400", label: "Não verificado", icon: Globe },
  };
  const c = config[status] || config.unknown;
  const Icon = c.icon;
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
      <span className="flex items-center gap-2 text-xs text-zinc-300">
        <Icon className={`h-3.5 w-3.5 ${c.color}`} />
        {c.label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white">{count}</span>
        <Badge variant="muted">{pct}%</Badge>
      </div>
    </div>
  );
}
