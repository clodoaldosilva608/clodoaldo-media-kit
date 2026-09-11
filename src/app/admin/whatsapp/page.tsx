"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Textarea } from "@/components/admin/ui";
import {
  MessageCircle, RefreshCw, QrCode, Wifi, WifiOff, Send, Loader2,
  CheckCircle2, AlertTriangle, Smartphone, Zap, Clock, ExternalLink,
} from "lucide-react";

// External WhatsApp service URL (Render.com free tier)
const WA_SERVICE_URL = "https://clodoaldo-whatsapp.onrender.com";
const WA_API_KEY = "clodoaldo-whatsapp-secret-2026";

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
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const resp = await fetch(`${WA_SERVICE_URL}/status`, {
        headers: { "x-api-key": WA_API_KEY },
      });
      if (!resp.ok) throw new Error(`Service responded ${resp.status}`);
      const json = await resp.json();
      setStatus(json);
      setError(null);
    } catch (e: any) {
      setError(`Não foi possível conectar ao serviço WhatsApp. Verifique se o serviço está online: ${WA_SERVICE_URL}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStatus();
    pollRef.current = setInterval(loadStatus, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadStatus]);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      await fetch(`${WA_SERVICE_URL}/connect`, {
        method: "POST",
        headers: { "x-api-key": WA_API_KEY },
      });
    } catch (e: any) {
      setError(`Erro ao conectar: ${e.message}`);
    }
    setConnecting(false);
  }

  async function handleDisconnect() {
    if (!confirm("Desconectar WhatsApp? Você precisará escanear o QR Code novamente.")) return;
    await fetch(`${WA_SERVICE_URL}/disconnect`, {
      method: "POST",
      headers: { "x-api-key": WA_API_KEY },
    });
    loadStatus();
  }

  async function handleSendTest() {
    if (!testPhone || !testMessage) return;
    setSending(true);
    setSendResult(null);
    try {
      const resp = await fetch(`${WA_SERVICE_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": WA_API_KEY },
        body: JSON.stringify({ phone: testPhone, text: testMessage }),
      });
      const json = await resp.json();
      setSendResult(json);
      if (json.ok) setTestMessage("");
    } catch (e: any) {
      setSendResult({ ok: false, error: e.message });
    }
    setSending(false);
  }

  const isConnected = status.status === "connected";
  const isQRReady = status.status === "qr_ready";
  const isConnecting = status.status === "connecting" || connecting;

  return (
    <AdminShell title="WhatsApp — Conexão via Baileys (Render)">
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

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-200">Serviço WhatsApp offline</h4>
              <p className="mt-1 text-xs text-rose-200/80">{error}</p>
              <p className="mt-2 text-xs text-rose-200/60">
                O serviço roda gratuitamente no Render.com. Pode levar 30-60s para "acordar" após inatividade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-200">⚠️ Uso não-oficial do WhatsApp</h4>
            <p className="mt-1 text-xs text-amber-200/80">
              Esta conexão usa Baileys (não-oficial). Limite de <strong>{status.dailyLimit} mensagens/dia</strong> para reduzir risco de banimento.
              Use apenas para responder leads. Não enviar spam.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* QR Code / Connection */}
        <Widget
          title="Conexão WhatsApp"
          icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}
          action={
            <div className="flex items-center gap-2">
              <a href={WA_SERVICE_URL} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-zinc-300">
                <ExternalLink className="h-3 w-3 inline" /> Serviço
              </a>
              {isConnected ? (
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
              )}
            </div>
          }
        >
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-600" />
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <WifiOff className="h-16 w-16 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">Serviço offline. Aguarde 60s e recarregue.</p>
              <Button variant="outline" onClick={loadStatus}>
                <RefreshCw className="h-4 w-4" /> Recarregar
              </Button>
            </div>
          ) : isConnected ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-lg font-bold text-emerald-300">WhatsApp Conectado!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Número (81) 92005-1068 conectado e pronto para enviar/receber mensagens automaticamente.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <Wifi className="h-3.5 w-3.5" /> Conexão ativa
              </div>
            </div>
          ) : isQRReady && status.qr ? (
            <div className="py-6 text-center space-y-4">
              <div className="inline-block rounded-2xl border-2 border-white/10 bg-white p-4">
                <img
                  src={status.qr}
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

        {/* Send Test Message */}
        <Widget title="Enviar mensagem de teste" icon={<Send className="h-4 w-4 text-blue-400" />}>
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
                <Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="Ex: 5581994057216" />
                <p className="mt-1 text-[10px] text-zinc-500">Formato: 55 (Brasil) + DDD + número</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Mensagem</label>
                <Textarea value={testMessage} onChange={(e) => setTestMessage(e.target.value)} placeholder="Digite a mensagem..." rows={4} />
              </div>
              <Button variant="primary" onClick={handleSendTest} disabled={sending || !testPhone || !testMessage} className="w-full">
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
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min((status.messagesToday / status.dailyLimit) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          )}
        </Widget>
      </div>

      {/* Integration Info */}
      <Widget title="Integração com Prospecção" icon={<Zap className="h-4 w-4 text-amber-400" />} className="mt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Envio automático</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Ao disparar previews, as mensagens são enviadas automaticamente via WhatsApp (se conectado).
            </p>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Recebimento automático</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Respostas dos leads são recebidas e registradas automaticamente + notificação Telegram.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Limite diário</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Máximo de {status.dailyLimit} mensagens/dia para reduzir risco de banimento.
            </p>
          </div>
        </div>
      </Widget>

      {/* === CONVERSAS === */}
      <ConversationsPanel />
    </AdminShell>
  );
}

