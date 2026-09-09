"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Select, Label, Toggle, Textarea } from "@/components/admin/ui";
import { adminDelete, adminInsert, adminUpdate, brl, formatDateTime, fetchAdminData, statusColor } from "@/lib/admin/data";
import { Ticket, Plus, RefreshCw, Pencil, Trash2, X, Save, Copy, Check } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string;
  kind: "percent" | "fixed";
  value: number;
  min_order_cents: number;
  max_uses: number;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  applies_to: string;
  target_slug: string | null;
  created_at: string;
}

const EMPTY: Partial<Coupon> = {
  code: "",
  description: "",
  kind: "percent",
  value: 10,
  min_order_cents: 0,
  max_uses: 0,
  active: true,
  applies_to: "all",
  target_slug: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Coupon>("coupons", 500);
    setCoupons(data || []);
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
      code: (editing.code || "").toUpperCase().trim(),
      value: Number(editing.value) || 0,
      min_order_cents: Number(editing.min_order_cents) || 0,
      max_uses: Number(editing.max_uses) || 0,
    };
    const { error } = await (editing.id ? adminUpdate("coupons", editing.id, payload)
      : adminInsert("coupons", payload));
    setSaving(false);
    if (error) {
      alert("Erro: " + error);
      return;
    }
    setEditing(null);
    await load();
  }

  async function remove(c: Coupon) {
    if (!confirm(`Remover cupom ${c.code}?`)) return;
    const { error } = await adminDelete("coupons", c.id);
    if (error) {
      alert("Erro: " + error);
      return;
    }
    await load();
  }

  async function toggleActive(c: Coupon) {
    const { error } = await adminUpdate("coupons", c.id, { active: !c.active });
    if (error) return alert("Erro: " + error);
    await load();
  }

  function copy(c: Coupon) {
    navigator.clipboard.writeText(c.code);
    setCopied(c.id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <AdminShell title="Cupons">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total" value={String(coupons.length)} />
        <StatBox label="Ativos" value={String(coupons.filter((c) => c.active).length)} accent="emerald" />
        <StatBox label="Usos totais" value={String(coupons.reduce((s, c) => s + (c.used_count || 0), 0))} accent="blue" />
        <StatBox label="Vencidos" value={String(coupons.filter((c) => c.valid_until && new Date(c.valid_until) < new Date()).length)} accent="rose" />
      </div>

      <Widget
        title="Cupons de desconto"
        icon={<Ticket className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditing({ ...EMPTY })}>
              <Plus className="h-3.5 w-3.5" /> Novo cupom
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : coupons.length === 0 ? (
          <EmptyState
            title="Nenhum cupom"
            description="Crie cupons de desconto para aumentar suas conversões."
            icon={<Ticket className="h-8 w-8" />}
            action={<Button variant="primary" onClick={() => setEditing({ ...EMPTY })}><Plus className="h-3.5 w-3.5" /> Criar cupom</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => {
              const expired = c.valid_until && new Date(c.valid_until) < new Date();
              return (
                <div key={c.id} className={`rounded-xl border p-4 ${c.active ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-white/5 bg-white/[0.02]"}`}>
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copy(c)}
                        className="font-mono text-lg font-bold tracking-wider text-white hover:text-emerald-300"
                        title="Copiar código"
                      >
                        {c.code}
                      </button>
                      {copied === c.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                    </div>
                    <Badge variant={expired ? "danger" : c.active ? "success" : "muted"}>
                      {expired ? "expirado" : c.active ? "ativo" : "inativo"}
                    </Badge>
                  </div>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-300">
                      {c.kind === "percent" ? `${c.value}%` : brl(c.value * 100)}
                    </span>
                    <span className="text-xs text-zinc-500">{c.kind === "percent" ? "de desconto" : "off"}</span>
                  </div>
                  {c.description && <p className="mb-2 text-xs text-zinc-400">{c.description}</p>}
                  <div className="space-y-1 text-[11px] text-zinc-500">
                    <div>Usos: {c.used_count || 0}{c.max_uses > 0 ? ` / ${c.max_uses}` : " (ilimitado)"}</div>
                    {c.min_order_cents > 0 && <div>Pedido mínimo: {brl(c.min_order_cents)}</div>}
                    {c.valid_until && <div>Validade: {formatDateTime(c.valid_until)}</div>}
                    {c.applies_to !== "all" && <div>Aplica-se a: {c.applies_to} {c.target_slug}</div>}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <Toggle checked={c.active} onChange={() => toggleActive(c)} label="Ativo" />
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
              <h3 className="text-lg font-bold text-white">{editing.id ? "Editar cupom" : "Novo cupom"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Código</Label>
                <Input
                  value={editing.code || ""}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO10"
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Tipo de desconto</Label>
                <Select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as any })}>
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </Select>
              </div>
              <div>
                <Label>Valor {editing.kind === "percent" ? "(%)" : "(R$)"}</Label>
                <Input type="number" value={editing.value ?? 10} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Pedido mínimo (R$)</Label>
                <Input
                  type="number"
                  value={(editing.min_order_cents ?? 0) / 100}
                  onChange={(e) => setEditing({ ...editing, min_order_cents: Math.round(Number(e.target.value) * 100) })}
                />
              </div>
              <div>
                <Label>Max usos (0 = ilimitado)</Label>
                <Input type="number" value={editing.max_uses ?? 0} onChange={(e) => setEditing({ ...editing, max_uses: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Validade</Label>
                <Input
                  type="datetime-local"
                  value={editing.valid_until ? new Date(editing.valid_until).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>
              <div>
                <Label>Aplica-se a</Label>
                <Select value={editing.applies_to} onChange={(e) => setEditing({ ...editing, applies_to: e.target.value })}>
                  <option value="all">Todos os produtos</option>
                  <option value="service">Serviço específico</option>
                  <option value="category">Categoria</option>
                </Select>
              </div>
              <div>
                <Label>Slug alvo (se aplicável)</Label>
                <Input value={editing.target_slug || ""} onChange={(e) => setEditing({ ...editing, target_slug: e.target.value })} placeholder="video-dedicado" />
              </div>
              <div className="sm:col-span-2">
                <Label>Descrição (interno)</Label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Cupom ativo" />
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
