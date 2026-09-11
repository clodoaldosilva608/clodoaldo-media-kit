"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button } from "@/components/admin/ui";
import {
  Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Database,
  Globe, Mail, Calendar, Code, ShieldCheck,
} from "lucide-react";

interface Check {
  key: string;
  label: string;
  status: "ok" | "warning" | "critical";
  detail?: string;
  lastCheck: string;
  action?: string;
}

export default function HealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/admin/health");
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

  const overall = data?.overall as "ok" | "warning" | "critical" | undefined;
  const checks: Check[] = data?.checks || [];

  return (
    <AdminShell title="Central de Saúde Operacional">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Verificações automáticas de cada integração e serviço crítico.
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      {/* Overall banner */}
      {!loading && !error && overall && (
        <div className={`mb-4 rounded-xl border p-4 ${
          overall === "ok" ? "border-emerald-500/30 bg-emerald-500/[0.06]" :
          overall === "warning" ? "border-amber-500/30 bg-amber-500/[0.06]" :
          "border-rose-500/30 bg-rose-500/[0.06]"
        }`}>
          <div className="flex items-center gap-3">
            {overall === "ok" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> :
             overall === "warning" ? <AlertTriangle className="h-6 w-6 text-amber-400" /> :
             <XCircle className="h-6 w-6 text-rose-400" />}
            <div>
              <h4 className={`text-sm font-bold ${
                overall === "ok" ? "text-emerald-200" :
                overall === "warning" ? "text-amber-200" :
                "text-rose-200"
              }`}>
                Status geral: {overall === "ok" ? "Saudável" : overall === "warning" ? "Atenção" : "Crítico"}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {data.score.ok} OK · {data.score.warning} atenções · {data.score.critical} críticos · {data.score.total} verificações
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          ⚠ {error}
        </div>
      )}

      {/* Checks grid */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Verificando…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {checks.map((c) => (
            <CheckCard key={c.key} check={c} />
          ))}
        </div>
      )}

      {/* Generated at */}
      {data?.generatedAt && (
        <div className="mt-4 text-[11px] text-zinc-500 text-center">
          Verificação gerada em {new Date(data.generatedAt).toLocaleString("pt-BR")} · Atualiza a cada visita à página.
        </div>
      )}
    </AdminShell>
  );
}

function CheckCard({ check }: { check: Check }) {
  const config = {
    db: { icon: Database, color: "blue" },
    payment_webhook: { icon: ShieldCheck, color: "emerald" },
    pixel: { icon: Globe, color: "violet" },
    email: { icon: Mail, color: "amber" },
    cron_weekly: { icon: Calendar, color: "cyan" },
    envs: { icon: Code, color: "blue" },
    last_error: { icon: AlertTriangle, color: "rose" },
    data_freshness: { icon: Activity, color: "emerald" },
  };
  const c = config[check.key as keyof typeof config] || { icon: Activity, color: "zinc" };
  const Icon = c.icon;

  const statusConfig = {
    ok: { ring: "border-emerald-500/20 bg-emerald-500/[0.03]", badge: "bg-emerald-500/15 text-emerald-300", icon: CheckCircle2 },
    warning: { ring: "border-amber-500/20 bg-amber-500/[0.03]", badge: "bg-amber-500/15 text-amber-300", icon: AlertTriangle },
    critical: { ring: "border-rose-500/20 bg-rose-500/[0.03]", badge: "bg-rose-500/15 text-rose-300", icon: XCircle },
  };
  const s = statusConfig[check.status];
  const StatusIcon = s.icon;

  return (
    <div className={`rounded-xl border p-4 ${s.ring}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 text-${c.color}-400`} />
          <h4 className="text-sm font-bold text-white">{check.label}</h4>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.badge}`}>
          <StatusIcon className="h-3 w-3" /> {check.status === "ok" ? "OK" : check.status === "warning" ? "Atenção" : "Crítico"}
        </span>
      </div>
      {check.detail && <p className="mt-2 text-xs text-zinc-400">{check.detail}</p>}
      {check.action && (
        <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-2 py-1.5 text-[11px] text-amber-200/80">
          → {check.action}
        </div>
      )}
    </div>
  );
}
