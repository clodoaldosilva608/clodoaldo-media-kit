"use client";

import { useEffect, useState } from "react";
import { Widget, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import { Settings, Loader2, Check, Save } from "lucide-react";

interface SettingsData {
  pix_key: string;
  pix_key_type: string;
  pix_recipient_name: string;
  whatsapp_for_receipts: string;
  default_max_revisions: number;
  web3forms_access_key: string;
  notification_email: string;
  default_theme: string;
  limit_reached_message: string;
  out_of_scope_message: string;
  brand_name: string;
  brand_logo_url: string;
}

export function SettingsPanel() {
  const [data, setData] = useState<SettingsData>({
    pix_key: "",
    pix_key_type: "cpf",
    pix_recipient_name: "",
    whatsapp_for_receipts: "",
    default_max_revisions: 3,
    web3forms_access_key: "",
    notification_email: "",
    default_theme: "system",
    limit_reached_message: "Você atingiu o limite de revisões gratuitas. Próximas revisões podem ter custos adicionais. Deseja continuar?",
    out_of_scope_message: "Esta alteração está fora do escopo combinado e pode ter custo adicional.",
    brand_name: "Clodoaldo Silva",
    brand_logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/approvals/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setData({
            pix_key: json.data.pix_key || "",
            pix_key_type: json.data.pix_key_type || "cpf",
            pix_recipient_name: json.data.pix_recipient_name || "",
            whatsapp_for_receipts: json.data.whatsapp_for_receipts || "",
            default_max_revisions: json.data.default_max_revisions || 3,
            web3forms_access_key: json.data.web3forms_access_key || "",
            notification_email: json.data.notification_email || "",
            default_theme: json.data.default_theme || "system",
            limit_reached_message: json.data.limit_reached_message || "",
            out_of_scope_message: json.data.out_of_scope_message || "",
            brand_name: json.data.brand_name || "Clodoaldo Silva",
            brand_logo_url: json.data.brand_logo_url || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/approvals/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="py-12 text-center text-zinc-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  return (
    <Widget
      title="Configurações globais do Portal"
      icon={<Settings className="h-4 w-4 text-emerald-400" />}
      action={
        <Button variant="primary" size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
          <span className="ml-1">{saved ? "Salvo!" : "Salvar"}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Marca */}
        <Section title="Identidade da marca">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Nome da marca</Label>
              <Input value={data.brand_name} onChange={(e) => setData({ ...data, brand_name: e.target.value })} />
            </div>
            <div>
              <Label>URL do logo (opcional)</Label>
              <Input value={data.brand_logo_url} onChange={(e) => setData({ ...data, brand_logo_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </Section>

        {/* PIX */}
        <Section title="Configuração de pagamento PIX">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Tipo da chave PIX</Label>
              <Select value={data.pix_key_type} onChange={(e) => setData({ ...data, pix_key_type: e.target.value })}>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">Email</option>
                <option value="phone">Telefone</option>
                <option value="random">Aleatória</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Chave PIX</Label>
              <Input value={data.pix_key} onChange={(e) => setData({ ...data, pix_key: e.target.value })} placeholder="Ex: 123.456.789-00 ou email@dominio.com" />
            </div>
            <div className="sm:col-span-3">
              <Label>Nome do recebedor (para o cliente confirmar)</Label>
              <Input value={data.pix_recipient_name} onChange={(e) => setData({ ...data, pix_recipient_name: e.target.value })} placeholder="Ex: Clodoaldo Silva ME" />
            </div>
          </div>
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp para receber comprovantes">
          <div>
            <Label>Número do WhatsApp (formato internacional, ex: 5581920051068)</Label>
            <Input value={data.whatsapp_for_receipts} onChange={(e) => setData({ ...data, whatsapp_for_receipts: e.target.value })} placeholder="5581920051068" />
            <p className="mt-1 text-[10px] text-zinc-500">
              Quando o cliente paga um custo adicional via PIX, ele envia o comprovante para este número.
              Use um número dedicado para organizar melhor os comprovantes.
            </p>
          </div>
        </Section>

        {/* Limite de revisões */}
        <Section title="Limite padrão de revisões">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Número de revisões inclusas (default)</Label>
              <Input type="number" min={0} max={50} value={data.default_max_revisions} onChange={(e) => setData({ ...data, default_max_revisions: Number(e.target.value) })} />
              <p className="mt-1 text-[10px] text-zinc-500">Padrão: 3. Pode ser override por projeto.</p>
            </div>
            <div>
              <Label>Tema padrão</Label>
              <Select value={data.default_theme} onChange={(e) => setData({ ...data, default_theme: e.target.value })}>
                <option value="system">Seguir sistema do cliente</option>
                <option value="dark">Escuro (premium)</option>
                <option value="light">Claro (corporativo)</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Mensagem quando cliente estourar o limite</Label>
            <Textarea rows={2} value={data.limit_reached_message} onChange={(e) => setData({ ...data, limit_reached_message: e.target.value })} />
          </div>
          <div>
            <Label>Mensagem de "fora do escopo"</Label>
            <Textarea rows={2} value={data.out_of_scope_message} onChange={(e) => setData({ ...data, out_of_scope_message: e.target.value })} />
          </div>
        </Section>

        {/* Notificações por email */}
        <Section title="Notificações automáticas por email (Web3Forms — gratuito)">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3 text-xs text-blue-200 mb-3">
            💡 <strong>Web3Forms</strong> é 100% gratuito. Acesse <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="underline">web3forms.com</a>, cadastre seu email e copie sua <em>Access Key</em>. Cole abaixo para habilitar emails automáticos.
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Web3Forms Access Key</Label>
              <Input value={data.web3forms_access_key} onChange={(e) => setData({ ...data, web3forms_access_key: e.target.value })} placeholder="abc12345-..." />
            </div>
            <div>
              <Label>Email para receber notificações</Label>
              <Input type="email" value={data.notification_email} onChange={(e) => setData({ ...data, notification_email: e.target.value })} placeholder="seu@email.com" />
            </div>
          </div>
          <p className="mt-2 text-[10px] text-zinc-500">
            Emails disparados: projeto enviado ao cliente, cliente pediu alteração, cliente aprovou, custo adicional comunicado.
          </p>
        </Section>
      </div>
    </Widget>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/5 rounded-xl p-4">
      <h3 className="mb-3 text-sm font-bold text-zinc-300">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
