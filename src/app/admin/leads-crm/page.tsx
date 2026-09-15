"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, Button, Input, Select, Textarea, EmptyState } from "@/components/admin/ui";
import { ClosePredictionCard } from "@/components/admin/close-prediction-card";
import {
  RefreshCw, Trash2, ChevronRight, Phone, Mail, MessageCircle,
  TrendingUp, Filter, X, Sparkles, Calculator, ListChecks, History, Plus, Check, Clock,
  ExternalLink, Copy, Sparkle, AlertCircle, Globe, ShieldCheck, AlertTriangle, MessageSquareText, FileText, Code2,
} from "lucide-react";
import { getScriptsForLead, getLongFormScript, type ScriptVars, type Script } from "@/lib/whatsapp-scripts";

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
  // BANT + Demo + site_status (método Gabriel Miranda)
  bant_budget?: boolean;
  bant_authority?: boolean;
  bant_need?: boolean;
  bant_timing?: boolean;
  bant_notes?: string | null;
  site_status?: string | null;
  site_checked_at?: string | null;
  demo_url?: string | null;
  demo_generated_at?: string | null;
  prospect_id?: string | null;
  hero_image_url?: string | null;
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
              <option value="parceiros">Parceiros</option>
              <option value="manual">Manual</option>
            </Select>
          </div>
          {error && <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-300">{error}</div>}
          {loading ? (
            <div className="py-12 text-center text-zinc-500"><RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />Carregando...</div>
          ) : leads.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="h-8 w-8 text-zinc-600" />}
              title="Nenhum lead ainda"
              description="Leads do formulário, quiz e calculadora aparecem aqui automaticamente."
              steps={[
                "Publique o quiz (/quiz) e faça uma resposta de teste — um lead será criado.",
                "Adicione um formulário de contato em qualquer página — entradas viram leads.",
                "Use a calculadora de proposta (/api/proposta-calculadora) — cada cálculo vira lead.",
                "Configure a prospecção automática (cron 09h) para captar leads do Google Maps.",
              ]}
              hint="Cada lead percorre os estágios: Novo → Qualificado → Proposta → Negociação → Fechado/Perdido. Clique em um lead para ver detalhes."
            />
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
  const [tab, setTab] = useState<"info" | "scripts" | "copilot" | "prompt" | "tasks" | "history">("info");
  const [tasks, setTasks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", due_at: "" });
  // BANT state
  const [bant, setBant] = useState({
    budget: lead.bant_budget || false,
    authority: lead.bant_authority || false,
    need: lead.bant_need || false,
    timing: lead.bant_timing || false,
    notes: lead.bant_notes || "",
  });
  const [demoCopied, setDemoCopied] = useState(false);
  const [checkingSite, setCheckingSite] = useState(false);
  // Lead context (niche, city, hasWebsite) fetched from clodoaldo_prospects
  const [leadContext, setLeadContext] = useState<{ niche: string; city: string; hasWebsite: boolean | null; demoUrl: string } | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);

  const dynamicDemoUrl = typeof window !== "undefined" ? `${window.location.origin}/api/preview?lead=${lead.id}&style=dark` : `/api/preview?lead=${lead.id}&style=dark`;
  // Always prefer dynamic URL (in case domain changed since demo_url was saved)
  const demoUrl = dynamicDemoUrl;
  const bantScore = [bant.budget, bant.authority, bant.need, bant.timing].filter(Boolean).length;
  const bantQualified = bantScore >= 3;

  const loadExtras = useCallback(async () => {
    setLoadingExtras(true);
    try {
      const [t, h] = await Promise.all([
        fetch(`/api/admin/lead-tasks?lead_id=${lead.id}`).then(r => r.json()),
        fetch(`/api/admin/lead-history?lead_id=${lead.id}`).then(r => r.json()),
      ]);
      setTasks(t.tasks || []);
      setHistory(h.history || []);
    } catch {}
    setLoadingExtras(false);
  }, [lead.id]);

  // Fetch lead context (niche + city + hasWebsite) from clodoaldo_prospects
  useEffect(() => {
    setLoadingContext(true);
    fetch(`/api/admin/lead-context?lead_id=${lead.id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setLeadContext({
            niche: d.niche || "negócio local",
            city: d.city || "Recife, PE",
            hasWebsite: d.hasWebsite,
            demoUrl: d.demoUrl || demoUrl,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingContext(false));
  }, [lead.id, demoUrl]);

  useEffect(() => { loadExtras(); }, [loadExtras]);

  async function addTask() {
    if (!newTask.title) return;
    await fetch("/api/admin/lead-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, title: newTask.title, description: newTask.description, due_at: newTask.due_at || null }),
    });
    setNewTask({ title: "", description: "", due_at: "" });
    await loadExtras();
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch("/api/admin/lead-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    await loadExtras();
  }

  async function deleteTask(id: string) {
    if (!confirm("Excluir tarefa?")) return;
    await fetch(`/api/admin/lead-tasks?id=${id}`, { method: "DELETE" });
    await loadExtras();
  }

  async function addNote() {
    if (!notes || notes === lead.notes) return;
    await fetch("/api/admin/lead-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, event_type: "note", notes, actor: "admin" }),
    });
    await loadExtras();
  }

  async function saveBant() {
    await fetch("/api/admin/leads-crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: lead.id,
        bant_budget: bant.budget,
        bant_authority: bant.authority,
        bant_need: bant.need,
        bant_timing: bant.timing,
        bant_notes: bant.notes,
      }),
    });
    // If BANT qualified and lead is still "novo", suggest moving to "qualificado"
    if (bantQualified && lead.stage === "novo") {
      if (confirm("Lead qualificado pelo BANT (3+ critérios)! Deseja mover para 'Qualificado'?")) {
        onStageChange("qualificado");
      }
    }
  }

  function copyDemoUrl() {
    navigator.clipboard.writeText(demoUrl);
    setDemoCopied(true);
    setTimeout(() => setDemoCopied(false), 2000);
  }

  async function generateDemo() {
    await fetch("/api/admin/leads-crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, demo_url: demoUrl, demo_generated_at: new Date().toISOString() }),
    });
    // Log in history
    await fetch("/api/admin/lead-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, event_type: "demo_generated", notes: `Demo gerado: ${demoUrl}`, actor: "admin" }),
    });
    window.open(demoUrl, "_blank");
  }

  async function checkSite() {
    setCheckingSite(true);
    try {
      const resp = await fetch(`/api/admin/check-site?lead_id=${lead.id}`);
      const json = await resp.json();
      if (json.site_status) {
        lead.site_status = json.site_status;
        lead.site_checked_at = new Date().toISOString();
      }
      alert(`Site check: ${json.site_status}\n${json.detail || ""}`);
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
    setCheckingSite(false);
  }

  function generateProposta() {
    // Abre proposta em nova aba (HTML imprimível como PDF)
    const w = window.open("", "_blank");
    if (!w) {
      alert("Pop-up bloqueado. Permita pop-ups para gerar a proposta.");
      return;
    }
    w.document.write("<html><body style='font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0'><p>Gerando proposta...</p></body></html>");
    fetch("/api/public/proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id }),
    })
      .then(r => r.text())
      .then(html => {
        w.document.open();
        w.document.write(html);
        w.document.close();
      })
      .catch(e => {
        w.document.write(`<p>Erro: ${e.message}</p>`);
      });
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const resp = await fetch("/api/admin/leads-crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, notes, estimated_value_cents: Math.round(Number(estimatedValue) * 100) }),
      });
      if (!resp.ok) throw new Error("Falha");
      await addNote();
      await saveBant();
      onClose();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  const waLink = lead.whatsapp ? `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.name}! Vi seu interesse no site e queria conversar sobre seu projeto.`)}` : null;
  const pendingTasks = tasks.filter(t => !t.done).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative h-[95vh] sm:h-auto sm:max-h-[90vh] w-full sm:max-w-3xl overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header — fixed at top of modal */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white">{lead.name}</h3>
            <LeadScoreBadge lead={lead} />
            {pendingTasks > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">{pendingTasks} tarefa(s) pendente(s)</span>
            )}
            {bantQualified && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">✓ BANT qualificado ({bantScore}/4)</span>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="border-b border-white/5 px-3 sm:px-5 pt-2 flex gap-0.5 sm:gap-1 overflow-x-auto shrink-0 scrollbar-thin">
          {[
            { k: "info", label: "Info", icon: MessageCircle },
            { k: "scripts", label: "Scripts", icon: MessageSquareText },
            { k: "copilot", label: "IA", icon: Sparkles },
            { k: "prompt", label: "Prompt Site", icon: Code2 },
            { k: "tasks", label: `Tarefas (${pendingTasks})`, icon: ListChecks },
            { k: "history", label: "Histórico", icon: History },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold border-b-2 transition whitespace-nowrap ${tab === t.k ? "border-emerald-500 text-emerald-300" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {tab === "info" && (
            <>
              {/* Predição de fechamento (Sprint C) */}
              <ClosePredictionCard key={lead.id} leadId={lead.id} />

              {/* DEMO + Site Status Section (método Gabriel Miranda) */}
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-violet-300">🎨 Site Demo + Status (método Gabriel Miranda)</div>
                  {lead.site_status && lead.site_status !== "unknown" && (
                    <SiteStatusBadge status={lead.site_status} />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" onClick={generateDemo}>
                    <Sparkle className="h-3.5 w-3.5" /> {lead.demo_url ? "Abrir Demo" : "Gerar Demo"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyDemoUrl}>
                    {demoCopied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar link</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={checkSite} disabled={checkingSite}>
                    {checkingSite ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verificando…</> : <><Globe className="h-3.5 w-3.5" /> Verificar site</>}
                  </Button>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono break-all bg-black/20 px-2 py-1.5 rounded">{demoUrl}</div>
                {lead.demo_generated_at && (
                  <div className="text-[10px] text-zinc-500">Demo gerado em {new Date(lead.demo_generated_at).toLocaleString("pt-BR")}</div>
                )}
              </div>

              {/* Enriquecimento IA (Clay-style) */}
              <LeadEnrichmentCard leadId={lead.id} />

              {/* BANT Checklist (método Gabriel Miranda) */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">🎯 Qualificação BANT</div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${bantQualified ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                    {bantScore}/4 {bantQualified ? "✓ Qualificado" : "— Pendente"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <BantCheckbox
                    label="Budget"
                    description="Tem orçamento? (R$1.400-2.000 + R$200-500/mês)"
                    checked={bant.budget}
                    onChange={(v) => setBant({ ...bant, budget: v })}
                  />
                  <BantCheckbox
                    label="Authority"
                    description="É o decisor? (dono / sócio / gerente)"
                    checked={bant.authority}
                    onChange={(v) => setBant({ ...bant, authority: v })}
                  />
                  <BantCheckbox
                    label="Need"
                    description="Tem necessidade real? (site quebrado / sem site / concorrência)"
                    checked={bant.need}
                    onChange={(v) => setBant({ ...bant, need: v })}
                  />
                  <BantCheckbox
                    label="Timing"
                    description="Está no timing? (decisão em 30 dias)"
                    checked={bant.timing}
                    onChange={(v) => setBant({ ...bant, timing: v })}
                  />
                </div>
                <Textarea
                  value={bant.notes}
                  onChange={(e) => setBant({ ...bant, notes: e.target.value })}
                  rows={2}
                  placeholder="Notas BANT — evidências coletadas na conversa..."
                />
                {!bantQualified && bantScore > 0 && (
                  <div className="text-[10px] text-amber-300 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Faltam {3 - bantScore} critério(s) para qualificar (mínimo 3)
                  </div>
                )}
              </div>

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
                <button onClick={() => generateProposta()} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/20 hover:bg-violet-500/25">
                  <FileText className="h-3.5 w-3.5" /> Gerar Proposta
                </button>
                <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/20 hover:bg-rose-500/25 ml-auto"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
              </div>
            </>
          )}

          {tab === "scripts" && (
            <WhatsAppScriptsTab
              lead={lead}
              leadContext={leadContext}
              loadingContext={loadingContext}
              demoUrl={demoUrl}
            />
          )}

          {tab === "copilot" && (
            <AiCopilotTab lead={lead} leadContext={leadContext} />
          )}

          {tab === "prompt" && (
            <SitePromptTab lead={lead} leadContext={leadContext} />
          )}

          {tab === "tasks" && (
            <>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nova tarefa / lembrete</div>
                <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Ex: Enviar proposta até sexta" />
                <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={2} placeholder="Detalhes (opcional)" />
                <div className="flex gap-2">
                  <Input type="datetime-local" value={newTask.due_at} onChange={(e) => setNewTask({ ...newTask, due_at: e.target.value })} className="flex-1" />
                  <Button variant="primary" size="sm" onClick={addTask} disabled={!newTask.title}><Plus className="h-3.5 w-3.5" /> Adicionar</Button>
                </div>
              </div>

              {loadingExtras ? (
                <div className="py-6 text-center text-zinc-500 text-xs"><RefreshCw className="h-4 w-4 animate-spin inline mr-1" /> Carregando tarefas…</div>
              ) : tasks.length === 0 ? (
                <EmptyState title="Nenhuma tarefa" description="Crie tarefas e lembretes para acompanhar este lead." icon={<ListChecks className="h-8 w-8" />} hint="Use para: enviar proposta, fazer follow-up, agendar call, etc." />
              ) : (
                <div className="space-y-2">
                  {tasks.map(t => (
                    <div key={t.id} className={`flex items-start gap-2 rounded-lg border p-3 ${t.done ? "border-white/5 bg-white/[0.01] opacity-60" : "border-white/5 bg-white/[0.02]"}`}>
                      <button onClick={() => toggleTask(t.id, t.done)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${t.done ? "bg-emerald-500/30 border-emerald-500/40 text-emerald-300" : "border-white/20 hover:border-emerald-500/50"}`}>
                        {t.done && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${t.done ? "line-through text-zinc-500" : "text-white"}`}>{t.title}</div>
                        {t.description && <div className="text-[11px] text-zinc-400 mt-0.5 whitespace-pre-wrap">{t.description}</div>}
                        {t.due_at && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-300">
                            <Clock className="h-3 w-3" /> Vence em {new Date(t.due_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                      </div>
                      <button onClick={() => deleteTask(t.id)} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "history" && (
            <>
              {loadingExtras ? (
                <div className="py-6 text-center text-zinc-500 text-xs"><RefreshCw className="h-4 w-4 animate-spin inline mr-1" /> Carregando histórico…</div>
              ) : history.length === 0 ? (
                <EmptyState title="Sem histórico" description="Interações e mudanças de estágio aparecem aqui automaticamente." icon={<History className="h-8 w-8" />} hint="Salvar notas, mudar estágio ou registrar contato cria entradas." />
              ) : (
                <div className="relative space-y-3 pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  {history.map(h => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-2.5 top-1 h-2 w-2 rounded-full bg-emerald-400" />
                      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{historyLabel(h.event_type)}</span>
                          <span className="text-[10px] text-zinc-500">{new Date(h.created_at).toLocaleString("pt-BR")}</span>
                        </div>
                        {h.from_stage && h.to_stage && (
                          <div className="mt-1 text-xs text-zinc-300">Estágio: <span className="text-zinc-400">{STAGE_LABELS[h.from_stage] || h.from_stage}</span> → <span className="text-emerald-300 font-semibold">{STAGE_LABELS[h.to_stage] || h.to_stage}</span></div>
                        )}
                        {h.notes && <p className="mt-1 text-xs text-zinc-300 whitespace-pre-wrap">{h.notes}</p>}
                        {h.actor && h.actor !== "system" && <div className="mt-1 text-[10px] text-zinc-500">por {h.actor}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-white/5 px-4 sm:px-5 py-3 flex justify-end gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={saveChanges} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
        </div>
      </div>
    </div>
  );
}

function BantCheckbox({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition ${checked ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}
    >
      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "bg-emerald-500/30 border-emerald-500/40 text-emerald-300" : "border-white/20"}`}>
        {checked && <Check className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold ${checked ? "text-emerald-300" : "text-white"}`}>{label}</div>
        <div className="text-[10px] text-zinc-500 mt-0.5">{description}</div>
      </div>
    </button>
  );
}

function SiteStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string; icon: any }> = {
    ok: { color: "bg-emerald-500/15 text-emerald-300", label: "Site OK", icon: ShieldCheck },
    broken: { color: "bg-rose-500/15 text-rose-300", label: "Site quebrado", icon: AlertTriangle },
    slow: { color: "bg-amber-500/15 text-amber-300", label: "Site lento", icon: Clock },
    ssl_invalid: { color: "bg-rose-500/15 text-rose-300", label: "SSL inválido", icon: AlertTriangle },
    no_site: { color: "bg-zinc-500/15 text-zinc-300", label: "Sem site", icon: Globe },
    unknown: { color: "bg-zinc-500/15 text-zinc-400", label: "Não verificado", icon: Globe },
  };
  const c = config[status] || config.unknown;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`}>
      <Icon className="h-3 w-3" /> {c.label}
    </span>
  );
}

// =====================================================
// WHATSAPP SCRIPTS TAB — Roteiros prontos para enviar (método Gabriel Miranda + neurociência)
// =====================================================
function WhatsAppScriptsTab({
  lead,
  leadContext,
  loadingContext,
  demoUrl,
}: {
  lead: Lead;
  leadContext: { niche: string; city: string; hasWebsite: boolean | null; demoUrl: string } | null;
  loadingContext: boolean;
  demoUrl: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [dynamicScript, setDynamicScript] = useState<Script | null>(null);
  const [dynamicLoading, setDynamicLoading] = useState(false);
  const [dynamicVariant, setDynamicVariant] = useState<"long" | "loss" | "reciprocity" | "pattern">("long");
  const [dynamicError, setDynamicError] = useState<string | null>(null);

  // Fetch products catalog for Long Form script
  useEffect(() => {
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  if (loadingContext) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs">
        <RefreshCw className="h-4 w-4 animate-spin inline mr-1" /> Carregando contexto do lead…
      </div>
    );
  }

  const niche = leadContext?.niche || "negócio local";
  const city = leadContext?.city || "Recife, PE";
  const hasWebsite = leadContext?.hasWebsite;
  const scriptVars: ScriptVars = {
    nome: lead.name,
    nicho: niche,
    cidade: city,
    demoUrl: leadContext?.demoUrl || demoUrl,
    whatsapp: lead.whatsapp || undefined,
  };

  const { primary, followup } = getScriptsForLead(scriptVars, hasWebsite ?? null);
  // Long Form script — uses products catalog dynamically
  const longForm = products.length > 0 ? getLongFormScript(scriptVars, products) : null;

  const tipoLabel = hasWebsite === true ? "TEM SITE" : hasWebsite === false ? "SEM SITE" : "STATUS DESCONHECIDO (sem site)";
  const tipoColor = hasWebsite === true
    ? "border-blue-500/30 bg-blue-500/[0.06] text-blue-300"
    : "border-rose-500/30 bg-rose-500/[0.06] text-rose-300";

  function copyScript(s: Script) {
    navigator.clipboard.writeText(s.body);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function openWhatsApp(s: Script) {
    if (!lead.whatsapp) {
      alert("Lead não tem WhatsApp cadastrado.");
      return;
    }
    const num = lead.whatsapp.replace(/\D/g, "");
    const waNum = num.startsWith("55") ? num : (num.length === 10 || num.length === 11 ? "55" + num : num);
    const url = `https://wa.me/${waNum}?text=${encodeURIComponent(s.body)}`;
    window.open(url, "_blank");
  }

  async function generateDynamic() {
    setDynamicLoading(true);
    setDynamicError(null);
    setDynamicScript(null);
    try {
      const r = await fetch("/api/admin/dynamic-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          nome: lead.name,
          nicho: niche,
          cidade: city,
          demo_url: leadContext?.demoUrl || demoUrl,
          has_site: hasWebsite ?? false,
          variant: dynamicVariant,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Falha");
      setDynamicScript(j);
    } catch (e: any) {
      setDynamicError(e.message);
    } finally {
      setDynamicLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Context info */}
      <div className={`rounded-xl border p-3 ${tipoColor}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider">
            {tipoLabel}
          </div>
          <div className="text-[10px] text-zinc-400">
            Nicho: <strong className="text-zinc-200">{niche}</strong> · Cidade: <strong className="text-zinc-200">{city}</strong>
          </div>
        </div>
        <div className="mt-1.5 text-[11px] text-zinc-400">
          {hasWebsite === true
            ? "💬 Roteiros focam em 'coisas quebradas no site' + demo já corrigido"
            : "💬 Roteiros focam em 'não encontrei site' + demo já criado"}
        </div>
      </div>

      {/* Gerador dinâmico IA (Voz do Clodoaldo) */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.06] p-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <span className="text-sm font-bold text-violet-200">Roteiro IA · Voz do Clodoaldo</span>
          </div>
          <select
            value={dynamicVariant}
            onChange={(e) => setDynamicVariant(e.target.value as any)}
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-200 focus:border-violet-500/50 focus:outline-none"
          >
            <option value="long">Long Form (completo)</option>
            <option value="loss">Loss Aversion (curto)</option>
            <option value="reciprocity">Reciprocity (curto)</option>
            <option value="pattern">Pattern Interrupt (muito curto)</option>
          </select>
        </div>
        <p className="text-[11px] text-zinc-400 mb-2">
          Gera roteiro dinâmico via Gemini no <strong className="text-zinc-300">seu estilo pessoal</strong> (treinado em <code className="rounded bg-black/30 px-1">/admin/voz</code>).
          Fallback automático pra estático se necessário.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateDynamic} disabled={dynamicLoading}>
            {dynamicLoading ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Gerando…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Gerar roteiro dinâmico</>
            )}
          </Button>
        </div>

        {dynamicError && (
          <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-2 text-[11px] text-rose-200">
            {dynamicError}
          </div>
        )}

        {dynamicScript && (
          <div className="mt-3 rounded-lg border border-violet-500/30 bg-black/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                {dynamicScript.technique}
              </div>
              {dynamicScript.dynamic && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300 ring-1 ring-emerald-500/20">
                  IA · Voz ativa
                </span>
              )}
            </div>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/30 border border-white/5 p-3 text-xs text-zinc-200 font-sans leading-relaxed">{dynamicScript.body}</pre>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => copyScript(dynamicScript)}>
                {copiedId === dynamicScript.id ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
              </Button>
              {lead.whatsapp && (
                <Button variant="primary" size="sm" onClick={() => openWhatsApp(dynamicScript)}>
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Long Form script (método Gabriel Miranda completo) */}
      {longForm && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">
            📋 Roteiro Long Form — completo (com catálogo de produtos)
          </div>
          <div className="space-y-3">
            <ScriptCard
              script={longForm}
              onCopy={() => copyScript(longForm)}
              onOpenWa={() => openWhatsApp(longForm)}
              copied={copiedId === longForm.id}
              hasWhatsapp={!!lead.whatsapp}
              highlight
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1.5">
            💡 Lista todos os {products.length} produtos do seu catálogo com preços. Edite em <a href="/admin/produtos" className="underline text-emerald-400">/admin/produtos</a>.
          </div>
        </div>
      )}

      {/* Primary scripts — 3 variants */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 mt-4">
          📝 Roteiros curtos — 3 variantes (escolha a que preferir)
        </div>
        <div className="space-y-3">
          {primary.map((s) => (
            <ScriptCard key={s.id} script={s} onCopy={() => copyScript(s)} onOpenWa={() => openWhatsApp(s)} copied={copiedId === s.id} hasWhatsapp={!!lead.whatsapp} />
          ))}
        </div>
      </div>

      {/* Follow-up scripts */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 mt-4">
          🔄 Roteiros de follow-up (3-7 dias sem resposta)
        </div>
        <div className="space-y-3">
          {followup.map((s) => (
            <ScriptCard key={s.id} script={s} onCopy={() => copyScript(s)} onOpenWa={() => openWhatsApp(s)} copied={copiedId === s.id} hasWhatsapp={!!lead.whatsapp} />
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[11px] text-amber-200/80">
        💡 <strong>Estratégia:</strong> Use o <strong>Long Form</strong> quando o lead responder "sim, quero ver mais"
        (mostra ecossistema completo + preços). Use os <strong>curtos</strong> no primeiro contato (alta conversão, baixo compromisso).
      </div>
    </div>
  );
}

function ScriptCard({ script, onCopy, onOpenWa, copied, hasWhatsapp, highlight }: { script: Script; onCopy: () => void; onOpenWa: () => void; copied: boolean; hasWhatsapp: boolean; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-white/5 bg-white/[0.02]"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${highlight ? "bg-emerald-500/15 text-emerald-300" : "bg-violet-500/15 text-violet-300"}`}>Variante {script.variant}</span>
            <span className="text-[10px] text-zinc-400">{script.technique}</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{script.description}</div>
        </div>
      </div>
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/30 border border-white/5 p-3 text-xs text-zinc-200 font-sans leading-relaxed max-h-[500px] overflow-y-auto">{script.body}</pre>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={onCopy}>
          {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar texto</>}
        </Button>
        {hasWhatsapp && (
          <Button variant="primary" size="sm" onClick={onOpenWa}>
            <MessageCircle className="h-3.5 w-3.5" /> Abrir no WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================
// AI COPILOT TAB — Gemini analisa conversa + sugere próxima resposta
// =====================================================
function AiCopilotTab({ lead, leadContext }: { lead: Lead; leadContext: any }) {
  const [messages, setMessages] = useState<Array<{ from: "lead" | "me"; text: string }>>([
    { from: "me", text: "" },
    { from: "lead", text: "" },
  ]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function updateMessage(idx: number, text: string) {
    const updated = [...messages];
    updated[idx] = { ...updated[idx], text };
    setMessages(updated);
  }

  function addMessagePair() {
    setMessages([...messages, { from: "me", text: "" }, { from: "lead", text: "" }]);
  }

  async function analyze() {
    const validMsgs = messages.filter(m => m.text.trim());
    if (validMsgs.length === 0) {
      setError("Digite pelo menos uma mensagem da conversa.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/admin/ai-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          lead_name: lead.name,
          niche: leadContext?.niche || lead.intent || "negócio local",
          city: leadContext?.city || "Recife, PE",
          has_website: leadContext?.hasWebsite ?? false,
          conversation: validMsgs,
          products_summary: "Site R$1.700, SEO R$490, Google Meu Negócio R$290, Cardápio Digital R$990, Artes R$39/mês, Pacote Recorrência R$497/mês",
        }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Falha");
      setResult(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyReply() {
    if (!result?.suggested_reply) return;
    navigator.clipboard.writeText(result.suggested_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openWhatsApp() {
    if (!result?.suggested_reply || !lead.whatsapp) return;
    const num = lead.whatsapp.replace(/\D/g, "");
    const waNum = num.startsWith("55") ? num : `55${num}`;
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(result.suggested_reply)}`, "_blank");
  }

  const tempConfig: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
    quente: { color: "text-rose-300", bg: "bg-rose-500/15 border-rose-500/30", label: "QUENTE", emoji: "🔥" },
    morno: { color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30", label: "MORNO", emoji: "🌡️" },
    frio: { color: "text-blue-300", bg: "bg-blue-500/15 border-blue-500/30", label: "FRIO", emoji: "❄️" },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-bold text-violet-300">IA Copiloto</span>
          {result?.memory_info?.loaded && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/20">
              🧠 Memória carregada · {result.memory_info.conversation_count}ª conversa
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-400">
          Cole as mensagens da conversa com o lead. A IA analisa, classifica a temperatura (quente/morno/frio) e sugere a próxima resposta ideal.
          {result?.memory_info?.saved && <span className="text-emerald-300/80"> Memória desta conversa foi salva automaticamente.</span>}
        </p>
      </div>

      {/* Conversation input */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Conversa com o lead</div>
        {messages.map((msg, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${msg.from === "lead" ? "text-amber-300" : "text-emerald-300"}`}>
                {msg.from === "lead" ? "← Lead disse:" : "→ Você enviou:"}
              </span>
            </div>
            <Textarea
              value={msg.text}
              onChange={(e) => updateMessage(i, e.target.value)}
              rows={2}
              placeholder={msg.from === "lead" ? "O que o lead respondeu..." : "O que você enviou..."}
              className="text-xs"
            />
          </div>
        ))}
        <button onClick={addMessagePair} className="text-[10px] text-emerald-400 hover:text-emerald-300 underline">
          + Adicionar mais mensagens
        </button>
      </div>

      {/* Analyze button */}
      <Button variant="primary" onClick={analyze} disabled={loading} className="w-full">
        {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analisando com IA…</> : <><Sparkles className="h-4 w-4" /> Analisar conversa</>}
      </Button>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">⚠ {error}</div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Temperature badge */}
          {result.temperature && (
            <div className={`rounded-xl border p-3 ${tempConfig[result.temperature]?.bg || ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tempConfig[result.temperature]?.emoji}</span>
                  <div>
                    <div className={`text-sm font-bold ${tempConfig[result.temperature]?.color}`}>
                      {tempConfig[result.temperature]?.label}
                    </div>
                    {result.temperature_reason && (
                      <div className="text-[11px] text-zinc-400 mt-0.5">{result.temperature_reason}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggested reply */}
          {result.suggested_reply && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">💬 Resposta sugerida pela IA</div>
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/30 border border-white/5 p-3 text-xs text-zinc-200 font-sans leading-relaxed">{result.suggested_reply}</pre>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={copyReply}>
                  {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                </Button>
                {lead.whatsapp && (
                  <Button variant="primary" size="sm" onClick={openWhatsApp}>
                    <MessageCircle className="h-3.5 w-3.5" /> Enviar no WhatsApp
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Next action */}
          {result.next_action && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1">🎯 Próxima ação recomendada</div>
              <div className="text-xs text-zinc-200">{result.next_action}</div>
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[11px] text-amber-200/80">
        💡 <strong>Como usar:</strong> Cole as últimas 2-4 mensagens trocadas com o lead (na ordem que aconteceram).
        A IA usa o contexto + nicho + produtos do catálogo pra sugerir a melhor resposta. Custo: R$ 0 (Gemini free tier).
      </div>
    </div>
  );
}

// =====================================================
// SITE PROMPT TAB — gera prompt + compartilha pra plataformas AI
// =====================================================
function SitePromptTab({ lead, leadContext }: { lead: Lead; leadContext: any }) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedPlatform, setOpenedPlatform] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroUrl, setHeroUrl] = useState<string | null>(lead.hero_image_url || null);
  const [heroPrompt, setHeroPrompt] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [heroStyle, setHeroStyle] = useState<"modern" | "elegant" | "vibrant" | "minimal">("modern");

  async function generatePrompt() {
    setLoading(true);
    setError(null);
    setPrompt(null);
    try {
      const resp = await fetch("/api/admin/generate-site-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: lead.id }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Falha");
      setPrompt(json.prompt);
      setPlatforms(json.platforms || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateHero() {
    setHeroLoading(true);
    setHeroError(null);
    setHeroUrl(null);
    setHeroPrompt(null);
    try {
      const nicho = leadContext?.niche || lead.intent || "negócio local";
      const cidade = leadContext?.city || "";
      const resp = await fetch("/api/admin/generate-hero-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          nicho,
          cidade,
          style: heroStyle,
        }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Falha");
      setHeroUrl(json.url);
      setHeroPrompt(json.prompt_used);
    } catch (e: any) {
      setHeroError(e.message);
    } finally {
      setHeroLoading(false);
    }
  }

  function copyPrompt() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openPlatform(platform: any) {
    if (!platform.url) return;
    // TODAS as plataformas agora usam URL params (prompt pré-preenchido)
    // Também copia pra clipboard como backup (caso a plataforma não aceite URL param)
    if (prompt) navigator.clipboard.writeText(prompt);
    setOpenedPlatform(platform.name);
    window.open(platform.url, "_blank");
    setTimeout(() => setOpenedPlatform(null), 3000);
  }

  return (
    <div className="space-y-4">
      {/* Hero image generator (IA) */}
      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/[0.06] p-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            <span className="text-sm font-bold text-fuchsia-200">Hero image IA · personalizada pro nicho</span>
          </div>
          <select
            value={heroStyle}
            onChange={(e) => setHeroStyle(e.target.value as any)}
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-200 focus:border-fuchsia-500/50 focus:outline-none"
          >
            <option value="modern">Moderno (neon sutil, dark)</option>
            <option value="elegant">Elegante (dourado, cinema)</option>
            <option value="vibrant">Vibrante (cores saturadas)</option>
            <option value="minimal">Minimalista (espaço negativo)</option>
          </select>
        </div>
        <p className="text-[11px] text-zinc-400 mb-2">
          Gemini descreve o visual ideal pro nicho + IA gera hero image 1440x720 única. Salva no lead e pode usar na demo.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateHero} disabled={heroLoading}>
            {heroLoading ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Gerando…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Gerar hero image</>
            )}
          </Button>
        </div>

        {heroError && (
          <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-2 text-[11px] text-rose-200">
            {heroError}
          </div>
        )}

        {heroUrl && (
          <div className="mt-3 space-y-2">
            <div className="overflow-hidden rounded-lg border border-fuchsia-500/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroUrl} alt="Hero IA" className="w-full h-auto" />
            </div>
            {heroPrompt && (
              <details className="rounded-lg border border-white/5 bg-black/30 p-2">
                <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Prompt visual usado
                </summary>
                <p className="mt-1 text-[11px] text-zinc-400 italic">{heroPrompt}</p>
              </details>
            )}
            <div className="flex gap-2">
              <a
                href={heroUrl}
                download={`hero-${lead.name.replace(/\s+/g, "-").toLowerCase()}.png`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Baixar
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(heroUrl)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-bold text-blue-300">Prompt do Site Premium</span>
        </div>
        <p className="text-[11px] text-zinc-400">
          Gera um prompt premium personalizado por plataforma AI. Todas abrem com o prompt pré-preenchido no chat.
          Inclui instruções de design premium, imagens reais ou AI-generated, e conteúdo específico do nicho.
        </p>
      </div>

      {/* Generate button */}
      {!prompt && (
        <Button variant="primary" onClick={generatePrompt} disabled={loading} className="w-full">
          {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Gerando prompt premium…</> : <><Code2 className="h-4 w-4" /> Gerar prompt do site premium</>}
        </Button>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">⚠ {error}</div>
      )}

      {/* Platforms grid — TODAS com URL params */}
      {prompt && platforms.length > 0 && (
        <>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              🚀 Abrir na plataforma AI (prompt pré-preenchido)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.name}
                  onClick={() => openPlatform(p)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition hover:scale-105 ${p.color}`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs font-bold">{p.name}</span>
                  <span className="text-[9px] opacity-70 text-center">{p.description}</span>
                  {openedPlatform === p.name && (
                    <span className="text-[9px] text-emerald-400 font-bold">✓ Aberto!</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Copy button */}
          <Button variant="outline" size="sm" onClick={copyPrompt} className="w-full">
            {copied ? <><Check className="h-3.5 w-3.5" /> Copiado! (backup caso a plataforma não aceite URL)</> : <><Copy className="h-3.5 w-3.5" /> Copiar prompt (backup)</>}
          </Button>

          {/* Prompt preview */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              📝 Prompt premium gerado ({prompt.length} chars)
            </div>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/30 border border-white/5 p-3 text-[11px] text-zinc-300 font-mono leading-relaxed max-h-[300px] overflow-y-auto">{prompt}</pre>
          </div>

          {/* Tip */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-[11px] text-emerald-200/80">
            ✅ <strong>Todas as plataformas abrem com prompt pré-preenchido.</strong>
            <br/>
            Se não estiver logado, faça login — o prompt continua na URL. Se a plataforma não aceitar URL params, o prompt também foi copiado pra área de transferência (Cole com Ctrl+V).
            <br/><br/>
            💎 <strong>O prompt é personalizado por plataforma:</strong> v0 foca em UI/components, Bolt em app completo, Lovable em React+deploy, Replit em deploy direto, etc.
          </div>
        </>
      )}
    </div>
  );
}

function historyLabel(eventType: string): string {
  const m: Record<string, string> = {
    stage_change: "Mudança de estágio",
    note: "Nota",
    email_sent: "Email enviado",
    whatsapp_sent: "WhatsApp enviado",
    call: "Ligação",
    meeting: "Reunião",
    created: "Lead criado",
    demo_generated: "Demo gerado",
    site_checked: "Site verificado",
    bant_qualified: "BANT qualificado",
  };
  return m[eventType] || eventType;
}

// =====================================================
// LEAD SCORE BADGE — pontuação 0-100
// =====================================================
function LeadScoreBadge({ lead }: { lead: Lead }) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    // Calcula score localmente (sem API pra não delay)
    let s = 0;
    if (lead.whatsapp) s += 20;
    if (lead.site_status === "no_site" || lead.site_status === "broken") s += 20;
    else if (!lead.site_status || lead.site_status === "unknown") s += 10;
    const bantCount = [lead.bant_budget, lead.bant_authority, lead.bant_need, lead.bant_timing].filter(Boolean).length;
    if (bantCount >= 3) s += 20;
    else if (bantCount > 0) s += bantCount * 5;
    if (lead.demo_generated_at) s += 10;
    if (lead.estimated_value_cents > 0) s += 10;
    const stageBonus: Record<string, number> = { "qualificado": 5, "proposta": 10, "negociacao": 15 };
    s += stageBonus[lead.stage] || 0;
    if (lead.source === "parceiros") s += 5;
    setScore(Math.min(s, 100));
  }, [lead]);

  if (score === null) return null;
  const level = score >= 70 ? "quente" : score >= 40 ? "morno" : "frio";
  const config = {
    quente: { bg: "bg-rose-500/15 text-rose-300", emoji: "🔥" },
    morno: { bg: "bg-amber-500/15 text-amber-300", emoji: "🌡️" },
    frio: { bg: "bg-blue-500/15 text-blue-300", emoji: "❄️" },
  };
  const c = config[level];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.bg}`} title={`Score: ${score}/100`}>
      {c.emoji} {score}
    </span>
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

// =====================================================
// LeadEnrichmentCard — dados enriquecidos via crawler IA
// =====================================================
function LeadEnrichmentCard({ leadId }: { leadId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/lead-enrichment?lead_id=${leadId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [leadId]);

  async function enrichNow() {
    setEnriching(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/lead-enrichment?lead_id=${leadId}`, { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Falha");
      // Recarregar dados
      const r2 = await fetch(`/api/admin/lead-enrichment?lead_id=${leadId}`);
      const d2 = await r2.json();
      setData(d2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnriching(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1">🧠 Enriquecimento IA</div>
        <div className="text-xs text-zinc-500"><RefreshCw className="inline h-3 w-3 animate-spin mr-1" /> Carregando dados enriquecidos…</div>
      </div>
    );
  }

  if (!data?.enriched) {
    return (
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">🧠 Enriquecimento IA (Clay-style)</div>
          <Button variant="outline" size="sm" onClick={enrichNow} disabled={enriching}>
            {enriching ? <><RefreshCw className="h-3 w-3 animate-spin" /> Enriquecendo…</> : <><Sparkles className="h-3 w-3" /> Enriquecer agora</>}
          </Button>
        </div>
        <p className="text-[11px] text-zinc-400">
          {data?.reason || "Sem dados enriquecidos ainda."} Crawler IA busca no site do lead: nome do dono, e-mail de contato, Instagram.
        </p>
        {error && <div className="text-[11px] text-rose-300">{error}</div>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/[0.06] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">🧠 Dados enriquecidos (IA Crawler)</div>
        <Button variant="outline" size="sm" onClick={enrichNow} disabled={enriching}>
          {enriching ? <><RefreshCw className="h-3 w-3 animate-spin" /> Re-enriquecendo…</> : <><RefreshCw className="h-3 w-3" /> Re-rodar</>}
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase text-zinc-500">👤 Dono / Fundador</div>
          <div className="mt-1 text-sm text-white">{data.owner_name || <span className="text-zinc-600 italic">não encontrado</span>}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase text-zinc-500">📧 E-mail principal</div>
          <div className="mt-1 text-sm text-white break-all">
            {data.owner_email ? (
              <a href={`mailto:${data.owner_email}`} className="text-cyan-300 hover:underline">{data.owner_email}</a>
            ) : <span className="text-zinc-600 italic">não encontrado</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase text-zinc-500">📸 Instagram</div>
          <div className="mt-1 text-sm text-white">
            {data.instagram_handle ? (
              <a href={`https://instagram.com/${data.instagram_handle}`} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">@{data.instagram_handle}</a>
            ) : <span className="text-zinc-600 italic">não encontrado</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase text-zinc-500">🌐 Website crawleado</div>
          <div className="mt-1 text-sm text-white break-all">
            {data.website ? (
              <a href={data.website} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">{data.website}</a>
            ) : <span className="text-zinc-600 italic">—</span>}
          </div>
        </div>
      </div>

      {data.enrichment_data?.found_emails?.length > 0 && (
        <details className="rounded-lg border border-white/5 bg-black/30 p-2">
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Outros e-mails encontrados ({data.enrichment_data.found_emails.length})
          </summary>
          <div className="mt-1 space-y-1">
            {data.enrichment_data.found_emails.map((e: string, i: number) => (
              <div key={i} className="text-[11px] text-zinc-400 font-mono">{e}</div>
            ))}
          </div>
        </details>
      )}

      {data.enriched_at && (
        <div className="text-[10px] text-zinc-500">Enriquecido em {new Date(data.enriched_at).toLocaleString("pt-BR")}</div>
      )}

      {error && <div className="text-[11px] text-rose-300">{error}</div>}
    </div>
  );
}
