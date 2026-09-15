"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Snowflake,
  FileText,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Loader2,
} from "lucide-react";

/**
 * Resumo do dia — topo da admin (Sprint B).
 * 4 blocos: leads esfriando · propostas aguardando follow-up ·
 * oportunidades novas · gargalos do funil.
 * Dados: GET /api/admin/assistant (determinístico, sem custo de IA).
 */

interface LeadCard {
  id: string;
  name: string;
  company: string | null;
  valor_brl: number | null;
  dias_parado: number;
}

interface Summary {
  leads_esfriando: { total: number; leads: LeadCard[] };
  propostas_aguardando_followup: { total: number; leads: LeadCard[] };
  oportunidades_novas: { total: number; leads: LeadCard[] };
  gargalos_funil: {
    definicao: string;
    itens: Array<{ stage: string; count: number; dias_medios_parados: number }>;
  };
}

const STAGE_LABEL: Record<string, string> = {
  qualificado: "Qualificado",
  proposta: "Proposta enviada",
  negociacao: "Negociação",
};

function fmtBRL(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function LeadChips({ leads, accent }: { leads: LeadCard[]; accent: string }) {
  if (!leads.length) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {leads.slice(0, 3).map((l) => (
        <div key={l.id} className="flex items-center justify-between gap-2 text-[12px]">
          <span className="truncate text-zinc-300">
            <span className="font-medium text-white">{l.name}</span>
            {l.company ? <span className="text-zinc-500"> · {l.company}</span> : null}
          </span>
          <span className={`shrink-0 font-mono text-[11px] ${accent}`}>
            {l.dias_parado}d {l.valor_brl ? `· ${fmtBRL(l.valor_brl)}` : ""}
          </span>
        </div>
      ))}
      {leads.length > 3 && (
        <p className="text-[11px] text-zinc-600">+ {leads.length - 3} outros</p>
      )}
    </div>
  );
}

export function DailySummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Recarrega quando reloadKey muda (sem setState síncrono no corpo do efeito)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/assistant");
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (cancelled) return;
        setSummary(data?.resumo || null);
        setError(false);
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

  if (loading) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        <span className="text-[13px]">Gerando resumo do dia…</span>
      </div>
    );
  }

  if (error || !summary) return null;

  const blocos = [
    {
      key: "frios",
      icon: Snowflake,
      label: "Leads esfriando",
      hint: "5+ dias sem interação",
      total: summary.leads_esfriando.total,
      leads: summary.leads_esfriando.leads,
      iconColor: "text-sky-400",
      bg: "bg-sky-500/10",
      accent: "text-sky-300",
      value: summary.leads_esfriando.leads.reduce((s, l) => s + (l.valor_brl || 0), 0),
    },
    {
      key: "propostas",
      icon: FileText,
      label: "Propostas aguardando",
      hint: "enviadas há 2+ dias",
      total: summary.propostas_aguardando_followup.total,
      leads: summary.propostas_aguardando_followup.leads,
      iconColor: "text-violet-400",
      bg: "bg-violet-500/10",
      accent: "text-violet-300",
      value: summary.propostas_aguardando_followup.leads.reduce((s, l) => s + (l.valor_brl || 0), 0),
    },
    {
      key: "novas",
      icon: Zap,
      label: "Oportunidades novas",
      hint: "entraram nos últimos 7 dias",
      total: summary.oportunidades_novas.total,
      leads: summary.oportunidades_novas.leads,
      iconColor: "text-emerald-400",
      bg: "bg-emerald-500/10",
      accent: "text-emerald-300",
      value: summary.oportunidades_novas.leads.reduce((s, l) => s + (l.valor_brl || 0), 0),
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02]">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Resumo do dia</h3>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
            IA Assistente
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refresh();
            }}
            aria-label="Atualizar resumo"
            className="rounded-lg p-1.5 hover:bg-white/5 hover:text-zinc-300"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Blocos principais (sempre visíveis) */}
      <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-3">
        {blocos.map((b) => (
          <div key={b.key} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${b.bg}`}>
                <b.icon className={`h-3.5 w-3.5 ${b.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-zinc-200">{b.label}</p>
                <p className="text-[10px] text-zinc-500">{b.hint}</p>
              </div>
              <span className="ml-auto text-xl font-bold text-white">{b.total}</span>
            </div>
            {expanded && (
              <>
                {b.value > 0 && (
                  <p className={`mt-2 font-mono text-[11px] ${b.accent}`}>
                    valor em jogo: {fmtBRL(b.value)}
                  </p>
                )}
                <LeadChips leads={b.leads} accent={b.accent} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Gargalos (expandido) */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-[12px] font-semibold text-zinc-200">
              Gargalos do funil
              <span className="ml-2 font-normal text-zinc-500">({summary.gargalos_funil.definicao})</span>
            </p>
          </div>
          {summary.gargalos_funil.itens.length === 0 ? (
            <p className="mt-2 text-[12px] text-emerald-300">Nenhum gargalo — funil saudável hoje. 🎉</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {summary.gargalos_funil.itens.map((g) => (
                <div key={g.stage} className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-300">{STAGE_LABEL[g.stage] || g.stage}</span>
                  <span className="font-mono text-[11px] text-amber-300">
                    {g.count} lead{g.count > 1 ? "s" : ""} · {g.dias_medios_parados}d parados em média
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
