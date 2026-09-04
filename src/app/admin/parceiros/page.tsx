"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import { brl, formatDateTime, timeAgo, statusColor } from "@/lib/admin/data";
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Star,
  Plus,
  Save,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Download,
  RefreshCw,
  Building2,
  Users,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  ExternalLink,
  Filter,
} from "lucide-react";

interface Prospect {
  id?: string;
  place_id?: string;
  name: string;
  category?: string;
  formatted_address?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string | null;
  website?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  lat?: number;
  lng?: number;
  rating?: number | null;
  user_ratings_total?: number;
  status: string;
  priority: string;
  source?: string;
  niche?: string;
  search_location?: string;
  notes?: string | null;
  assigned_to?: string | null;
  last_contact_at?: string | null;
  next_follow_up?: string | null;
  contacted_count?: number;
  created_at?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: any }> = {
  new: { label: "Novo", color: "info" },
  contacted: { label: "Contatado", color: "warning" },
  qualified: { label: "Qualificado", color: "info" },
  won: { label: "Ganho", color: "success" },
  lost: { label: "Perdido", color: "danger" },
  archived: { label: "Arquivado", color: "muted" },
};

const PRIORITY_LABELS: Record<string, { label: string; color: any }> = {
  low: { label: "Baixa", color: "muted" },
  medium: { label: "Média", color: "info" },
  high: { label: "Alta", color: "warning" },
};

const NICHES = [
  "restaurante",
  "barbearia",
  "academia",
  "salão de beleza",
  "clínica estética",
  "escritório de advocacia",
  "consultório odontológico",
  "loja de roupas",
  "papelaria",
  "farmácia",
  "pet shop",
  "estética automotiva",
  "pizzaria",
  "hamburgueria",
  "cafeteria",
  "loja de conveniência",
  "imobiliária",
  "contabilidade",
  "agência de marketing",
  "estúdio de pilates",
];

