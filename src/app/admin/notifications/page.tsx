"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import { adminInsert, adminUpdate, fetchAdminData, timeAgo } from "@/lib/admin/data";
import { Bell, RefreshCw, Send, Check, AlertCircle, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState({ kind: "info", title: "", body: "", href: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Notification>("notifications", 100);
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(n: Notification) {
    const { error } = adminUpdate("notifications", n.id, { read: true });
    if (error) return;
    await load();
  }

  async function markAllRead() {
    const unread = items.filter((n) => !n.read);
    for (const n of unread) {
      adminUpdate("notifications", n.id, { read: true });
    }
    await load();
  }

  async function sendNotification() {
    if (!form.title) return alert("Digite um título");
    const { error } = adminInsert("notifications", {
      kind: form.kind,
      title: form.title,
      body: form.body,
      href: form.href || null,
    });
    if (error) return alert("Erro: " + error.message);
    setForm({ kind: "info", title: "", body: "", href: "" });
    setShowComposer(false);
    await load();
  }

  const iconFor = (kind: string) => {
    switch (kind) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "error": return <AlertCircle className="h-4 w-4 text-rose-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <AdminShell title="Notificações">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox label="Total" value={String(items.length)} />
        <StatBox label="Não lidas" value={String(unread)} accent="amber" />
        <StatBox label="Lidas" value={String(items.length - unread)} accent="emerald" />
        <StatBox label="Esta semana" value={String(items.filter((n) => Date.now() - new Date(n.created_at).getTime() < 7 * 86400000).length)} accent="blue" />
      </div>

      <Widget
        title="Central de notificações"
        icon={<Bell className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5" /> Marcar todas
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowComposer(!showComposer)}>
              <Send className="h-3.5 w-3.5" /> Nova
            </Button>
          </div>
        }
      >
        {showComposer && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Criar notificação</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Tipo</Label>
                <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="success">Sucesso</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                </Select>
              </div>
              <div>
                <Label>Link (opcional)</Label>
                <Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/admin/orders" />
              </div>
              <div className="sm:col-span-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nova venda!" />
              </div>
              <div className="sm:col-span-2">
                <Label>Mensagem</Label>
                <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={2} />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={sendNotification}>
                <Send className="h-3.5 w-3.5" /> Enviar
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : items.length === 0 ? (
          <EmptyState title="Sem notificações" description="Suas notificações aparecerão aqui." icon={<Bell className="h-8 w-8" />} />
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  n.read ? "border-white/5 bg-white/[0.02]" : "border-emerald-500/20 bg-emerald-500/[0.04]"
                }`}
              >
                <div className="mt-0.5">{iconFor(n.kind)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{n.title}</span>
                    {!n.read && <Badge variant="info">nova</Badge>}
                    <span className="ml-auto text-[10px] text-zinc-500">{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <p className="mt-0.5 text-xs text-zinc-400">{n.body}</p>}
                  {n.href && (
                    <a href={n.href} className="mt-1 inline-block text-[11px] font-medium text-emerald-400 hover:text-emerald-300">
                      Abrir →
                    </a>
                  )}
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-emerald-300" title="Marcar como lida">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Widget>
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
