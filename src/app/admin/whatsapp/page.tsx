"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Textarea } from "@/components/admin/ui";
import {
  MessageCircle, RefreshCw, QrCode, Wifi, WifiOff, Send, Loader2,
  CheckCircle2, AlertTriangle, Smartphone, Zap, Clock, ExternalLink,
} from "lucide-react";

const OPENWA_URL = "https://clodoaldo-openwa-production.up.railway.app";
const OPENWA_KEY = "clodoaldo-openwa-secret-2026";

export default function WhatsAppPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sendResult, setSendResult] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      // Open-WA: check if session is active by trying to get session info
      const resp = await fetch(`${OPENWA_URL}/getConnectionState?key=${OPENWA_KEY}`, { method: "GET" });
      if (resp.ok) {
        const text = await resp.text();
        if (text.includes("CONNECTED")) {
          setConnected(true);
          setError(null);
        } else {
          setConnected(false);
        }
      } else {
        // Fallback: try /qr endpoint — if it returns image, we're not connected
        const qrResp = await fetch(`${OPENWA_URL}/qr`);
        setConnected(!qrResp.ok);
      }
    } catch (e: any) {
      setError("Serviço Open-WA offline. Aguarde 30s e recarregue.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkStatus();
    pollRef.current = setInterval(checkStatus, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [checkStatus]);

  async function handleSendTest() {
    if (!testPhone || !testMessage) return;
    setSending(true);
    setSendResult(null);
    try {
      // Open-WA send text endpoint
      const resp = await fetch(`${OPENWA_URL}/sendText`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "key": OPENWA_KEY },
        body: JSON.stringify({
          sessionId: "main",
          to: testPhone.replace(/\D/g, "") + "@c.us",
          content: testMessage,
        }),
      });
      const json = await resp.json();
      setSendResult(json);
      if (json.sent || json.success) setTestMessage("");
    } catch (e: any) {
      // Fallback: try query params
      try {
        const phone = testPhone.replace(/\D/g, "");
        const resp2 = await fetch(`${OPENWA_URL}/sendText?phone=${phone}&text=${encodeURIComponent(testMessage)}&key=${OPENWA_KEY}`);
        const json2 = await resp2.json();
        setSendResult(json2);
      } catch (e2: any) {
        setSendResult({ error: e2.message });
      }
    }
    setSending(false);
  }

  return (
    <AdminShell title="WhatsApp — Open-WA">
      {/* Status Bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${connected ? "bg-emerald-500/10" : "bg-zinc-500/10"}`}>
              {connected ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5 text-zinc-500" />}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Status</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">
            {connected ? "Conectado" : "Aguardando QR"}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Serviço</div>
          </div>
          <div className="mt-1.5 text-sm font-bold text-white truncate">Open-WA Railway</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Limite</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">30/dia</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
              <Smartphone className="h-3.5 w-3.5 text-violet-400" />
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
              <h4 className="text-sm font-semibold text-rose-200">{error}</h4>
            </div>
          </div>
        </div>
      )}

      {/* QR Code / Connection */}
      <Widget
        title="Conexão WhatsApp"
        icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}
        action={
          <a href={OPENWA_URL} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-zinc-300">
            <ExternalLink className="h-3 w-3 inline" /> Serviço
          </a>
        }
      >
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-600" />
          </div>
        ) : connected ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
            <div>
              <h4 className="text-lg font-bold text-emerald-300">WhatsApp Conectado!</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Número (81) 92005-1068 conectado via Open-WA (Chrome headless).
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
              <Wifi className="h-3.5 w-3.5" /> Conexão ativa
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="inline-block rounded-2xl border-2 border-white/10 bg-white p-4">
              <img
                src={`${OPENWA_URL}/qr`}
                alt="WhatsApp QR Code"
                className="rounded-lg"
                width={280}
                height={280}
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
        )}
      </Widget>

      {/* Send Test Message */}
      <Widget title="Enviar mensagem" icon={<Send className="h-4 w-4 text-blue-400" />} className="mt-4">
        {!connected ? (
          <div className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Conecte o WhatsApp primeiro.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Número (com DDI + DDD)
              </label>
              <Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="Ex: 5581994057216" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Mensagem</label>
              <Textarea value={testMessage} onChange={(e) => setTestMessage(e.target.value)} placeholder="Digite a mensagem..." rows={4} />
            </div>
            <Button variant="primary" onClick={handleSendTest} disabled={sending || !testPhone || !testMessage} className="w-full">
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : <><Send className="h-4 w-4" /> Enviar mensagem</>}
            </Button>
            {sendResult && (
              <div className={`rounded-lg border p-3 text-xs ${sendResult.sent || sendResult.success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
                {sendResult.sent || sendResult.success ? "✅ Mensagem enviada!" : `Erro: ${sendResult.error || JSON.stringify(sendResult)}`}
              </div>
            )}
          </div>
        )}
      </Widget>

      {/* Conversas */}
      <ConversationsPanel />
    </AdminShell>
  );
}

// =====================================================
// CONVERSAS PANEL
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
    const phone = selected.whatsapp || "";
    if (!phone) { setSendResult({ error: "Sem WhatsApp" }); setSending(false); return; }
    try {
      const resp = await fetch(`${OPENWA_URL}/sendText`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "key": OPENWA_KEY },
        body: JSON.stringify({ sessionId: "main", to: phone.replace(/\D/g, "") + "@c.us", content: replyText }),
      });
      const json = await resp.json();
      setSendResult(json);
      if (json.sent || json.success) {
        setSelected((prev: any) => ({ ...prev, messages: [...prev.messages, { type: "sent", text: replyText, timestamp: new Date().toISOString() }] }));
        setReplyText("");
      }
    } catch (e: any) {
      const waNum = phone.replace(/\D/g, "");
      setSendResult({ error: "Envio falhou", waLink: `https://wa.me/${waNum}?text=${encodeURIComponent(replyText)}` });
    }
    setSending(false);
  }

  if (loading) return <Widget title="Conversas" icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4"><div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" /></div></Widget>;
  if (conversations.length === 0) return <Widget title="Conversas" icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4"><EmptyState title="Nenhuma conversa" description="Conversas aparecerão aqui quando leads responderem." icon={<MessageCircle className="h-8 w-8" />} /></Widget>;

  return (
    <Widget title={`Conversas (${conversations.length})`} icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4" action={<Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Atualizar</Button>}>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {conversations.map((conv) => (
            <button key={conv.prospectId} onClick={() => { setSelected(conv); setSendResult(null); }} className={`block w-full text-left rounded-xl border p-3 transition ${selected?.prospectId === conv.prospectId ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <div className="flex items-center justify-between gap-2 mb-1"><span className="text-sm font-bold text-white truncate">{conv.prospectName}</span>{conv.lastMessage && <span className="text-[10px] text-zinc-500 shrink-0">{new Date(conv.lastMessage.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}</div>
              {conv.lastMessage && <p className="text-[11px] text-zinc-400 truncate">{conv.lastMessage.type === "sent" ? "→ " : "← "}{conv.lastMessage.text}</p>}
            </button>
          ))}
        </div>
        {selected ? (
          <div className="flex flex-col" style={{ minHeight: "400px" }}>
            <div className="border-b border-white/5 pb-3 mb-3"><span className="text-sm font-bold text-white">{selected.prospectName}</span><span className="ml-2 text-[11px] text-zinc-500">{selected.whatsapp || "Sem WhatsApp"}</span></div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2" style={{ maxHeight: "350px" }}>
              {selected.messages.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${msg.type === "sent" ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-100" : "bg-white/5 border border-white/5 text-zinc-200"}`}>
                    <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[9px] text-zinc-500 mt-1 block">{new Date(msg.timestamp).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-white/5 pt-3 space-y-2">
              <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Digite sua resposta…" rows={2} />
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handleSendReply} disabled={sending || !replyText}>{sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Enviar</Button>
                {selected.whatsapp && <a href={`https://wa.me/${selected.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(replyText)}`} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-400 hover:text-emerald-300 underline">WhatsApp →</a>}
              </div>
              {sendResult && (
                <div className={`rounded-lg border p-2 text-xs ${sendResult.sent || sendResult.success ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                  {sendResult.sent || sendResult.success ? "✅ Enviada!" : <span>⚠️ {sendResult.error}{sendResult.waLink && <a href={sendResult.waLink} target="_blank" rel="noreferrer" className="ml-2 underline text-emerald-400">WhatsApp →</a>}</span>}
                </div>
              )}
            </div>
          </div>
        ) : <div className="flex items-center justify-center text-zinc-500 text-sm">Selecione uma conversa</div>}
      </div>
    </Widget>
  );
}
