"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Select, Textarea, Label, Toggle } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, formatDateTime, fetchAdminData, statusColor } from "@/lib/admin/data";
import { Tags, Plus, RefreshCw, Pencil, Trash2, X, Save } from "lucide-react";

interface Offer {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_label: string;
  description: string;
  cta_label: string;
  cta_href: string;
  audience: string;
  deliverables: string[];
  entry_level: number;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const EMPTY: Partial<Offer> = {
  slug: "",
  name: "",
  category: "geral",
  price_label: "Sob consulta",
  description: "",
  cta_label: "Saber mais",
  cta_href: "/#contato",
  audience: "",
  deliverables: [],
  entry_level: 3,
  order_index: 100,
  active: true,
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Offer> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Offer>("offers", 500);
    setOffers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const payload = {
      ...editing,
      deliverables: Array.isArray(editing.deliverables)
        ? editing.deliverables
        : String(editing.deliverables || "")
            .split("\n")
            .map((s: string) => s.trim())
            .filter(Boolean),
    };
    const { error } = editing.id
      ? adminUpdate("offers", editing.id, payload)
      : adminInsert("offers", payload);
    setSaving(false);
    if (error) {
      alert("Erro ao salvar: " + error.message);
      return;
    }
    setEditing(null);
    await load();
  }

  async function remove(o: Offer) {
    if (!confirm(`Remover a oferta "${o.name}"?`)) return;
    const { error } = adminDelete("offers", o.id);
    if (error) {
      alert("Erro: " + error.message);
      return;
    }
    await load();
  }

  async function toggleActive(o: Offer) {
    const { error } = adminUpdate("offers", o.id, { active: !o.active });
    if (error) {
      alert("Erro: " + error.message);
      return;
    }
    await load();
  }

  return (
    <AdminShell title="Ofertas">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total" value={String(offers.length)} />
        <StatBox label="Ativas" value={String(offers.filter((o) => o.active).length)} accent="emerald" />
        <StatBox label="Inativas" value={String(offers.filter((o) => !o.active).length)} accent="rose" />
        <StatBox label="Categorias" value={String(new Set(offers.map((o) => o.category)).size)} accent="blue" />
      </div>

      <Widget
        title="Catálogo de ofertas"
        icon={<Tags className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-3.5 w-3.5" /> Nova oferta
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : offers.length === 0 ? (
          <EmptyState
            title="Nenhuma oferta"
            description="Crie sua primeira oferta para começar a vender."
            icon={<Tags className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Criar oferta</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <div key={o.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate text-sm font-bold text-white">{o.name}</h4>
                      <Badge variant={o.active ? "success" : "muted"}>{o.active ? "ativo" : "inativo"}</Badge>
                    </div>
                    <div className="text-[11px] text-zinc-500">{o.slug} · {o.category}</div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-300">{o.price_label}</span>
                </div>
                <p className="line-clamp-2 text-xs text-zinc-400">{o.description}</p>
                {o.deliverables && o.deliverables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.deliverables.slice(0, 3).map((d, i) => (
                      <Badge key={i} variant="muted">{d}</Badge>
                    ))}
                    {o.deliverables.length > 3 && <Badge variant="muted">+{o.deliverables.length - 3}</Badge>}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                  <Toggle checked={o.active} onChange={() => toggleActive(o)} label="Ativo" />
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(o)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(o)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar oferta" : "Nova oferta"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="ex: video-dedicado" />
              </div>
              <div>
                <Label>Nome</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Vídeo Dedicado" />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="influencia" />
              </div>
              <div>
                <Label>Preço (label)</Label>
                <Input value={editing.price_label || ""} onChange={(e) => setEditing({ ...editing, price_label: e.target.value })} placeholder="A partir de R$ 1.200" />
              </div>
              <div>
                <Label>CTA (label)</Label>
                <Input value={editing.cta_label || ""} onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })} />
              </div>
              <div>
                <Label>CTA (href)</Label>
                <Input value={editing.cta_href || ""} onChange={(e) => setEditing({ ...editing, cta_href: e.target.value })} />
              </div>
              <div>
                <Label>Nível de entrada</Label>
                <Input type="number" min={1} max={5} value={editing.entry_level ?? 3} onChange={(e) => setEditing({ ...editing, entry_level: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={editing.order_index ?? 100} onChange={(e) => setEditing({ ...editing, order_index: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              </div>
              <div className="sm:col-span-2">
                <Label>Público-alvo</Label>
                <Input value={editing.audience || ""} onChange={(e) => setEditing({ ...editing, audience: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Deliverables (um por linha)</Label>
                <Textarea
                  value={Array.isArray(editing.deliverables) ? editing.deliverables.join("\n") : String(editing.deliverables || "")}
                  onChange={(e) => setEditing({ ...editing, deliverables: e.target.value.split("\n") })}
                  rows={4}
                  placeholder="Roteiro&#10;Gravação&#10;Edição"
                />
              </div>
              <div className="sm:col-span-2">
                <Toggle
                  checked={editing.active ?? true}
                  onChange={(v) => setEditing({ ...editing, active: v })}
                  label="Ativo (visível no site)"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                <Save className="h-3.5 w-3.5" /> {saving ? "Salvando…" : "Salvar"}
              </Button>
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
