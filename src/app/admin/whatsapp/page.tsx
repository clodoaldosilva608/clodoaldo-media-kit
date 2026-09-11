"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Textarea } from "@/components/admin/ui";
import {
  MessageCircle, RefreshCw, QrCode, Wifi, WifiOff, Send, Loader2,
  CheckCircle2, AlertTriangle, Smartphone, Zap, Clock,
} from "lucide-react";

interface WhatsAppStatus {
  status: "disconnected" | "connecting" | "connected" | "qr_ready";
  qr: string | null;
  messagesToday: number;
  dailyLimit: number;
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: "disconnected",
    qr: null,
    messagesToday: 0,
    dailyLimit: 30,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sendResult, setSendResult] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const resp = await fetch("/api/whatsapp/status");
      const json = await resp.json();
      setStatus(json);
    } catch {}
    setLoading(false);
  }, []);

  // Poll status every 2 seconds when connecting or qr_ready
  useEffect(() => {
    loadStatus();
    pollRef.current = setInterval(loadStatus, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadStatus]);

  async function handleConnect() {
    setConnecting(true);
    try {
      await fetch("/api/whatsapp/connect", { method: "POST" });
      // Polling will pick up the status change
    } catch {}
    setConnecting(false);
  }

  async function handleDisconnect() {
    if (!confirm("Desconectar WhatsApp? Você precisará escanear o QR Code novamente para reconectar.")) return;
    await fetch("/api/whatsapp/disconnect", { method: "POST" });
    loadStatus();
  }

  async function handleSendTest() {
    if (!testPhone || !testMessage) return;
    setSending(true);
    setSendResult(null);
    try {
      const resp = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, text: testMessage }),
      });
      const json = await resp.json();
      setSendResult(json);
      if (json.ok) {
        setTestMessage("");
      }
    } catch (e: any) {
      setSendResult({ ok: false, error: e.message });
    }
    setSending(false);
  }

  const isConnected = status.status === "connected";
  const isQRReady = status.status === "qr_ready";
  const isConnecting = status.status === "connecting" || connecting;

  return (
    <AdminShell title="WhatsApp — Conexão via Baileys">
      {/* Status Bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isConnected ? "bg-emerald-500/10" : "bg-zinc-500/10"}`}>
              {isConnected ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5 text-zinc-500" />}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Status</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">
            {isConnected ? "Conectado" : isQRReady ? "QR Pronto" : isConnecting ? "Conectando..." : "Desconectado"}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <Send className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Enviadas hoje</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">{status.messagesToday}/{status.dailyLimit}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Limite diário</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">{status.dailyLimit} msgs</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <Smartphone className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Número</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">(81) 92005-1068</div>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-200">⚠️ Uso não-oficial do WhatsApp</h4>
            <p className="mt-1 text-xs text-amber-200/80">
              Esta conexão usa a biblioteca Baileys (não-oficial). O WhatsApp pode banir o número se houver spam.
              <strong> Limite de {status.dailyLimit} mensagens/dia</strong> para reduzir o risco. Use apenas para responder leads que iniciaram contato.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* === QR Code / Connection === */}
        <Widget
          title="Conexão WhatsApp"
          icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}
          action={
            isConnected ? (
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <WifiOff className="h-3.5 w-3.5" /> Desconectar
              </Button>
            ) : !isConnecting ? (
              <Button variant="primary" size="sm" onClick={handleConnect}>
                <Wifi className="h-3.5 w-3.5" /> Conectar
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguarde...
              </Button>
            )
          }
        >
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-600" />
            </div>
          ) : isConnected ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-lg font-bold text-emerald-300">WhatsApp Conectado!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Número (81) 92005-1068 conectado e pronto para enviar/receber mensagens.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <Wifi className="h-3.5 w-3.5" /> Conexão ativa
              </div>
            </div>
          ) : isQRReady && status.qr ? (
            <div className="py-6 text-center space-y-4">
              <div className="inline-block rounded-2xl border-2 border-white/10 bg-white p-4">
                {/* QR Code rendered as SVG via qrserver API */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=ffffff&color=000000&data=${encodeURIComponent(status.qr)}`}
                  alt="WhatsApp QR Code"
                  width={280}
                  height={280}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Escaneie o QR Code</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Abra o WhatsApp no celular → Configurações → Aparelhos conectados → Conectar aparelho → escaneie o código
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguardando scan...
              </div>
            </div>
          ) : isConnecting ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-400" />
              <p className="text-sm text-zinc-400">Gerando QR Code...</p>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <QrCode className="h-16 w-16 text-zinc-600 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">WhatsApp Desconectado</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Clique em "Conectar" para gerar o QR Code e escanear com seu celular.
                </p>
              </div>
              <Button variant="primary" onClick={handleConnect}>
                <Wifi className="h-4 w-4" /> Conectar WhatsApp
              </Button>
            </div>
          )}
        </Widget>

        {/* === Send Test Message === */}
        <Widget
          title="Enviar mensagem de teste"
          icon={<Send className="h-4 w-4 text-blue-400" />}
        >
          {!isConnected ? (
            <div className="py-8 text-center">
              <AlertTriangle className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Conecte o WhatsApp primeiro para enviar mensagens.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Número (com DDI + DDD)
                </label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Ex: 5581994057216"
                />
                <p className="mt-1 text-[10px] text-zinc-500">Formato: 55 (Brasil) + DDD + número</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Mensagem
                </label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Digite a mensagem..."
                  rows={4}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSendTest}
                disabled={sending || !testPhone || !testMessage}
                className="w-full"
              >
                {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : <><Send className="h-4 w-4" /> Enviar mensagem</>}
              </Button>

              {sendResult && (
                <div className={`rounded-lg border p-3 text-xs ${sendResult.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
                  {sendResult.ok ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Mensagem enviada com sucesso!</span>
                  ) : (
                    <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Erro: {sendResult.error}</span>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] text-zinc-400">
                <div className="flex items-center justify-between mb-1">
                  <span>Mensagens enviadas hoje:</span>
                  <span className="font-bold text-white">{status.messagesToday}/{status.dailyLimit}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min((status.messagesToday / status.dailyLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </Widget>
      </div>

      {/* === Integration Info === */}
      <Widget
        title="Integração com Prospecção"
        icon={<Zap className="h-4 w-4 text-amber-400" />}
        className="mt-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Envio automático</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Ao disparar previews em massa, as mensagens são enviadas automaticamente via WhatsApp (se conectado).
            </p>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Recebimento automático</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Respostas dos leads são recebidas e registradas automaticamente no sistema + notificação Telegram.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Limite diário</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Máximo de {status.dailyLimit} mensagens/dia para reduzir risco de banimento do número.
            </p>
          </div>
        </div>
      </Widget>
    </AdminShell>
  );
}
