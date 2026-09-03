"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Toggle, Select, Textarea } from "@/components/admin/ui";
import { adminInsert, adminUpdate, fetchAdminData } from "@/lib/admin/data";
import { MessageCircle, RefreshCw, Save, ExternalLink } from "lucide-react";

interface Config {
  id?: string;
  phone: string;
  display_name: string;
  welcome_message: string;
  position: string;
  active: boolean;
}

const DEFAULT: Config = {
  phone: "",
  display_name: "Atendimento",
  welcome_message: "Olá! Vim do site do Clodoaldo e gostaria de mais informações.",
  position: "bottom-right",
  active: true,
};

export default function AdminWhatsAppPage() {
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminData<Config>("whatsapp", 1);
    if (data && data.length > 0) {
      setConfig(data[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    const payload = {
      phone: config.phone.replace(/\D/g, ""),
      display_name: config.display_name,
      welcome_message: config.welcome_message,
      position: config.position,
      active: config.active,
    };
    const { error } = config.id
      ? adminUpdate("whatsapp", config.id, payload)
      : adminInsert("whatsapp", payload);
    setSaving(false);
    if (error) return alert("Erro: " + error.message);
    alert("WhatsApp atualizado!");
    await load();
  }

  const waLink = config.phone ? `https://wa.me/${config.phone.replace(/\D/g, "")}?text=${encodeURIComponent(config.welcome_message)}` : "";

  return (
    <AdminShell title="WhatsApp">
      <Widget
        title="Configuração do WhatsApp"
        icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </Button>
        }
      >
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-xs text-emerald-200">
          <strong>Como funciona:</strong> Um botão flutuante de WhatsApp será exibido em todas as páginas do site quando ativo.
          Cliques abrem o WhatsApp diretamente com a mensagem pré-preenchida.
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Número de telefone (com DDI e DDD)</Label>
              <Input
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                placeholder="5511999999999"
                className="font-mono"
              />
              <p className="mt-1 text-[10px] text-zinc-500">Formato: DDI + DDD + número (ex: 5511999999999)</p>
            </div>
            <div>
              <Label>Nome de exibição</Label>
              <Input value={config.display_name} onChange={(e) => setConfig({ ...config, display_name: e.target.value })} />
            </div>
            <div>
              <Label>Posição do botão</Label>
              <Select value={config.position} onChange={(e) => setConfig({ ...config, position: e.target.value })}>
                <option value="bottom-right">Inferior direito</option>
                <option value="bottom-left">Inferior esquerdo</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex h-[38px] items-center">
                <Toggle checked={config.active} onChange={(v) => setConfig({ ...config, active: v })} label={config.active ? "Ativo (visível no site)" : "Inativo"} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Mensagem pré-preenchida</Label>
              <Textarea
                value={config.welcome_message}
                onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                rows={3}
                placeholder="Olá! Vim do site e gostaria de mais informações…"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Pré-visualização</Label>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{config.display_name}</div>
                    <div className="text-xs text-zinc-400">{config.welcome_message}</div>
                  </div>
                </div>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Testar link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
          <Button variant="primary" onClick={save} disabled={saving || loading}>
            <Save className="h-3.5 w-3.5" /> {saving ? "Salvando…" : "Salvar configuração"}
          </Button>
        </div>
      </Widget>
    </AdminShell>
  );
}
