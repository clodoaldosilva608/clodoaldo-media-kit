"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Textarea, Select } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, formatDateTime, fetchAdminData } from "@/lib/admin/data";
import { Timer, Plus, RefreshCw, Pencil, Trash2, X, Save } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  headline: string;
  subtext: string;
  cta_label: string;
  cta_href: string;
  ends_at: string;
  starts_at: string | null;
  theme: string;
  position: string;
  active: boolean;
  created_at: string;
}

const EMPTY: Partial<Campaign> = {
  name: "",
  headline: "Oferta relâmpago!",
  subtext: "Última chance com 30% OFF",
  cta_label: "Aproveitar agora",
  cta_href: "/#pricing",
  ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  starts_at: null,
  theme: "fire",
  position: "top",
  active: true,
};

export default function AdminCountdownPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Campaign> | null>(null);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Campaign>("countdown", 100);
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { error } = await (editing.id ? adminUpdate("countdown", editing.id, editing)
      : adminInsert("countdown", editing));
    setSaving(false);
    if (error) return alert("Erro: " + error);
    setEditing(null);
    await load();
  }

  async function remove(c: Campaign) {
    if (!confirm(`Remover campanha "${c.name}"?`)) return;
    const { error } = await adminDelete("countdown", c.id);
    if (error) return alert("Erro: " + error);
    await load();
  }

  async function toggleActive(c: Campaign) {
    const { error } = await adminUpdate("countdown", c.id, { active: !c.active });
    if (error) return alert("Erro: " + error);
    await load();
  }

  function timeLeft(endsAt: string): { expired: boolean; h: number; m: number; s: number; d: number } {
    const diff = new Date(endsAt).getTime() - now;
    if (diff <= 0) return { expired: true, h: 0, m: 0, s: 0, d: 0 };
    return {
      expired: false,
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }

  return (
    <AdminShell title="Contagem Regressiva">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total" value={String(items.length)} />
        <StatBox label="Ativas" value={String(items.filter((c) => c.active).length)} accent="emerald" />
        <StatBox label="Expiradas" value={String(items.filter((c) => new Date(c.ends_at) < new Date()).length)} accent="rose" />
        <StatBox label="Futuras" value={String(items.filter((c) => c.starts_at && new Date(c.starts_at) > new Date()).length)} accent="blue" />
      </div>

      <Widget
        title="Campanhas de contagem regressiva"
        icon={<Timer className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY, ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })}>
              <Plus className="h-3.5 w-3.5" /> Nova campanha
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhuma campanha"
            description="Crie contagens regressivas para gerar urgência e aumentar conversão."
            icon={<Timer className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Criar campanha</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((c) => {
              const t = timeLeft(c.ends_at);
              return (
                <div key={c.id} className={`rounded-xl border p-4 ${c.active ? "border-amber-500/20 bg-amber-500/[0.03]" : "border-white/5 bg-white/[0.02]"}`}>
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-white">{c.name}</h4>
                      <p className="text-xs text-zinc-400">{c.headline}</p>
                    </div>
                    <Badge variant={t.expired ? "danger" : c.active ? "success" : "muted"}>
                      {t.expired ? "expirada" : c.active ? "ativa" : "inativa"}
                    </Badge>
                  </div>
                  <div className="mb-3 grid grid-cols-4 gap-1">
                    {[
                      { v: t.d, l: "dias" },
                      { v: t.h, l: "h" },
                      { v: t.m, l: "min" },
                      { v: t.s, l: "s" },
                    ].map((u, i) => (
                      <div key={i} className="rounded-lg bg-black/30 p-2 text-center">
                        <div className={`font-mono text-lg font-bold ${t.expired ? "text-zinc-600" : "text-amber-300"}`}>
                          {String(u.v).padStart(2, "0")}
                        </div>
                        <div className="text-[10px] uppercase text-zinc-500">{u.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-500">
                    <div>Término: {formatDateTime(c.ends_at)}</div>
                    <div>Tema: {c.theme} · Posição: {c.position}</div>
                    <div>CTA: {c.cta_label} → {c.cta_href}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <Toggle checked={c.active} onChange={() => toggleActive(c)} label="Ativa" />
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(c)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Widget>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0d0d14] p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar campanha" : "Nova campanha"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nome (interno)</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Black Friday 2026" />
              </div>
              <div className="sm:col-span-2">
                <Label>Headline</Label>
                <Input value={editing.headline || ""} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} placeholder="Oferta relâmpago!" />
              </div>
              <div className="sm:col-span-2">
                <Label>Subtítulo</Label>
                <Textarea value={editing.subtext || ""} onChange={(e) => setEditing({ ...editing, subtext: e.target.value })} rows={2} />
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
                <Label>Início (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={editing.starts_at ? new Date(editing.starts_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>
              <div>
                <Label>Término</Label>
                <Input
                  type="datetime-local"
                  value={editing.ends_at ? new Date(editing.ends_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                />
              </div>
              <div>
                <Label>Tema</Label>
                <Select value={editing.theme} onChange={(e) => setEditing({ ...editing, theme: e.target.value })}>
                  <option value="fire">Fire (vermelho/laranja)</option>
                  <option value="dark">Dark (preto)</option>
                  <option value="gold">Gold (dourado)</option>
                  <option value="minimal">Minimal (claro)</option>
                </Select>
              </div>
              <div>
                <Label>Posição</Label>
                <Select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })}>
                  <option value="top">Topo do site</option>
                  <option value="inline">Inline (no conteúdo)</option>
                  <option value="popup">Popup</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Campanha ativa" />
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
