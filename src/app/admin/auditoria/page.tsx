"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Select } from "@/components/admin/ui";
import { History, RefreshCw, Filter, ShieldCheck } from "lucide-react";

export default function AuditLogsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actor: "",
    action: "",
    entity: "",
    entity_id: "",
    from: "",
    to: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set("limit", "200");
      const resp = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Erro ${resp.status}`);
      setData(json);
    } catch (e: any) {
      setData({ error: e.message });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const logs = data?.logs || [];
  const filterOptions = data?.filters || { actors: [], actions: [], entities: [] };

  return (
    <AdminShell title="Logs de Auditoria">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Histórico filtrável de ações administrativas (criar, editar, excluir, enviar, exportar).
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Widget title="Filtros" icon={<Filter className="h-4 w-4 text-blue-400" />} className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Select value={filters.actor} onChange={(e) => setFilters({ ...filters, actor: e.target.value })}>
            <option value="">Todos os autores</option>
            {filterOptions.actors?.map((a: string) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <Select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
            <option value="">Todas as ações</option>
            {filterOptions.actions?.map((a: string) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <Select value={filters.entity} onChange={(e) => setFilters({ ...filters, entity: e.target.value })}>
            <option value="">Todas as entidades</option>
            {filterOptions.entities?.map((a: string) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <Input placeholder="ID da entidade" value={filters.entity_id} onChange={(e) => setFilters({ ...filters, entity_id: e.target.value })} />
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </div>
      </Widget>

      {/* Logs */}
      <Widget
        title={`Logs (${logs.length})`}
        icon={<History className="h-4 w-4 text-violet-400" />}
      >
        {loading ? (
          <div className="py-12 text-center text-zinc-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Carregando…</div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="Nenhum log registrado"
            description="Ações administrativas (criar, editar, excluir, exportar) serão registradas aqui automaticamente."
            icon={<ShieldCheck className="h-8 w-8" />}
            hint="Logs têm retenção definida. Dados sensíveis são mascarados automaticamente."
          />
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log: any) => (
              <div key={log.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={
                    log.action.includes("delete") ? "danger" :
                    log.action.includes("create") ? "success" :
                    log.action.includes("update") ? "warning" :
                    log.action.includes("export") ? "info" : "default"
                  }>{log.action}</Badge>
                  {log.entity && (
                    <span className="text-zinc-400">
                      <span className="text-zinc-500">em</span> <code className="text-zinc-300">{log.entity}</code>
                    </span>
                  )}
                  {log.entity_id && <code className="text-[10px] text-zinc-500 font-mono">#{log.entity_id.slice(0, 8)}</code>}
                  <span className="ml-auto text-[10px] text-zinc-500">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>
                    por <strong className="text-zinc-300">{log.actor}</strong>
                    {log.actor_role && <Badge variant="muted" className="ml-2">{log.actor_role}</Badge>}
                  </span>
                  {log.ip && <span className="text-zinc-600">IP: {log.ip}</span>}
                </div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="mt-2 rounded bg-black/30 border border-white/5 p-2 text-[10px] font-mono text-zinc-400 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </Widget>
    </AdminShell>
  );
}
