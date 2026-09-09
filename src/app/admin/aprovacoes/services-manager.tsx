"use client";

import { useEffect, useState } from "react";
import { Widget, Button, Input, Label, Select, Textarea, Badge, EmptyState } from "@/components/admin/ui";
import { Package, Loader2, Plus, Trash2, Save, Check, Edit2, X } from "lucide-react";
import { formatCurrency, type AdditionalService } from "@/lib/approvals";

const CATEGORIES = [
  ["revision_extra", "Revisão extra"],
  ["page", "Página adicional"],
  ["menu", "Cardápio digital"],
  ["art_pack", "Pack de artes"],
  ["audit", "Auditoria"],
  ["integration", "Integração"],
  ["custom", "Personalizado"],
  ["other", "Outro"],
];

export function ServicesManager() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/approvals/services", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setServices(json.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <Widget
      title="Catálogo de serviços adicionais"
      icon={<Package className="h-4 w-4 text-emerald-400" />}
      action={
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditingId(null); }}>
          <Plus className="h-3 w-3" /> Novo serviço
        </Button>
      }
    >
      <p className="mb-4 text-xs text-zinc-400">
        Crie serviços com preços fixos para oferecer como upsell dentro do portal do cliente.
        Você pode vincular um checkout Kiwify em cada serviço (se vazio, cliente paga via PIX).
      </p>

      {loading ? (
        <div className="py-12 text-center text-zinc-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : services.length === 0 && !showForm ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="Nenhum serviço cadastrado" description="Crie o primeiro serviço adicional." />
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              {editingId === s.id ? (
                <ServiceForm
                  initial={s}
                  onClose={() => setEditingId(null)}
                  onSaved={() => { setEditingId(null); load(); }}
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      <Badge variant="muted">{CATEGORIES.find(([k]) => k === s.category)?.[1] || s.category}</Badge>
                      {!s.is_active && <Badge variant="warning">Inativo</Badge>}
                      {!s.visible_to_client && <Badge variant="muted">Oculto</Badge>}
                    </div>
                    {s.description && <p className="mt-1 text-xs text-zinc-400">{s.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                      <span className="text-emerald-300 font-bold">{formatCurrency(s.price_cents)}</span>
                      {s.kiwify_checkout_url && <span>🔗 Kiwify configurado</span>}
                      <span>Ordem: {s.sort_order}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingId(s.id); setShowForm(false); }} className="rounded bg-white/5 p-2 text-zinc-300 hover:bg-white/10">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Excluir "${s.name}"?`)) return;
                        await fetch(`/api/admin/approvals/services/${s.id}`, { method: "DELETE" });
                        load();
                      }}
                      className="rounded bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showForm && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
              <ServiceForm
                onClose={() => setShowForm(false)}
                onSaved={() => { setShowForm(false); load(); }}
              />
            </div>
          )}
        </div>
      )}
    </Widget>
  );
}

function ServiceForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: AdditionalService;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    category: initial?.category || "custom",
    price_cents: initial?.price_cents || 0,
    price_label: initial?.price_label || "",
    kiwify_checkout_url: initial?.kiwify_checkout_url || "",
    visible_to_client: initial?.visible_to_client ?? true,
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const method = initial ? "PATCH" : "POST";
    const url = initial
      ? `/api/admin/approvals/services/${initial.id}`
      : "/api/admin/approvals/services";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Nome *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>Slug (gerado automaticamente se vazio)</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="revisao-extra" />
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AdditionalService["category"] })}>
            {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
        <div>
          <Label>Preço (em reais, ex: 97.00)</Label>
          <Input type="number" step="0.01" value={(form.price_cents / 100).toFixed(2)} onChange={(e) => setForm({ ...form, price_cents: Math.round(Number(e.target.value) * 100) })} />
        </div>
        <div>
          <Label>Label do preço (ex: "R$ 97")</Label>
          <Input value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} placeholder="R$ 97" />
        </div>
        <div>
          <Label>Ordem de exibição</Label>
          <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </div>
        <div className="sm:col-span-2">
          <Label>URL de checkout Kiwify (opcional)</Label>
          <Input value={form.kiwify_checkout_url} onChange={(e) => setForm({ ...form, kiwify_checkout_url: e.target.value })} placeholder="https://kiwify.app/..." />
        </div>
        <div className="sm:col-span-2">
          <Label>Descrição</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.visible_to_client} onChange={(e) => setForm({ ...form, visible_to_client: e.target.checked })} />
            Visível para o cliente no portal
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Ativo
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={save} disabled={saving || !form.name}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          <span className="ml-1">{initial ? "Salvar" : "Criar"}</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-3 w-3" /><span className="ml-1">Cancelar</span>
        </Button>
      </div>
    </div>
  );
}
