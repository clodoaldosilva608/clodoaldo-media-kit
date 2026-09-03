"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Select } from "@/components/admin/ui";
import { adminDelete, formatDateTime, fetchAdminData, statusColor, timeAgo } from "@/lib/admin/data";
import { Users, Search, RefreshCw, Mail, Phone, Trash2 } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  preferred_channel: string;
  recommended_offer_slug: string | null;
  consent_contact: boolean;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Lead>("leads", 1000);
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchSearch && matchSource;
  });

  const sources = Array.from(new Set(leads.map((l) => l.source))).filter(Boolean);

  async function deleteLead(id: string) {
    if (!confirm("Tem certeza que deseja remover este lead?")) return;
    const { error } = adminDelete("leads", id);
    if (error) {
      alert("Erro: " + error.message);
      return;
    }
    await load();
  }

  return (
    <AdminShell title="Leads">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total de leads" value={String(leads.length)} />
        <StatBox label="Com consentimento" value={String(leads.filter((l) => l.consent_contact).length)} accent="emerald" />
        <StatBox label="Com telefone" value={String(leads.filter((l) => l.phone).length)} accent="blue" />
        <StatBox label="Fontes diferentes" value={String(sources.length)} accent="violet" />
      </div>

      <Widget
        title="Leads capturados"
        icon={<Users className="h-4 w-4 text-emerald-400" />}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
        }
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input placeholder="Buscar por nome ou email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="sm:w-44">
            <option value="all">Todas as fontes</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum lead encontrado" description="Leads capturados pelo quiz ou formulários aparecerão aqui." icon={<Users className="h-8 w-8" />} />
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">Contato</th>
                  <th className="px-3 py-2 font-medium">Oferta recomendada</th>
                  <th className="px-3 py-2 font-medium">Fonte</th>
                  <th className="px-3 py-2 font-medium">Canal</th>
                  <th className="px-3 py-2 font-medium">Criado em</th>
                  <th className="px-3 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-200">{l.name}</div>
                      {l.consent_contact && <Badge variant="success">Consentiu</Badge>}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 text-xs text-zinc-300">
                        <Mail className="h-3 w-3" /> {l.email}
                      </div>
                      {l.phone && (
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Phone className="h-3 w-3" /> {l.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-300">{l.recommended_offer_slug || "—"}</td>
                    <td className="px-3 py-2.5"><Badge variant="info">{l.source}</Badge></td>
                    <td className="px-3 py-2.5 text-zinc-400">{l.preferred_channel}</td>
                    <td className="px-3 py-2.5 text-[12px] text-zinc-400">
                      <div>{formatDateTime(l.created_at)}</div>
                      <div className="text-[10px] text-zinc-600">{timeAgo(l.created_at)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`mailto:${l.email}`}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300"
                          title="Enviar email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => deleteLead(l.id)}
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
    </AdminShell>
  );
}

function StatBox({ label, value, accent = "emerald" }: { label: string; value: string; accent?: "emerald" | "amber" | "rose" | "blue" | "violet" }) {
  const accents = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
    violet: "text-violet-300",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accents[accent]}`}>{value}</div>
    </div>
  );
}