// =====================================================
// CONVERSAS PANEL — lista de conversas + responder
// =====================================================
function ConversationsPanel() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const resp = await fetch("/api/whatsapp/conversations");
      const json = await resp.json();
      setConversations(json.conversations || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSendReply() {
    if (!selected || !replyText) return;
    setSending(true);
    setSendResult(null);

    // Get phone from conversation
    const phone = selected.whatsapp || "";
    if (!phone) {
      setSendResult({ ok: false, error: "Sem número de WhatsApp" });
      setSending(false);
      return;
    }

    try {
      // Try sending via Render Baileys service
      const resp = await fetch("https://clodoaldo-whatsapp.onrender.com/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "clodoaldo-whatsapp-secret-2026" },
        body: JSON.stringify({ phone, text: replyText }),
      });
      const json = await resp.json();
      setSendResult(json);

      if (json.ok) {
        // Add message to conversation locally
        setSelected((prev: any) => ({
          ...prev,
          messages: [...prev.messages, { type: "sent", text: replyText, timestamp: new Date().toISOString() }],
        }));
        setReplyText("");
      }
    } catch (e: any) {
      // Fallback: generate wa.me link
      const waNum = phone.replace(/\D/g, "");
      const waLink = `https://wa.me/${waNum}?text=${encodeURIComponent(replyText)}`;
      setSendResult({ ok: false, error: "Envio automático falhou", waLink });
    }
    setSending(false);
  }

  if (loading) {
    return (
      <Widget title="Conversas" icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4">
        <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" /></div>
      </Widget>
    );
  }

  if (conversations.length === 0) {
    return (
      <Widget title="Conversas" icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4">
        <EmptyState title="Nenhuma conversa ainda" description="As conversas aparecerão aqui quando os leads responderem." icon={<MessageCircle className="h-8 w-8" />} />
      </Widget>
    );
  }

  return (
    <Widget title={`Conversas (${conversations.length})`} icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4" action={
      <Button variant="outline" size="sm" onClick={load}>
        <RefreshCw className="h-3.5 w-3.5" /> Atualizar
      </Button>
    }>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Lista de conversas */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {conversations.map((conv) => (
            <button
              key={conv.prospectId}
              onClick={() => { setSelected(conv); setSendResult(null); }}
              className={`block w-full text-left rounded-xl border p-3 transition ${
                selected?.prospectId === conv.prospectId
                  ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white truncate">{conv.prospectName}</span>
                {conv.lastMessage && (
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {new Date(conv.lastMessage.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-[11px] text-zinc-400 truncate">
                  {conv.lastMessage.type === "sent" ? "→ " : "← "}
                  {conv.lastMessage.text}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                {conv.niche && <span className="text-[9px] text-zinc-500 capitalize">{conv.niche}</span>}
                {conv.messages.filter((m: any) => m.type === "received").length > 0 && (
                  <span className="text-[9px] text-blue-400">{conv.messages.filter((m: any) => m.type === "received").length} respostas</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Conversa selecionada */}
        {selected ? (
          <div className="flex flex-col" style={{ minHeight: "400px" }}>
            {/* Header */}
            <div className="border-b border-white/5 pb-3 mb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold text-white">{selected.prospectName}</span>
                  <span className="ml-2 text-[11px] text-zinc-500">{selected.whatsapp || "Sem WhatsApp"}</span>
                </div>
                {selected.niche && <Badge variant="info">{selected.niche}</Badge>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-2" style={{ maxHeight: "350px" }}>
              {selected.messages.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    msg.type === "sent"
                      ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-100"
                      : "bg-white/5 border border-white/5 text-zinc-200"
                  }`}>
                    <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-zinc-500">
                        {new Date(msg.timestamp).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                      </span>
                      {msg.classification && (
                        <span className="text-[9px] text-amber-400">{msg.classification}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            <div className="mt-3 border-t border-white/5 pt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Digite sua resposta…"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handleSendReply} disabled={sending || !replyText}>
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Enviar resposta
                </Button>
                {selected.whatsapp && (
                  <a
                    href={`https://wa.me/${selected.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(replyText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Ou abrir no WhatsApp →
                  </a>
                )}
              </div>

              {sendResult && (
                <div className={`rounded-lg border p-2 text-xs ${
                  sendResult.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}>
                  {sendResult.ok ? (
                    <span>✅ Mensagem enviada!</span>
                  ) : (
                    <span>
                      ⚠️ {sendResult.error}
                      {sendResult.waLink && (
                        <a href={sendResult.waLink} target="_blank" rel="noreferrer" className="ml-2 underline text-emerald-400">
                          Enviar via WhatsApp →
                        </a>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-zinc-500 text-sm">
            Selecione uma conversa para ver as mensagens
          </div>
        )}
      </div>
    </Widget>
  );
}
