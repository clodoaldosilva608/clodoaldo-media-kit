"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Send, Sparkles, X, Wrench, Loader2, RefreshCcw } from "lucide-react";

/**
 * IA Assistente — chat lateral da admin (Sprint B).
 * Disponível em todas as páginas /admin/* via layout.
 * Somente leitura: consulte leads, funil, prioridades e peça preparo de respostas.
 */

interface Msg {
  role: "user" | "model";
  text: string;
  tools?: string[];
  actions?: string[];
}

const SUGESTOES = [
  "Quais leads estão esfriando?",
  "Leads quentes pra atacar hoje?",
  "Como está o funil da semana?",
  "Monte um follow-up pro lead mais parado",
];

function renderAnswer(text: string) {
  // Renderização simples: negrito **x**, listas - / •, quebras de linha
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-1.5" />;
    const isBullet = /^[-•*]\s+/.test(trimmed);
    const content = isBullet ? trimmed.replace(/^[-•*]\s+/, "") : trimmed;
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={j} className="font-semibold text-white">{p.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{p}</span>
      )
    );
    return (
      <p key={i} className={`text-[13px] leading-relaxed ${isBullet ? "pl-3 relative before:absolute before:left-0 before:text-emerald-400 before:content-['•']" : ""}`}>
        {parts}
      </p>
    );
  });
}

export function AssistantChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || loading) return;
      setError(null);
      const history = msgs.map((m) => ({ role: m.role, text: m.text }));
      setMsgs((prev) => [...prev, { role: "user", text: q }]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/admin/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, history }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
        setMsgs((prev) => [
          ...prev,
          {
            role: "model",
            text: data.answer || "Sem resposta.",
            tools: (data.tool_calls || []).map((t: any) => t.name),
            actions: data.actions_suggested || [],
          },
        ]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [msgs, loading]
  );

  // Esconde na tela de login (API é protegida — nada a consultar sem sessão).
  // Depois de todos os hooks para respeitar as Rules of Hooks.
  if (pathname?.startsWith("/admin/login")) return null;

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir IA Assistente"
        className={`fixed bottom-5 right-5 z-40 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 hover:bg-emerald-400 ${open ? "hidden" : "flex"}`}
        style={{ width: 52, height: 52 }}
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-300 ring-2 ring-[#0a0a0f]" />
        </span>
      </button>

      {/* Painel lateral */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#0d0d14] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="IA Assistente"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">IA Assistente</h2>
              <p className="text-[11px] text-zinc-500">Chief of staff · somente leitura</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMsgs([])}
              aria-label="Limpar conversa"
              title="Limpar conversa"
              className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar assistente"
              className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {msgs.length === 0 && !loading && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[13px] leading-relaxed text-zinc-300">
                  Oi, Clodoaldo! 👋 Pergunte sobre seus leads, funil e prioridades. Eu{" "}
                  <strong className="text-white">monitoro e preparo</strong> — ações de envio e
                  decisão permanecem manuais com você.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Sugestões</p>
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-[13px] text-zinc-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 px-3.5 py-2 text-[13px] font-medium leading-relaxed text-emerald-950">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={i} className="space-y-2">
                <div className="max-w-[92%] space-y-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-3.5 py-3 text-zinc-200">
                  {renderAnswer(m.text)}
                </div>
                {m.tools && m.tools.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pl-1">
                    <Wrench className="h-3 w-3 text-zinc-600" />
                    {m.tools.map((t, j) => (
                      <span key={j} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {m.actions && m.actions.length > 0 && (
                  <div className="ml-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Próxima ação</p>
                    {m.actions.map((a, j) => (
                      <p key={j} className="mt-0.5 text-[12px] text-emerald-100/90">{a}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {loading && (
            <div className="flex items-center gap-2 text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span className="text-[12px]">Consultando o CRM…</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-300">
              Erro: {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre seus leads…"
              className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[13px] text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar pergunta"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-zinc-600">
            Nível 1 · monitoramento e preparação · dados direto do CRM
          </p>
        </div>
      </div>
    </>
  );
}
