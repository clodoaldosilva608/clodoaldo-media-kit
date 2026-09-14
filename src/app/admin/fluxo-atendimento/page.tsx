"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, Button, EmptyState } from "@/components/admin/ui";
import {
  RefreshCw, Clock, CheckCircle2, MessageCircle, AlertCircle,
  Phone, Mail, Globe, Send, Calendar, X, ExternalLink, Search,
} from "lucide-react";

interface Prospect {
  id: string;
  name: string;
  niche: string;
  city: string;
  whatsapp: string | null;
  phone: string | null;
  has_website: boolean;
  website?: string | null;
  email?: string | null;
  rating: number | null;
  status: string;
  send_status: string;
  last_contact_at: string | null;
  contacted_count: number;
  replied: boolean;
  reply_classification: string | null;
  next_follow_up: string | null;
  message_variant: string | null;
  created_at: string;
  formatted_address?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  instagram_handle?: string | null;
  instagram?: string | null;
  notes?: string | null;
}

const STAGES = [
  { key: "pending", label: "Pendentes", description: "Ainda não contactados", color: "amber", icon: Clock },
  { key: "contacted", label: "Contactados", description: "Mensagem enviada, aguardando resposta", color: "blue", icon: Send },
  { key: "replied", label: "Responderam", description: "Lead respondeu — agendar follow-up", color: "violet", icon: MessageCircle },
  { key: "meeting", label: "Reunião agendada", description: "Reunião marcada / qualificado", color: "cyan", icon: Calendar },
  { key: "closed", label: "Fechados", description: "Virou cliente", color: "emerald", icon: CheckCircle2 },
  { key: "lost", label: "Perdidos", description: "Recusou / sem interesse", color: "rose", icon: X },
];

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatBRLDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function FluxoAtendimentoPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveChanges, setLiveChanges] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  // Estados de busca e filtros
  const [search, setSearch] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<"all" | "with" | "without">("all");
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [repliedFilter, setRepliedFilter] = useState<"all" | "replied" | "no_reply">("all");

  // Helper: busca textual em vários campos do prospect
  const matchSearch = (p: Prospect, q: string): boolean => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase().trim();
    const haystack = [
      p.name, p.whatsapp, p.phone, p.email, p.website,
      p.city, p.niche, p.formatted_address, p.notes,
      p.owner_name, p.owner_email, p.instagram_handle, p.instagram,
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(needle);
  };

  // Helper: aplicação combinada de todos os filtros
  const matchFilters = (p: Prospect): boolean => {
    if (!matchSearch(p, search)) return false;
    if (websiteFilter === "with" && !p.has_website) return false;
    if (websiteFilter === "without" && p.has_website) return false;
    if (nicheFilter !== "all" && p.niche !== nicheFilter) return false;
    if (cityFilter !== "all" && p.city !== cityFilter) return false;
    if (repliedFilter === "replied" && !p.replied) return false;
    if (repliedFilter === "no_reply" && p.replied) return false;
    return true;
  };

  // Listas únicas pra selects de nicho e cidade
  const uniqueNiches = Array.from(new Set(prospects.map(p => p.niche).filter(Boolean))).sort();
  const uniqueCities = Array.from(new Set(prospects.map(p => p.city).filter(Boolean))).sort();

  // Contagem de leads que batem com os filtros (antes de agrupar por stage)
  const filteredProspects = prospects.filter(matchFilters);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/admin/prospects/list");
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Erro ${resp.status}`);

      const newProspects: Prospect[] = json.prospects || [];

      // Detectar mudanças comparando com estado anterior
      setProspects(prev => {
        if (prev.length === 0) return newProspects;
        const prevMap = new Map(prev.map(p => [p.id, p]));
        let changes = 0;
        const events: string[] = [];
        for (const np of newProspects) {
          const old = prevMap.get(np.id);
          if (!old) {
            changes++;
            events.push(`🆕 Novo lead: ${np.name}`);
          } else if (old.status !== np.status || old.send_status !== np.send_status) {
            changes++;
            const stageLabel = STAGES.find(s => {
              if (s.key === "pending") return np.status === "new" && np.send_status === "pending";
              if (s.key === "contacted") return np.send_status === "sent" && !np.replied;
              if (s.key === "replied") return np.replied && np.status !== "fechado" && np.status !== "perdido";
              if (s.key === "meeting") return np.status === "meeting";
              if (s.key === "closed") return np.status === "fechado";
              if (s.key === "lost") return np.status === "perdido";
              return false;
            });
            events.push(`📦 ${np.name} → ${stageLabel?.label || np.status}`);
          } else if (old.replied !== np.replied && np.replied) {
            changes++;
            events.push(`💬 ${np.name} respondeu!`);
          }
        }
        if (changes > 0) {
          setLiveChanges(c => c + changes);
          setToast(events[0] + (events.length > 1 ? ` (+${events.length - 1} outras)` : ""));
          setTimeout(() => setToast(null), 5000);
        }
        return newProspects;
      });

      setLastUpdate(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Polling a cada 10s (efeito "AO VIVO" sem depender de config Realtime)
  useEffect(() => {
    const interval = setInterval(() => load(true), 10000);
    return () => clearInterval(interval);
  }, [load]);

  // Group by stage — usando filteredProspects (aplica busca + filtros)
  const grouped = STAGES.map(stage => {
    let items: Prospect[] = [];
    if (stage.key === "pending") {
      items = filteredProspects.filter(p => p.status === "new" && p.send_status === "pending");
    } else if (stage.key === "contacted") {
      items = filteredProspects.filter(p => p.send_status === "sent" && !p.replied && p.status !== "fechado" && p.status !== "perdido");
    } else if (stage.key === "replied") {
      items = filteredProspects.filter(p => p.replied && p.status !== "fechado" && p.status !== "perdido" && p.status !== "meeting");
    } else if (stage.key === "meeting") {
      items = filteredProspects.filter(p => p.status === "meeting" || (p.replied && p.status === "qualificado"));
    } else if (stage.key === "closed") {
      items = filteredProspects.filter(p => p.status === "fechado");
    } else if (stage.key === "lost") {
      items = filteredProspects.filter(p => p.status === "perdido");
    }
    return { ...stage, items, count: items.length };
  });

  const totalProspects = filteredProspects.length;
  const totalPending = grouped[0].count;
  const totalContacted = grouped[1].count;
  const totalReplied = grouped[2].count;
  const totalClosed = grouped[4].count;
  const replyRate = totalContacted > 0 ? Math.round((totalReplied / totalContacted) * 100) : 0;

  return (
    <AdminShell title="Fluxo de Atendimento">
      {/* Toast de mudança em tempo real */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/95 backdrop-blur px-4 py-3 shadow-2xl shadow-emerald-500/20 max-w-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              {toast}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-zinc-400">
            Visão kanban do funil: pendentes → contactados → responderam → reunião → fechados. Mostra quem já foi contactado pra não duplicar.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            AO VIVO
            {liveChanges > 0 && <span className="ml-1 rounded-full bg-emerald-500/30 px-1.5 text-emerald-200">{liveChanges}</span>}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-[10px] text-zinc-500 hidden sm:inline">
              Atualizado {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>
      </div>

      {/* Barra de busca + filtros avançados */}
      <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Busca textual */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder={`Nome, WhatsApp, email, website, endereço, dono, instagram... (${filteredProspects.length} de ${prospects.length})`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900 pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:text-zinc-300"
                  title="Limpar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro: Tem site */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Site</label>
            <select
              value={websiteFilter}
              onChange={e => setWebsiteFilter(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[110px]"
            >
              <option value="all">Todos</option>
              <option value="with">🌐 Com site</option>
              <option value="without">⚠️ Sem site</option>
            </select>
          </div>

          {/* Filtro: Resposta */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Resposta</label>
            <select
              value={repliedFilter}
              onChange={e => setRepliedFilter(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[120px]"
            >
              <option value="all">Todos</option>
              <option value="replied">💬 Respondeu</option>
              <option value="no_reply">🔇 Sem resposta</option>
            </select>
          </div>

          {/* Filtro: Nicho */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nicho</label>
            <select
              value={nicheFilter}
              onChange={e => setNicheFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[140px] max-w-[200px]"
            >
              <option value="all">Todos os nichos</option>
              {uniqueNiches.map(n => (
                <option key={n} value={n}>{n} ({prospects.filter(p => p.niche === n).length})</option>
              ))}
            </select>
          </div>

          {/* Filtro: Cidade */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Cidade</label>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[140px] max-w-[200px]"
            >
              <option value="all">Todas as cidades</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c} ({prospects.filter(p => p.city === c).length})</option>
              ))}
            </select>
          </div>

          {/* Limpar filtros */}
          {(search || websiteFilter !== "all" || repliedFilter !== "all" || nicheFilter !== "all" || cityFilter !== "all") && (
            <button
              type="button"
              onClick={() => { setSearch(""); setWebsiteFilter("all"); setRepliedFilter("all"); setNicheFilter("all"); setCityFilter("all"); }}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Resumo dos filtros ativos */}
        {(search || websiteFilter !== "all" || repliedFilter !== "all" || nicheFilter !== "all" || cityFilter !== "all") && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-zinc-500 self-center">Filtros ativos:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Busca: "{search.length > 30 ? search.slice(0, 30) + "..." : search}"
                <button onClick={() => setSearch("")} className="ml-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {websiteFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                {websiteFilter === "with" ? "🌐 Com site" : "⚠️ Sem site"}
                <button onClick={() => setWebsiteFilter("all")} className="ml-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {repliedFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                {repliedFilter === "replied" ? "💬 Respondeu" : "🔇 Sem resposta"}
                <button onClick={() => setRepliedFilter("all")} className="ml-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {nicheFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Nicho: {nicheFilter}
                <button onClick={() => setNicheFilter("all")} className="ml-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {cityFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                Cidade: {cityFilter}
                <button onClick={() => setCityFilter("all")} className="ml-0.5 hover:text-white"><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            <span className="ml-auto text-[10px] text-zinc-500 self-center">
              {filteredProspects.length} de {prospects.length} leads
            </span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total leads" value={totalProspects} color="zinc" />
        <KpiCard label="Pendentes" value={totalPending} color="amber" />
        <KpiCard label="Contactados" value={totalContacted} color="blue" />
        <KpiCard label="Responderam" value={totalReplied} color="violet" />
        <KpiCard label="Fechados" value={totalClosed} color="emerald" />
        <KpiCard label="Reply rate" value={`${replyRate}%`} color="cyan" />
      </div>

      {/* Alert se há muitos pendentes */}
      {totalPending > 20 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-amber-200">
                {totalPending} leads pendentes de contato
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Priorize os mais recentes (no topo da coluna "Pendentes"). Use os roteiros da aba "Scripts WhatsApp" no CRM.
                O cron diário só vai buscar leads NOVOS — não vai reenviar pra esses.
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

      {/* Kanban board — flex horizontal com scroll horizontal (layout kanban de verdade) */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {grouped.map(stage => (
          <div key={stage.key} className="flex flex-col gap-2 w-[280px] shrink-0">
            {/* Column header */}
            <div className={`rounded-xl border p-3 ${stageColors[stage.color].border} ${stageColors[stage.color].bg} sticky top-0`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <stage.icon className={`h-4 w-4 shrink-0 ${stageColors[stage.color].text}`} />
                  <span className="text-sm font-bold text-white truncate">{stage.label}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${stageColors[stage.color].badge}`}>
                  {stage.count}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{stage.description}</p>
            </div>

            {/* Column items */}
            <div className="space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
              {loading ? (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-1" /> Carregando…
                </div>
              ) : stage.items.length === 0 ? (
                <div className="py-6 text-center text-zinc-600 text-xs">Vazio</div>
              ) : (
                stage.items.slice(0, 50).map(p => (
                  <ProspectCard key={p.id} prospect={p} />
                ))
              )}
              {stage.items.length > 50 && (
                <div className="text-center text-[10px] text-zinc-500 pt-1">
                  +{stage.items.length - 50} restantes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Help tip */}
      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">💡 Como usar</div>
        <ol className="text-xs text-zinc-300 space-y-1 list-decimal list-inside">
          <li>Olhe a coluna <strong>Pendentes</strong> — esses são os leads que ainda não recebeu mensagem</li>
          <li>Clique em qualquer lead → abre o CRM com a aba <strong>Scripts WhatsApp</strong></li>
          <li>Escolha um roteiro (Long Form / curto A/B/C / follow-up), clique <strong>Abrir no WhatsApp</strong></li>
          <li>Depois de enviar, clique em <strong>"Marcar como enviado"</strong> no card → lead vai pra coluna Contactados</li>
          <li>O cron diário NÃO vai reenviar pra leads já em "Contactados" — fluxo seguro sem duplicação</li>
        </ol>
      </div>
    </AdminShell>
  );
}

