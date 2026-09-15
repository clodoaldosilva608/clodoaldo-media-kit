"use client";

import { useEffect, useState } from "react";
import { Loader2, Target, RefreshCcw } from "lucide-react";

/**
 * Card de Predição de Fechamento (Sprint C) — exibido no modal do lead no CRM.
 * Modelo determinístico baseado em leads históricos semelhantes.
 * Somente leitura (Nível 1).
 */

interface Prediction {
  probability_pct: number;
  confidence: "alta" | "media" | "baixa";
  cohort_size: number;
  base_rate_pct: number;
  factors: Array<{ texto: string; impacto: "positivo" | "negativo" | "neutro" }>;
}

const CONF_COLOR: Record<string, string> = {
  alta: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
  media: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
  baixa: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/20",
};

const FACTOR_COLOR: Record<string, string> = {
  positivo: "text-emerald-300",
  negativo: "text-rose-300",
  neutro: "text-zinc-400",
};

export function ClosePredictionCard({ leadId }: { leadId: string }) {
  const [pred, setPred] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/prediction?lead_id=${leadId}`);
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) setPred(data);
        if (!cancelled) setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  const refresh = () => {
    setLoading(true);
    setPred(null);
    setReloadKey((k) => k + 1);
  };

  const pctColor = !pred
    ? "text-white"
    : pred.probability_pct >= 50
      ? "text-emerald-400"
      : pred.probability_pct >= 25
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          <Target className="h-3.5 w-3.5" /> Predição de fechamento
        </div>
        <button
          onClick={refresh}
          aria-label="Recalcular predição"
          className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
        >
          <RefreshCcw className="h-3 w-3" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          Comparando com leads históricos semelhantes…
        </div>
      )}

      {!loading && (error || !pred) && (
        <p className="text-[12px] text-zinc-500">Não foi possível calcular agora. Tente recalcular.</p>
      )}

      {!loading && pred && (
        <>
          <div className="flex items-end gap-3">
            <p className={`text-4xl font-bold leading-none ${pctColor}`}>{pred.probability_pct}%</p>
            <div className="pb-0.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${CONF_COLOR[pred.confidence]}`}>
                confiança {pred.confidence}
              </span>
              <p className="mt-1 text-[10px] text-zinc-500">
                coorte: {pred.cohort_size} leads históricos · taxa base {pred.base_rate_pct}%
              </p>
            </div>
          </div>
          <ul className="space-y-1">
            {pred.factors.map((f, i) => (
              <li key={i} className={`text-[11px] leading-relaxed ${FACTOR_COLOR[f.impacto]}`}>
                {f.impacto === "positivo" ? "▲" : f.impacto === "negativo" ? "▼" : "·"} {f.texto}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
