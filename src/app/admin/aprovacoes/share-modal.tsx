"use client";

import { useState, useEffect } from "react";
import {
  X, Share2, Copy, Check, Send, MessageCircle, Mail, Facebook,
  Linkedin, Twitter, Globe, Smartphone, MessageSquare, Wifi,
  ExternalLink, Loader2,
} from "lucide-react";

interface ShareProjectModalProps {
  open: boolean;
  onClose: () => void;
  publicUrl: string;
  projectTitle: string;
  clientName: string;
  clientWhatsapp?: string | null;
  clientEmail?: string | null;
}

interface NetworkOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  /** Build share URL given message + URL */
  buildUrl: (url: string, message: string, subject: string) => string;
  /** Whether this network supports pre-filling message (some only support URL) */
  supportsMessage: boolean;
  /** Optional pre-fill with specific phone/email */
  prefillContact?: string;
}

const NETWORKS: NetworkOption[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    buildUrl: (url, msg) => `https://wa.me/?text=${encodeURIComponent(`${msg}\n\n${url}`)}`,
    supportsMessage: true,
  },
  {
    id: "whatsapp_direct",
    label: "WhatsApp (direto p/ cliente)",
    icon: Send,
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    buildUrl: (url, msg, _s, phone) =>
      phone
        ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`${msg}\n\n${url}`)}`
        : `https://wa.me/?text=${encodeURIComponent(`${msg}\n\n${url}`)}`,
    supportsMessage: true,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: Send,
    color: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    buildUrl: (url, msg) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
    supportsMessage: true,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    buildUrl: (url, msg, subject, _p, email) =>
      `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${msg}\n\n${url}`)}`,
    supportsMessage: true,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "bg-blue-600/15 text-blue-400 border-blue-600/30",
    buildUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    supportsMessage: false,
  },
  {
    id: "messenger",
    label: "Messenger",
    icon: MessageSquare,
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    buildUrl: (url) => `https://www.facebook.com/dialog/send?app_id=291494419107518&link=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`,
    supportsMessage: false,
  },
  {
    id: "twitter",
    label: "X / Twitter",
    icon: Twitter,
    color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    buildUrl: (url, msg) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
    supportsMessage: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700/15 text-blue-300 border-blue-700/30",
    buildUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    supportsMessage: false,
  },
  {
    id: "sms",
    label: "SMS",
    icon: Smartphone,
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    buildUrl: (url, msg) => `sms:?body=${encodeURIComponent(`${msg}\n\n${url}`)}`,
    supportsMessage: true,
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: Globe,
    color: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    buildUrl: (url, msg) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(msg)}`,
    supportsMessage: true,
  },
  {
    id: "signal",
    label: "Signal",
    icon: Wifi,
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    buildUrl: (url, msg) =>
      `https://signal.me/#text=${encodeURIComponent(`${msg}\n\n${url}`)}`,
    supportsMessage: true,
  },
];

export function ShareProjectModal({
  open, onClose, publicUrl, projectTitle, clientName, clientWhatsapp, clientEmail,
}: ShareProjectModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(["whatsapp"]));
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  // Pré-preenche mensagem
  useEffect(() => {
    if (open && !message) {
      setMessage(
        `Olá ${clientName}! Seu projeto "${projectTitle}" está pronto para revisão. Acesse o portal para visualizar, pedir ajustes ou aprovar:`,
      );
    }
    if (open && !subject) {
      setSubject(`${projectTitle} — Projeto pronto para aprovação`);
    }
  }, [open, clientName, projectTitle, message, subject]);

  if (!open) return null;

  function toggleNetwork(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: subject,
        text: message,
        url: publicUrl,
      }).catch(() => {});
    }
  }

  function sendAll() {
    if (selected.size === 0) {
      alert("Selecione pelo menos uma rede social");
      return;
    }
    setSending(true);
    const networks = NETWORKS.filter((n) => selected.has(n.id));
    networks.forEach((n, i) => {
      const url = n.buildUrl(publicUrl, message, subject, undefined, clientEmail || undefined);
      // Abre cada rede em nova aba, com pequeno delay para não bloquear
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, i * 300);
    });
    setTimeout(() => {
      setSending(false);
      alert(`✅ ${networks.length} ${networks.length === 1 ? "rede social aberta" : "redes sociais abertas"}! Envie o link em cada uma das abas.`);
    }, networks.length * 300 + 500);
  }

  function openOne(id: string) {
    const n = NETWORKS.find((x) => x.id === id);
    if (!n) return;
    const url = n.buildUrl(publicUrl, message, subject, undefined, clientEmail || undefined);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-zinc-950/95 backdrop-blur p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">Compartilhar projeto</h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{projectTitle} · {clientName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition min-h-9 min-w-9 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Link público + Copy */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300">🔗 Link público do portal</span>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <code className="block text-[11px] text-zinc-300 break-all">{publicUrl}</code>
          </div>

          {/* Assunto (para email) */}
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
              Assunto (para email)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Mensagem editável */}
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
              Mensagem (enviada junto com o link)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <p className="mt-1 text-[10px] text-zinc-500">
              💡 O link do portal será adicionado automaticamente ao final da mensagem.
            </p>
          </div>

          {/* Selecione as redes sociais */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-zinc-500">
                Selecione as redes sociais ({selected.size} selecionada{selected.size === 1 ? "" : "s"})
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(new Set(NETWORKS.map((n) => n.id)))}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Selecionar todas
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-[10px] text-zinc-500 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NETWORKS.map((n) => {
                const Icon = n.icon;
                const isSelected = selected.has(n.id);
                const isDirectWhatsApp = n.id === "whatsapp_direct" && !clientWhatsapp;
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleNetwork(n.id)}
                    disabled={isDirectWhatsApp}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                      isSelected
                        ? n.color
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/5"
                    } ${isDirectWhatsApp ? "opacity-40 cursor-not-allowed" : ""}`}
                    title={isDirectWhatsApp ? "Cliente não tem WhatsApp cadastrado" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{n.label}</span>
                    {isSelected && <Check className="h-3 w-3 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ações */}
          <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
            <button
              onClick={sendAll}
              disabled={selected.size === 0 || sending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 text-zinc-950 py-3 text-sm font-bold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Abrindo..." : `Enviar para ${selected.size} ${selected.size === 1 ? "rede" : "redes"}`}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={shareNative}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 py-3 text-sm font-semibold hover:bg-white/10 transition"
              >
                <Share2 className="h-4 w-4" /> Compartilhar nativo (mobile)
              </button>
            )}
          </div>

          {/* Abertura rápida individual */}
          {selected.size > 0 && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] text-zinc-500 mb-2">Ou abra apenas uma rede agora:</p>
              <div className="flex flex-wrap gap-1.5">
                {NETWORKS.filter((n) => selected.has(n.id)).map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => openOne(n.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10px] text-zinc-300 hover:bg-white/10"
                    >
                      <Icon className="h-3 w-3" /> {n.label}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dica */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3 text-[11px] text-blue-200">
            💡 <strong>Como funciona:</strong> Ao clicar em "Enviar para X redes", abriremos uma aba
            para cada rede selecionada. Você precisará confirmar o envio em cada uma delas
            (algumas como Facebook/LinkedIn só compartilham o link, sem a mensagem personalizada).
          </div>
        </div>
      </div>
    </div>
  );
}
