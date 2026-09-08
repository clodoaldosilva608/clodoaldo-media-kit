"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, Button, Input, Select, Textarea, EmptyState } from "@/components/admin/ui";
import {
  RefreshCw, Trash2, ChevronRight, Phone, Mail, MessageCircle,
  TrendingUp, Filter, X, Sparkles, Calculator,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  company: string | null;
  project_idea: string | null;
  intent: string | null;
  budget_range: string | null;
  deadline: string | null;
  source: string;
  stage: string;
  estimated_value_cents: number;
  proposed_service_slug: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StageStats { count: number; total_value_cents: number; }

const STAGES = ["novo", "qualificado", "proposta", "negociacao", "fechado", "perdido"] as const;
const STAGE_LABELS: Record<string, string> = {
  novo: "Novo", qualificado: "Qualificado", proposta: "Proposta enviada",
  negociacao: "Negociação", fechado: "Fechado", perdido: "Perdido",
};
const STAGE_COLORS: Record<string, string> = {
  novo: "bg-blue-500/15 text-blue-300 ring-blue-500/20",
  qualificado: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
  proposta: "bg-violet-500/15 text-violet-300 ring-violet-500/20",
  negociacao: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/20",
  fechado: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
  perdido: "bg-rose-500/15 text-rose-300 ring-rose-500/20",
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export default function AdminLeadsCRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Record<string, StageStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (stageFilter !== "all") params.set("stage", stageFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (search) params.set("search", search);
      const resp = await fetch(`/api/admin/leads-crm?${params.toString()}`, { cache: "no-store" });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Erro");
      setLeads(json.data || []);
      setStats(json.stats || {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [stageFilter, sourceFilter, search]);

  useEffect(() => { load(); }, [load]);

  async function changeStage(leadId: string, newStage: string) {
    try {
      const resp = await fetch("/api/admin/leads-crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, stage: newStage }),
      });
      if (!resp.ok) throw new Error("Falha");
      await load();
      setSelectedLead((prev) => (prev?.id === leadId ? { ...prev, stage: newStage } : prev));
    } catch (e: any) { alert(e.message); }
  }

  async function deleteLead(id: string) {
    if (!confirm("Excluir este lead permanentemente?")) return;
    try {
      await fetch("/api/admin/leads-crm", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
      setSelectedLead(null);
    } catch (e: any) { alert(e.message); }
  }

  const totalValue = Object.values(stats).reduce((s, st) => s + (st?.total_value_cents || 0), 0);
  const totalLeads = Object.values(stats).reduce((s, st) => s + (st?.count || 0), 0);
  const closedValue = stats.fechado?.total_value_cents || 0;
  const conversionRate = totalLeads > 0 ? ((stats.fechado?.count || 0) / totalLeads) * 100 : 0;

  return (
    <AdminShell title="CRM de Leads">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total de leads" value={totalLeads} />
          <KpiCard label="Pipeline (estimado)" value={formatBRL(totalValue)} accent="amber" />
          <KpiCard label="Receita fechada" value={formatBRL(closedValue)} accent="emerald" />
          <KpiCard label="Taxa de conversão" value={`${conversionRate.toFixed(1)}%`} accent="cyan" />
        </div>

        <Widget title="Funil de conversão" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STAGES.map((s) => {
              const st = stats[s] || { count: 0, total_value_cents: 0 };
              return (
                <button key={s} onClick={() => setStageFilter(stageFilter === s ? "all" : s)} className={`rounded-xl border p-3 text-left transition ${stageFilter === s ? "border-primary/60 bg-primary/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{STAGE_LABELS[s]}</div>
                  <div className="mt-1 text-2xl font-bold text-white">{st.count}</div>
                  <div className="text-[10px] text-zinc-400">{formatBRL(st.total_value_cents)}</div>
                </button>
              );
            })}
          </div>
        </Widget>

        <Widget title="Leads capturados" icon={<Filter className="h-4 w-4 text-blue-400" />} action={<Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /><span className="ml-1">Atualizar</span></Button>}>
          <div className="mb-4 flex flex-wrap gap-2">
            <Input placeholder="Buscar por nome, email, empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="max-w-[180px]">
              <option value="all">Todas origens</option>
              <option value="quiz">Quiz</option>
              <option value="contact_form">Formulário</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="proposta_calculadora">Calculadora</option>
              <option value="manual">Manual</option>
            </Select>
          </div>
          {error && <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-300">{error}</div>}
          {loading ? (
            <div className="py-12 text-center text-zinc-500"><RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />Carregando...</div>
          ) : leads.length === 0 ? (
            <EmptyState icon={<MessageCircle className="h-8 w-8 text-zinc-600" />} title="Nenhum lead encontrado" description="Leads do formulário, quiz e calculadora aparecem aqui automaticamente." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                    <th className="py-2 pr-3">Lead</th>
                    <th className="py-2 pr-3">Origem</th>
                    <th className="py-2 pr-3">Intenção</th>
                    <th className="py-2 pr-3">Valor est.</th>
                    <th className="py-2 pr-3">Estágio</th>
                    <th className="py-2 pr-3">Criado</th>
                    <th className="py-2 pr-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <td className="py-3 pr-3">
                        <div className="font-medium text-white">{lead.name}</div>
                        {lead.email && <div className="flex items-center gap-1 text-xs text-zinc-500"><Mail className="h-3 w-3" /> {lead.email}</div>}
                        {lead.whatsapp && <div className="flex items-center gap-1 text-xs text-zinc-500"><Phone className="h-3 w-3" /> {lead.whatsapp}</div>}
                      </td>
                      <td className="py-3 pr-3"><span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">{lead.source}</span></td>
                      <td className="py-3 pr-3 text-xs text-zinc-300">{lead.intent || "—"}</td>
                      <td className="py-3 pr-3 font-semibold text-white">{lead.estimated_value_cents > 0 ? formatBRL(lead.estimated_value_cents) : "—"}</td>
                      <td className="py-3 pr-3"><span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${STAGE_COLORS[lead.stage] || STAGE_COLORS.novo}`}>{STAGE_LABELS[lead.stage] || lead.stage}</span></td>
                      <td className="py-3 pr-3 text-xs text-zinc-400">{timeAgo(lead.created_at)}</td>
                      <td className="py-3 pr-3 text-right"><ChevronRight className="inline h-4 w-4 text-zinc-500" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Widget>
      </div>

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onStageChange={(s) => changeStage(selectedLead.id, s)} onDelete={() => deleteLead(selectedLead.id)} />
      )}
    </AdminShell>
  );
}

function KpiCard({ label, value, accent = "blue" }: { label: string; value: string | number; accent?: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-300", amber: "text-amber-300", emerald: "text-emerald-300", cyan: "text-cyan-300",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${colors[accent] || colors.blue}`}>{value}</div>
    </div>
  );
}

function LeadDetailModal({ lead, onClose, onStageChange, onDelete }: { lead: Lead; onClose: () => void; onStageChange: (s: string) => void; onDelete: () => void; }) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [estimatedValue, setEstimatedValue] = useState(String(Math.round(lead.estimated_value_cents / 100)));
  const [saving, setSaving] = useState(false);

  async function saveChanges() {
    setSaving(true);
    try {
      const resp = await fetch("/api/admin/leads-crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, notes, estimated_value_cents: Math.round(Number(estimatedValue) * 100) }),
      });
      if (!resp.ok) throw new Error("Falha");
      onClose();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  const waLink = lead.whatsapp ? `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.name}! Vi seu interesse no site e queria conversar sobre seu projeto.`)}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-sm font-bold text-white">{lead.name}</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[calc(90vh-130px)] overflow-y-auto p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {lead.email && <Field label="Email" value={lead.email} />}
            {lead.whatsapp && <Field label="WhatsApp" value={lead.whatsapp} />}
            {lead.company && <Field label="Empresa" value={lead.company} />}
            <Field label="Origem" value={lead.source} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Intenção" value={lead.intent || "—"} />
            <Field label="Budget" value={lead.budget_range || "—"} />
            <Field label="Prazo" value={lead.deadline || "—"} />
          </div>
          {lead.project_idea && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] font-bold uppercase text-zinc-500">Ideia do projeto</div>
              <p className="mt-1 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{lead.project_idea}</p>
            </div>
          )}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Estágio atual</div>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button key={s} onClick={() => onStageChange(s)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition ${lead.stage === s ? STAGE_COLORS[s] + " ring-2" : "bg-white/[0.03] text-zinc-400 ring-white/5 hover:bg-white/[0.06]"}`}>{STAGE_LABELS[s]}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Valor estimado (R$)</label>
            <Input type="number" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} placeholder="Ex: 1500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Notas internas</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Anotações sobre o lead, contexto comercial..." />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
            {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/20 hover:bg-blue-500/25"><Mail className="h-3.5 w-3.5" /> Email</a>}
            <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/20 hover:bg-rose-500/25 ml-auto"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
          </div>
        </div>
        <div className="border-t border-white/5 px-5 py-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={saveChanges} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] font-bold uppercase text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-white break-all">{value}</div>
    </div>
  );
}