export default function AdminParceirosPage() {
  const [tab, setTab] = useState<"search" | "saved">("search");

  // Search state
  const [niche, setNiche] = useState("restaurante");
  const [location, setLocation] = useState("Recife, PE");
  const [radius, setRadius] = useState(5000);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Prospect[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMeta, setSearchMeta] = useState<any>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Saved prospects state
  const [savedProspects, setSavedProspects] = useState<Prospect[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const resp = await fetch(
        `/api/admin/prospects?status=${filterStatus}&priority=${filterPriority}&search=${encodeURIComponent(searchTerm)}`,
        { cache: "no-store" }
      );
      const json = await resp.json();
      setSavedProspects(json.data || []);
    } catch {
      setSavedProspects([]);
    }
    setLoadingSaved(false);
  }, [filterStatus, filterPriority, searchTerm]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  async function handleSearch() {
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSearchMeta(null);
    try {
      const resp = await fetch("/api/admin/prospect/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, location, radius, limit: 20 }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setSearchError(json.error || "Erro na busca");
        if (json.instructions) {
          setSearchError(`${json.error}\n\n${json.instructions}`);
        }
        return;
      }
      setSearchResults(json.results || []);
      setSearchMeta(json.search_meta);
    } catch (e: any) {
      setSearchError(e.message || "Erro na busca");
    } finally {
      setSearching(false);
    }
  }

  async function saveProspect(prospect: Prospect) {
    if (!prospect.place_id) return;
    setSavingIds((s) => new Set(s).add(prospect.place_id!));
    try {
      const resp = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prospect,
          status: "new",
          priority: "medium",
        }),
      });
      const json = await resp.json();
      if (json.already_exists) {
        setSavedIds((s) => new Set(s).add(prospect.place_id!));
      } else if (json.saved) {
        setSavedIds((s) => new Set(s).add(prospect.place_id!));
      }
    } catch {}
    setSavingIds((s) => {
      const next = new Set(s);
      next.delete(prospect.place_id!);
      return next;
    });
    // Refresh saved list
    loadSaved();
  }

  async function updateProspect(id: string, updates: Partial<Prospect>) {
    try {
      await fetch("/api/admin/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      loadSaved();
    } catch {}
  }

  async function deleteProspect(id: string) {
    if (!confirm("Remover este prospect?")) return;
    try {
      await fetch("/api/admin/prospects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadSaved();
    } catch {}
  }

  function exportCSV() {
    const rows = [
      ["Nome", "Categoria", "Endereço", "Cidade", "Telefone", "Website", "Rating", "Status", "Prioridade", "Notas"],
      ...savedProspects.map((p) => [
        p.name,
        p.category || "",
        p.formatted_address || "",
        p.city || "",
        p.phone || "",
        p.website || "",
        p.rating || "",
        p.status,
        p.priority,
        p.notes || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospects-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const totalProspects = savedProspects.length;
  const newCount = savedProspects.filter((p) => p.status === "new").length;
  const contactedCount = savedProspects.filter((p) => p.status === "contacted").length;
  const wonCount = savedProspects.filter((p) => p.status === "won").length;

  return (
    <AdminShell title="Parceiros — Prospecção via Google Maps">
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total prospectado" value={String(totalProspects)} icon={Users} accent="emerald" />
        <KpiCard label="Novos" value={String(newCount)} icon={Target} accent="blue" />
        <KpiCard label="Contatados" value={String(contactedCount)} icon={MessageCircle} accent="amber" />
        <KpiCard label="Ganhos" value={String(wonCount)} icon={CheckCircle2} accent="violet" />
      </div>

      {/* Tabs */}
      <div className="mb-4 inline-flex items-center gap-0.5 rounded-full border border-white/5 bg-white/[0.03] p-0.5">
        <button
          onClick={() => setTab("search")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "search" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search className="h-4 w-4" /> Buscar no Maps
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "saved" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Building2 className="h-4 w-4" /> Salvos ({savedProspects.length})
        </button>
      </div>

      {/* Tab: Search */}
      {tab === "search" && (
        <Widget
          title="Prospecção de clientes via Google Maps"
          icon={<MapPin className="h-4 w-4 text-emerald-400" />}
        >
          {/* Search form */}
          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <div>
              <Label>Nicho / Tipo de estabelecimento</Label>
              <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                {NICHES.map((n) => (
                  <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                ))}
                <option value="outro">Outro (digite abaixo)</option>
              </Select>
              {niche === "outro" && (
                <Input
                  className="mt-2"
                  placeholder="Digite o nicho personalizado"
                  onChange={(e) => setNiche(e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Cidade / Localização</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Recife, PE"
              />
            </div>
            <div>
              <Label>Raio (km)</Label>
              <Select value={String(radius)} onChange={(e) => setRadius(Number(e.target.value))}>
                <option value="2000">2 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
                <option value="20000">20 km</option>
                <option value="50000">50 km</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={searching}
                className="w-full"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {searching ? "Buscando…" : "Buscar"}
              </Button>
            </div>
          </div>

          {/* Error */}
          {searchError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="whitespace-pre-wrap">{searchError}</div>
            </div>
          )}

          {/* Search meta */}
          {searchMeta && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-xs text-emerald-200">
              <strong>{searchMeta.total} estabelecimentos</strong> encontrados para &quot;{searchMeta.niche}&quot; em {searchMeta.formatted_address} (raio de {searchMeta.radius / 1000}km)
            </div>
          )}

          {/* Results */}
          {searching && (
            <div className="py-12 text-center text-sm text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Buscando estabelecimentos no Google Maps…
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {searchResults.map((p) => (
                <div
                  key={p.place_id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-emerald-500/20 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-white">{p.name}</h4>
                      <p className="text-[11px] text-zinc-500 capitalize">{p.category?.replace(/_/g, " ")}</p>
                    </div>
                    {p.rating && (
                      <div className="flex items-center gap-1 shrink-0 text-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-amber-300">{p.rating}</span>
                        <span className="text-zinc-500">({p.user_ratings_total || 0})</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-zinc-400 mb-3">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-zinc-500" />
                      <span className="truncate">{p.formatted_address}</span>
                    </div>
                    {p.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0 text-zinc-500" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 shrink-0 text-zinc-500" />
                        <a href={p.website} target="_blank" rel="noreferrer" className="truncate text-emerald-400 hover:text-emerald-300">
                          {p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={savedIds.has(p.place_id!) ? "ghost" : "primary"}
                      onClick={() => saveProspect(p)}
                      disabled={savingIds.has(p.place_id!) || savedIds.has(p.place_id!)}
                      className="flex-1"
                    >
                      {savedIds.has(p.place_id!) ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Salvo</>
                      ) : savingIds.has(p.place_id!) ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando…</>
                      ) : (
                        <><Plus className="h-3.5 w-3.5" /> Salvar prospect</>
                      )}
                    </Button>
                    {p.whatsapp && (
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-500/15 p-2 text-emerald-300 hover:bg-emerald-500/25"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && searchResults.length === 0 && !searchError && !searchMeta && (
            <EmptyState
              title="Busque estabelecimentos no Google Maps"
              description="Selecione um nicho, digite a cidade e clique em Buscar. Os resultados aparecerão aqui com telefone, website e rating."
              icon={<MapPin className="h-8 w-8" />}
            />
          )}
        </Widget>
      )}

      {/* Tab: Saved */}
      {tab === "saved" && (
        <Widget
          title="Prospects salvos"
          icon={<Building2 className="h-4 w-4 text-emerald-400" />}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={loadSaved}>
                <RefreshCw className="h-3.5 w-3.5" /> Atualizar
              </Button>
            </div>
          }
        >
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Buscar por nome, telefone, cidade…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:flex-1"
            />
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="sm:w-44">
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="sm:w-40">
              <option value="all">Todas as prioridades</option>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </div>

          {loadingSaved ? (
            <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
          ) : savedProspects.length === 0 ? (
            <EmptyState
              title="Nenhum prospect salvo"
              description="Use a aba 'Buscar no Maps' para encontrar estabelecimentos e salvá-los aqui."
              icon={<Building2 className="h-8 w-8" />}
              action={<Button variant="primary" onClick={() => setTab("search")}><Search className="h-3.5 w-3.5" /> Ir para busca</Button>}
            />
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Estabelecimento</th>
                    <th className="px-3 py-2 font-medium">Contato</th>
                    <th className="px-3 py-2 font-medium">Rating</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Prioridade</th>
                    <th className="px-3 py-2 font-medium">Último contato</th>
                    <th className="px-3 py-2 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {savedProspects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-zinc-200">{p.name}</div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">{p.formatted_address}</div>
                        <div className="text-[10px] text-zinc-600 capitalize">{p.niche} · {p.city}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        {p.phone && (
                          <div className="flex items-center gap-1 text-xs text-zinc-300">
                            <Phone className="h-3 w-3" /> {p.phone}
                          </div>
                        )}
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 truncate max-w-[150px]">
                            <Globe className="h-3 w-3" /> site
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {p.rating && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-amber-300">{p.rating}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Select
                          value={p.status}
                          onChange={(e) => updateProspect(p.id!, { status: e.target.value })}
                          className="text-xs py-1"
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-3 py-2.5">
                        <Select
                          value={p.priority}
                          onChange={(e) => updateProspect(p.id!, { priority: e.target.value })}
                          className="text-xs py-1"
                        >
                          {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-zinc-500">
                        {p.last_contact_at ? timeAgo(p.last_contact_at) : "—"}
                        {p.contacted_count ? <div className="text-[10px]">{p.contacted_count}x contato</div> : null}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {p.phone && (
                            <a
                              href={`https://wa.me/${(p.whatsapp || p.phone).replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setEditing(p)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300"
                            title="Editar / Notas"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProspect(p.id!)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300"
                            title="Remover"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Widget>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{editing.name}</h3>
                <p className="text-xs text-zinc-500">{editing.formatted_address}</p>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={editing.phone || ""}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editing.email || ""}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={editing.website || ""}
                  onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={editing.city || ""}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={editing.priority}
                  onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                >
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Próximo follow-up</Label>
                <Input
                  type="datetime-local"
                  value={editing.next_follow_up ? new Date(editing.next_follow_up).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, next_follow_up: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>
              <div>
                <Label>Responsável</Label>
                <Input
                  value={editing.assigned_to || ""}
                  onChange={(e) => setEditing({ ...editing, assigned_to: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Notas</Label>
                <Textarea
                  value={editing.notes || ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  rows={4}
                  placeholder="Anotações sobre o contato, propostas enviadas, etc."
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button
                variant="primary"
                onClick={async () => {
                  setSaving(true);
                  await updateProspect(editing.id!, editing);
                  setSaving(false);
                  setEditing(null);
                }}
                disabled={saving}
              >
                <Save className="h-3.5 w-3.5" /> {saving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "emerald" | "blue" | "amber" | "rose" | "violet";
}) {
  const accents = {
    emerald: "text-emerald-300 bg-emerald-500/10 ring-emerald-500/20",
    blue: "text-blue-300 bg-blue-500/10 ring-blue-500/20",
    amber: "text-amber-300 bg-amber-500/10 ring-amber-500/20",
    rose: "text-rose-300 bg-rose-500/10 ring-rose-500/20",
    violet: "text-violet-300 bg-violet-500/10 ring-violet-500/20",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-1 truncate text-xl font-bold text-white lg:text-2xl">{value}</div>
        </div>
        {Icon && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
