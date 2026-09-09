"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Textarea, Select } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, fetchAdminData } from "@/lib/admin/data";
import { MessageSquareQuote, Plus, RefreshCw, Pencil, Trash2, X, Save, Star } from "lucide-react";

interface Testimonial {
  id: string;
  author_name: string;
  author_handle: string | null;
  author_avatar: string | null;
  role: string;
  content: string;
  rating: number;
  source: string;
  source_url: string | null;
  product_slug: string | null;
  position: number;
  featured: boolean;
  active: boolean;
  created_at: string;
}

const EMPTY: Partial<Testimonial> = {
  author_name: "",
  author_handle: "",
  author_avatar: "",
  role: "",
  content: "",
  rating: 5,
  source: "manual",
  source_url: "",
  product_slug: "",
  position: 0,
  featured: false,
  active: true,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Testimonial>("testimonials", 500);
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { error } = await (editing.id ? adminUpdate("testimonials", editing.id, editing)
      : adminInsert("testimonials", editing));
    setSaving(false);
    if (error) {
      alert("Erro: " + error);
      return;
    }
    setEditing(null);
    await load();
  }

  async function remove(t: Testimonial) {
    if (!confirm(`Remover depoimento de ${t.author_name}?`)) return;
    const { error } = await adminDelete("testimonials", t.id);
    if (error) return alert("Erro: " + error);
    await load();
  }

  async function toggleActive(t: Testimonial) {
    const { error } = await adminUpdate("testimonials", t.id, { active: !t.active });
    if (error) return alert("Erro: " + error);
    await load();
  }

  async function toggleFeatured(t: Testimonial) {
    const { error } = await adminUpdate("testimonials", t.id, { featured: !t.featured });
    if (error) return alert("Erro: " + error);
    await load();
  }

  return (
    <AdminShell title="Depoimentos">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total" value={String(items.length)} />
        <StatBox label="Ativos" value={String(items.filter((t) => t.active).length)} accent="emerald" />
        <StatBox label="Em destaque" value={String(items.filter((t) => t.featured).length)} accent="amber" />
        <StatBox label="5 estrelas" value={String(items.filter((t) => t.rating === 5).length)} accent="violet" />
      </div>

      <Widget
        title="Provas sociais"
        icon={<MessageSquareQuote className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-3.5 w-3.5" /> Novo depoimento
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum depoimento"
            description="Adicione depoimentos de clientes para aumentar a conversão."
            icon={<MessageSquareQuote className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Adicionar</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div key={t.id} className="flex flex-col rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {t.featured && <Badge variant="warning">destaque</Badge>}
                    <Badge variant={t.active ? "success" : "muted"}>{t.active ? "ativo" : "inativo"}</Badge>
                  </div>
                </div>
                <p className="mb-3 flex-1 text-xs italic text-zinc-300">"{t.content}"</p>
                <div className="flex items-center gap-2 border-t border-white/5 pt-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300">
                    {t.author_name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-zinc-200">{t.author_name}</div>
                    <div className="truncate text-[10px] text-zinc-500">{t.author_handle || t.role}</div>
                  </div>
                  <button onClick={() => setEditing(t)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(t)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar depoimento" : "Novo depoimento"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome do autor</Label>
                <Input value={editing.author_name || ""} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })} placeholder="Maria Silva" />
              </div>
              <div>
                <Label>Handle / @</Label>
                <Input value={editing.author_handle || ""} onChange={(e) => setEditing({ ...editing, author_handle: e.target.value })} placeholder="@maria" />
              </div>
              <div>
                <Label>Cargo / papel</Label>
                <Input value={editing.role || ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Empreendedora" />
              </div>
              <div>
                <Label>Avaliação</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setEditing({ ...editing, rating: n })}
                      className="p-1"
                    >
                      <Star className={`h-6 w-6 ${n <= (editing.rating ?? 5) ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>URL do avatar</Label>
                <Input value={editing.author_avatar || ""} onChange={(e) => setEditing({ ...editing, author_avatar: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>Produto (slug)</Label>
                <Input value={editing.product_slug || ""} onChange={(e) => setEditing({ ...editing, product_slug: e.target.value })} placeholder="auditoria-de-perfil" />
              </div>
              <div>
                <Label>Fonte</Label>
                <Select value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })}>
                  <option value="manual">Manual</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                </Select>
              </div>
              <div>
                <Label>URL da fonte</Label>
                <Input value={editing.source_url || ""} onChange={(e) => setEditing({ ...editing, source_url: e.target.value })} placeholder="https://instagram.com/…" />
              </div>
              <div>
                <Label>Posição</Label>
                <Input type="number" value={editing.position ?? 0} onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Depoimento</Label>
                <Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={4} placeholder="Trabalhar com o Clodoaldo foi incrível…" />
              </div>
              <div className="flex items-center gap-6 sm:col-span-2">
                <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Ativo" />
                <Toggle checked={editing.featured ?? false} onChange={(v) => setEditing({ ...editing, featured: v })} label="Destaque" />
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
