"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Select } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, formatDateTime, fetchAdminData } from "@/lib/admin/data";
import { Code2, Plus, RefreshCw, Pencil, Trash2, X, Save, Check } from "lucide-react";

interface Pixel {
  id: string;
  name: string;
  provider: "meta" | "google_ads" | "ga4" | "tiktok";
  pixel_id: string;
  api_token: string | null;
  active: boolean;
  send_events: string[];
  created_at: string;
  updated_at: string;
}

const EVENTS = ["PageView", "ViewContent", "InitiateCheckout", "Purchase", "Lead", "AddToCart", "CompleteRegistration"];

const EMPTY: Partial<Pixel> = {
  name: "",
  provider: "meta",
  pixel_id: "",
  api_token: "",
  active: true,
  send_events: ["PageView", "ViewContent", "InitiateCheckout", "Purchase", "Lead"],
};

const PROVIDER_LABELS: Record<string, { label: string; color: string; help: string }> = {
  meta: { label: "Meta (Facebook/Instagram)", color: "blue", help: "Meta Pixel ID + opcional Conversion API Token" },
  google_ads: { label: "Google Ads", color: "amber", help: "Conversion ID (AW-XXXXXXXXX)" },
  ga4: { label: "Google Analytics 4", color: "violet", help: "Measurement ID (G-XXXXXXXXXX)" },
  tiktok: { label: "TikTok Pixel", color: "rose", help: "Pixel ID (XXXXXXXXXXXXXXXX)" },
};

export default function AdminPixelsPage() {
  const [items, setItems] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Pixel> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Pixel>("pixels", 100);
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { error } = editing.id
      ? adminUpdate("pixels", editing.id, editing)
      : adminInsert("pixels", editing);
    setSaving(false);
    if (error) return alert("Erro: " + error.message);
    setEditing(null);
    await load();
  }

  async function remove(p: Pixel) {
    if (!confirm(`Remover pixel "${p.name}"?`)) return;
    const { error } = adminDelete("pixels", p.id);
    if (error) return alert("Erro: " + error.message);
    await load();
  }

  async function toggleActive(p: Pixel) {
    const { error } = adminUpdate("pixels", p.id, { active: !p.active });
    if (error) return alert("Erro: " + error.message);
    await load();
  }

  return (
    <AdminShell title="Pixels & Ads">
      <Widget
        title="Pixels de rastreamento"
        icon={<Code2 className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-3.5 w-3.5" /> Novo pixel
            </Button>
          </div>
        }
      >
        <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-3 text-xs text-blue-200">
          <strong>Como funciona:</strong> Os pixels ativos são injetados automaticamente em todas as páginas do site.
          Eventos como <code className="rounded bg-blue-500/10 px-1">PageView</code>, <code className="rounded bg-blue-500/10 px-1">InitiateCheckout</code> e <code className="rounded bg-blue-500/10 px-1">Purchase</code> são disparados nas ações correspondentes.
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum pixel configurado"
            description="Adicione pixels da Meta, Google Ads, GA4 ou TikTok para rastrear conversões."
            icon={<Code2 className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Configurar pixel</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((p) => {
              const meta = PROVIDER_LABELS[p.provider];
              return (
                <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <Badge variant={p.active ? "success" : "muted"}>{p.active ? "ativo" : "inativo"}</Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500">{meta?.label || p.provider}</p>
                    </div>
                    <Toggle checked={p.active} onChange={() => toggleActive(p)} />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Pixel ID:</span>
                      <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-emerald-300">{p.pixel_id}</code>
                    </div>
                    {p.api_token && (
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">API Token:</span>
                        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-zinc-400">••••{p.api_token.slice(-4)}</code>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(p.send_events || []).map((e) => (
                        <Badge key={e} variant="info">{e}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-white/5 pt-3">
                    <button onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar pixel" : "Novo pixel"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome (interno)</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Meta Pixel - Produção" />
              </div>
              <div>
                <Label>Provedor</Label>
                <Select
                  value={editing.provider}
                  onChange={(e) => setEditing({ ...editing, provider: e.target.value as Pixel["provider"] })}
                >
                  <option value="meta">Meta (Facebook/Instagram)</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="ga4">Google Analytics 4</option>
                  <option value="tiktok">TikTok Pixel</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Pixel ID</Label>
                <Input
                  value={editing.pixel_id || ""}
                  onChange={(e) => setEditing({ ...editing, pixel_id: e.target.value })}
                  placeholder={editing.provider === "meta" ? "123456789012345" : editing.provider === "google_ads" ? "AW-XXXXXXXXX" : editing.provider === "ga4" ? "G-XXXXXXXXXX" : "XXXXXXXXXXXXXXXX"}
                  className="font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>API Token (opcional — Conversion API)</Label>
                <Input
                  value={editing.api_token || ""}
                  onChange={(e) => setEditing({ ...editing, api_token: e.target.value })}
                  placeholder="Apenas para Meta / server-side"
                  className="font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Eventos para enviar</Label>
                <div className="flex flex-wrap gap-2">
                  {EVENTS.map((e) => {
                    const checked = (editing.send_events || []).includes(e);
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? (editing.send_events || []).filter((x) => x !== e)
                            : [...(editing.send_events || []), e];
                          setEditing({ ...editing, send_events: next });
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          checked
                            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        {checked && <Check className="mr-1 inline h-3 w-3" />}
                        {e}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Pixel ativo (rastreando)" />
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
