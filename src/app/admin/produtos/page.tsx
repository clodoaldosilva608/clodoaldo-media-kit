"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, Button, Input, Label, Textarea, EmptyState } from "@/components/admin/ui";
import {
  RefreshCw, Plus, Pencil, Trash2, X, Save, Download, Package, Check, DollarSign,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  price_label: string | null;
  category: string;
  icon: string;
  is_recurring: boolean;
  is_active: boolean;
  sort_order: number;
  whatsapp_sku: string | null;
  created_at: string;
}

const EMPTY: Partial<Product> = {
  name: "",
  description: "",
  price_cents: 0,
  price_label: "",
  category: "site",
  icon: "✅",
  is_recurring: false,
  is_active: true,
  sort_order: 100,
  whatsapp_sku: "",
};

const CATEGORY_LABELS: Record<string, string> = {
  site: "Site Profissional",
  seo: "SEO",
  gmb: "Google Meu Negócio",
  cardapio: "Cardápio Digital",
  social: "Redes Sociais",
  assinatura: "Assinatura",
  extras: "Extras",
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/admin/products");
      const json = await resp.json();
      setProducts(json.products || []);
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing || !editing.name) return;
    setSaving(true);
    try {
      const resp = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Falha");
      setEditing(null);
      await load();
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir este produto do catálogo?")) return;
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  }

  async function exportWhatsApp() {
    setExporting(true);
    try {
      const resp = await fetch("/api/admin/products/export-whatsapp");
      if (!resp.ok) throw new Error("Falha ao exportar");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `catalogo-whatsapp-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
    setExporting(false);
  }

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const totalMonthlyRecurring = products.filter(p => p.is_recurring && p.is_active).reduce((s, p) => s + (p.price_cents || 0), 0);

  return (
    <AdminShell title="Catálogo de Produtos">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Cadastre os produtos/serviços que oferece. Use no WhatsApp Business + nos roteiros de prospecção.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportWhatsApp} disabled={exporting}>
            {exporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Exportar p/ WhatsApp
          </Button>
          <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="h-3.5 w-3.5" /> Novo produto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Total</div>
          <div className="mt-1 text-lg font-bold text-white">{totalProducts}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Ativos</div>
          <div className="mt-1 text-lg font-bold text-emerald-300">{activeProducts}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Recorrência/mês</div>
          <div className="mt-1 text-lg font-bold text-blue-300">{formatBRL(totalMonthlyRecurring)}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Ticket médio</div>
          <div className="mt-1 text-lg font-bold text-violet-300">{formatBRL(170000)}</div>
        </div>
      </div>

      {/* Lista */}
      <Widget
        title={`Produtos (${products.length})`}
        icon={<Package className="h-4 w-4 text-violet-400" />}
        action={<Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>}
      >
        {loading ? (
          <div className="py-12 text-center text-zinc-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" /> Carregando…</div>
        ) : products.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre os produtos/serviços que oferece."
            icon={<Package className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Criar primeiro produto</Button>}
          />
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{p.icon || "✅"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <Badge variant="muted">{CATEGORY_LABELS[p.category] || p.category}</Badge>
                      {p.is_recurring && <Badge variant="info">recorrente</Badge>}
                      {!p.is_active && <Badge variant="warning">inativo</Badge>}
                    </div>
                    {p.description && <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{p.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-emerald-300 font-bold">{p.price_label || formatBRL(p.price_cents)}</span>
                      {p.whatsapp_sku && <code className="text-[10px] text-zinc-500 font-mono">SKU: {p.whatsapp_sku}</code>}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button onClick={() => setEditing(p)} className="text-zinc-400 hover:text-zinc-200 p-1.5"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(p.id)} className="text-rose-400 hover:text-rose-300 p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>

      {/* Export tip */}
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2">📱 Como importar catálogo no WhatsApp Business</div>
        <ol className="text-[11px] text-zinc-300 space-y-1 list-decimal list-inside">
          <li>Clique em <strong>"Exportar p/ WhatsApp"</strong> acima — vai baixar um CSV</li>
          <li>Abra o <strong>WhatsApp Business</strong> no celular</li>
          <li>Vá em <strong>Configurações → Ferramentas comerciais → Catálogo</strong></li>
          <li>Toque em <strong>"Importar catálogo"</strong> e selecione o arquivo CSV baixado</li>
          <li>Revise cada item (preço, foto) e publique</li>
        </ol>
      </div>

      {/* Editor Modal */}
      {editing && (
        <ProductEditor
          product={editing}
          onChange={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
          saving={saving}
        />
      )}
    </AdminShell>
  );
}

function ProductEditor({
  product, onChange, onSave, onClose, saving,
}: {
  product: Partial<Product>;
  onChange: (p: Partial<Product>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-sm font-bold text-white">
            {product.id ? "Editar produto" : "Novo produto"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[calc(90vh-130px)] overflow-y-auto p-5 space-y-3">
          <div>
            <Label>Nome do produto</Label>
            <Input value={product.name || ""} onChange={(e) => onChange({ ...product, name: e.target.value })} placeholder="Ex: Site Profissional" />
          </div>
          <div>
            <Label>Descrição (será usada no roteiro e no WhatsApp Business)</Label>
            <Textarea
              value={product.description || ""}
              onChange={(e) => onChange({ ...product, description: e.target.value })}
              rows={3}
              placeholder="O que está incluso, benefícios, prazos..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Preço (centavos)</Label>
              <Input
                type="number"
                value={product.price_cents || 0}
                onChange={(e) => onChange({ ...product, price_cents: Number(e.target.value) })}
              />
              <div className="text-[10px] text-zinc-500 mt-1">Ex: 170000 = R$ 1.700,00</div>
            </div>
            <div>
              <Label>Label de exibição (opcional)</Label>
              <Input
                value={product.price_label || ""}
                onChange={(e) => onChange({ ...product, price_label: e.target.value })}
                placeholder='Ex: "R$ 1.700,00 (em até 12x)"'
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Categoria</Label>
              <select
                value={product.category || "site"}
                onChange={(e) => onChange({ ...product, category: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Ícone</Label>
              <Input
                value={product.icon || "✅"}
                onChange={(e) => onChange({ ...product, icon: e.target.value })}
                maxLength={4}
              />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input
                type="number"
                value={product.sort_order || 100}
                onChange={(e) => onChange({ ...product, sort_order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>SKU WhatsApp (opcional)</Label>
            <Input
              value={product.whatsapp_sku || ""}
              onChange={(e) => onChange({ ...product, whatsapp_sku: e.target.value })}
              placeholder="Ex: site-profissional (sem espaços)"
            />
            <div className="text-[10px] text-zinc-500 mt-1">Usado como identificador único no catálogo do WhatsApp Business</div>
          </div>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!!product.is_recurring}
                onChange={(e) => onChange({ ...product, is_recurring: e.target.checked })}
                className="rounded"
              />
              Assinatura / recorrência mensal
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!!product.is_active}
                onChange={(e) => onChange({ ...product, is_active: e.target.checked })}
                className="rounded"
              />
              Ativo (visível no catálogo)
            </label>
          </div>
        </div>
        <div className="border-t border-white/5 px-5 py-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={saving || !product.name}>
            {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Salvando…</> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
