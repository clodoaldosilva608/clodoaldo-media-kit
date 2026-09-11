"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Textarea } from "@/components/admin/ui";
import {
  MessageCircle, RefreshCw, QrCode, Wifi, WifiOff, Send, Loader2,
  CheckCircle2, AlertTriangle, Smartphone, Zap, Clock, ExternalLink,
  ArrowRight, ListChecks,
} from "lucide-react";
import Link from "next/link";

export default function WhatsAppPage() {
  return (
    <AdminShell title="WhatsApp — Prospecção manual">
      {/* Strategy banner */}
      <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-200">
              Estratégia ativa: prospecção manual via Telegram + página de prospecção
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Cron diário 09:00 BRT busca 10 leads no Google Maps e gera mensagens personalizadas por IA.
              Você recebe no Telegram e na <Link href="/admin/leads-crm" className="underline text-emerald-400">área de prospecção</Link> com botões
              <code className="mx-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">wa.me/...</code>
              que abrem o WhatsApp com a mensagem pronta. Sem custo, sem manutenção, sem PC ligado.
            </p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Modo</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">Manual</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Cron</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">09:00 BRT</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Custo</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">R$ 0</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
              <Smartphone className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Limite</div>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white">∞</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/leads-crm"
          className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <ListChecks className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Área de Prospecção</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Leads do dia + mensagens geradas por IA + botão WhatsApp</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        <a
          href="https://wa.me/5581994057216"
          target="_blank"
          rel="noreferrer"
          className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">WhatsApp Direto</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Testar envio para (81) 99405-7216 — Destra Vastudy</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
        </a>
      </div>

      {/* Conversas - histórico de respostas */}
      <ConversationsPanel />
    </AdminShell>
  );
}

// =====================================================
// CONVERSAS PANEL — histórico de respostas dos leads
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
    // Modo manual: gera link wa.me que o usuário clica
    const waNum = phone.replace(/\D/g, "");
    const waLink = `https://wa.me/${waNum}?text=${encodeURIComponent(replyText)}`;
    setSendResult({ waLink, manual: true });
    // Atualiza conversa localmente
    setSelected((prev: any) => prev ? ({ ...prev, messages: [...prev.messages, { type: "sent", text: replyText, timestamp: new Date().toISOString() }] }) : prev);
    setReplyText("");
    setSending(false);
  }

  if (loading) return <Widget title="Conversas" icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4"><div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" /></div></Widget>;
  if (conversations.length === 0) return <Widget title="Conversas" icon={<MessageCircle className="h-4 w-4 text-blue-400" />} className="mt-4"><EmptyState title="Nenhuma conversa" description="Conversas aparecerão aqui quando leads responderem às suas mensagens." icon={<MessageCircle className="h-8 w-8" />} /></Widget>;

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
                <Button variant="primary" size="sm" onClick={handleSendReply} disabled={sending || !replyText}>{sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Gerar link WhatsApp</Button>
                {selected.whatsapp && <a href={`https://wa.me/${selected.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(replyText)}`} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-400 hover:text-emerald-300 underline">Abrir WhatsApp →</a>}
              </div>
              {sendResult && sendResult.manual && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
                  ✅ Mensagem pronta. <a href={sendResult.waLink} target="_blank" rel="noreferrer" className="ml-1 underline font-bold">Clique aqui para abrir no WhatsApp →</a>
                </div>
              )}
            </div>
          </div>
        ) : <div className="flex items-center justify-center text-zinc-500 text-sm">Selecione uma conversa</div>}
      </div>
    </Widget>
  );
}
