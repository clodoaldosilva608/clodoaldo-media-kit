"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Select, Textarea } from "@/components/admin/ui";
import { fetchAdminData, timeAgo, formatDateTime, statusColor } from "@/lib/admin/data";
import { FileText, Search, RefreshCw, Eye, Mail, Phone } from "lucide-react";

interface Briefing {
  id: string;
  offer_slug: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  goal: string;
  budget_range: string | null;
  deadline: string | null;
  notes: string | null;
  status: string;
  current_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminBriefingsPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Briefing | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Briefing>("briefings", 1000);
    setBriefings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = briefings.filter((b) => {
    const matchSearch =
      !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.offer_slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function updateStatus(b: Briefing, status: string) {
    const { error } = await adminUpdate("briefings", b.id, { status, updated_at: new Date().toISOString() });
    if (error) {
      alert("Erro: " + error.message);
      return;
    }
    await load();
    if (selected?.id === b.id) setSelected({ ...b, status });
  }

  return (
    <AdminShell title="Briefings">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total" value={String(briefings.length)} />
        <StatBox label="Novos" value={String(briefings.filter((b) => b.status === "new").length)} accent="blue" />
        <StatBox label="Em atendimento" value={String(briefings.filter((b) => b.status === "in_progress" || b.status === "contacted").length)} accent="amber" />
        <StatBox label="Fechados" value={String(briefings.filter((b) => b.status === "closed" || b.status === "won").length)} accent="emerald" />
      </div>

      <Widget
        title="Briefings recebidos"
        icon={<FileText className="h-4 w-4 text-emerald-400" />}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
        }
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input placeholder="Buscar por nome, email, oferta…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
            <option value="all">Todos os status</option>
            <option value="new">Novo</option>
            <option value="contacted">Contatado</option>
            <option value="in_progress">Em atendimento</option>
            <option value="won">Fechado</option>
            <option value="lost">Perdido</option>
            <option value="closed">Encerrado</option>
          </Select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum briefing" description="Briefings enviados pelo formulário aparecerão aqui." icon={<FileText className="h-8 w-8" />} />
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Cliente</th>
                  <th className="px-3 py-2 font-medium">Oferta</th>
                  <th className="px-3 py-2 font-medium">Orçamento</th>
                  <th className="px-3 py-2 font-medium">Prazo</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Recebido</th>
                  <th className="px-3 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-200">{b.name}</div>
                      <div className="text-[11px] text-zinc-500">{b.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-zinc-300">{b.offer_slug}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{b.budget_range || "—"}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{b.deadline || "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusColor(b.status)}>{b.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-zinc-400">
                      <div>{formatDateTime(b.created_at)}</div>
                      <div className="text-[10px] text-zinc-600">{timeAgo(b.created_at)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(b)}>
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <p className="text-xs text-zinc-500">Briefing · {selected.offer_slug}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">✕</button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Email" value={selected.email} />
              <Detail label="Telefone" value={selected.phone || "—"} />
              <Detail label="Empresa" value={selected.company || "—"} />
              <Detail label="Orçamento" value={selected.budget_range || "—"} />
              <Detail label="Prazo" value={selected.deadline || "—"} />
              <Detail label="URL de origem" value={selected.current_url || "—"} />
            </div>

            {selected.goal && (
              <div className="mt-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Objetivo</div>
                <Textarea readOnly value={selected.goal} className="min-h-[80px]" />
              </div>
            )}

            {selected.notes && (
              <div className="mt-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Notas</div>
                <Textarea readOnly value={selected.notes} className="min-h-[60px]" />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
              <a
                href={`mailto:${selected.email}?subject=Re: Briefing - ${selected.offer_slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
              >
                <Mail className="h-3.5 w-3.5" /> Responder por email
              </a>
              {selected.phone && (
                <a
                  href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25"
                >
                  <Phone className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
              <div className="ml-auto flex flex-wrap gap-1.5">
                {["new", "contacted", "in_progress", "won", "lost", "closed"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selected.status === s ? "primary" : "outline"}
                    onClick={() => updateStatus(selected, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function StatBox({ label, value, accent = "emerald" }: { label: string; value: string; accent?: "emerald" | "amber" | "rose" | "blue" }) {
  const accents = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
  };
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accents[accent]}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-0.5 text-sm text-zinc-200 break-words">{value}</div>
    </div>
  );
}