const stageColors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/[0.04]", text: "text-amber-300", badge: "bg-amber-500/15 text-amber-300" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/[0.04]", text: "text-blue-300", badge: "bg-blue-500/15 text-blue-300" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/[0.04]", text: "text-violet-300", badge: "bg-violet-500/15 text-violet-300" },
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/[0.04]", text: "text-cyan-300", badge: "bg-cyan-500/15 text-cyan-300" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/[0.04]", text: "text-emerald-300", badge: "bg-emerald-500/15 text-emerald-300" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/[0.04]", text: "text-rose-300", badge: "bg-rose-500/15 text-rose-300" },
  zinc: { border: "border-zinc-500/30", bg: "bg-zinc-500/[0.04]", text: "text-zinc-300", badge: "bg-zinc-500/15 text-zinc-300" },
};

function KpiCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const c = stageColors[color] || stageColors.zinc;
  return (
    <div className={`rounded-xl border p-3 ${c.border} ${c.bg}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${c.text}`}>{value}</div>
    </div>
  );
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(prospect.send_status === "sent");

  async function markAsSent() {
    setMarking(true);
    try {
      await fetch("/api/admin/prospects/mark-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospect.id,
          message_variant: "manual",
          message_text: "Marcado manualmente via fluxo de atendimento",
        }),
      });
      setMarked(true);
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setMarking(false);
    }
  }

  const waNum = prospect.whatsapp?.replace(/\D/g, "");
  const waLink = waNum ? `https://wa.me/${waNum}` : null;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition">
      <div className="flex items-start justify-between gap-2 mb-1">
        <a
          href={`/admin/leads-crm?prospect_id=${prospect.id}`}
          className="text-xs font-bold text-white hover:text-emerald-300 truncate flex-1 min-w-0"
          title="Abrir no CRM"
        >
          {prospect.name}
        </a>
        {prospect.has_website ? (
          <Globe className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
        ) : (
          <span className="text-[10px] text-zinc-500 shrink-0">🚫 site</span>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-zinc-500 mb-1.5">
        <span>{prospect.niche}</span>
        <span>·</span>
        <span>{prospect.city.split(",")[0]}</span>
        {prospect.rating && <><span>·</span><span>⭐ {prospect.rating}</span></>}
      </div>

      <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-2">
        {prospect.last_contact_at ? (
          <SpeedBadge lastContactAt={prospect.last_contact_at} />
        ) : (
          <span className="text-amber-300">Nunca contactado</span>
        )}
        {prospect.contacted_count > 0 && <span className="shrink-0">· #{prospect.contacted_count}</span>}
      </div>

      {/* Botões em coluna (vertical) pra não apertar em mobile */}
      <div className="flex flex-col gap-1.5">
        {waLink && !marked && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
          >
            <MessageCircle className="h-3 w-3" /> Abrir WhatsApp
          </a>
        )}
        {!marked && (
          <button
            onClick={markAsSent}
            disabled={marking}
            className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-blue-500/15 px-2 py-1.5 text-[10px] font-bold text-blue-300 hover:bg-blue-500/25 transition disabled:opacity-50"
          >
            {marking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
            {marking ? "Marcando…" : "Marcar como enviado"}
          </button>
        )}
        {marked && (
          <div className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1.5 text-[10px] font-bold text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> ✓ Enviado
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// SPEED BADGE — cronômetro de velocidade + alerta lead esfriando
// =====================================================
function SpeedBadge({ lastContactAt }: { lastContactAt: string }) {
  const diffMs = Date.now() - new Date(lastContactAt).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  let label: string;
  let color: string;
  let emoji: string;

  if (diffHours < 2) {
    // Fresco: < 2h
    label = `Há ${Math.round(diffHours * 60)}min`;
    color = "text-emerald-300";
    emoji = "⚡";
  } else if (diffHours < 24) {
    // Recente: < 24h
    label = `Há ${Math.floor(diffHours)}h`;
    color = "text-blue-300";
    emoji = "🕐";
  } else if (diffDays < 2) {
    // Esfriando: 24h - 48h
    label = `Há ${Math.floor(diffDays)}d`;
    color = "text-amber-300";
    emoji = "🌡️";
  } else if (diffDays < 7) {
    // Frio: 2-7 dias
    label = `Há ${Math.floor(diffDays)}d`;
    color = "text-orange-300";
    emoji = "⚠️";
  } else {
    // Gelado: > 7 dias
    label = `Há ${Math.floor(diffDays)}d`;
    color = "text-rose-300";
    emoji = "❄️";
  }

  return (
    <span className={`${color} font-semibold`}>
      {emoji} {label}
      {diffDays >= 2 && (
        <span className="ml-1 rounded bg-rose-500/15 px-1 py-0.5 text-[9px] text-rose-300 font-bold">
          ESFRIANDO
        </span>
      )}
    </span>
  );
}
