"use client";

import { useState } from "react";
import { Share2, X, Facebook, Linkedin, Link2, Check, MessageCircle } from "lucide-react";

const SITE_URL = "https://clodoaldo-silva.lovable.app";
const SHARE_TEXT = "Confira o Media Kit do Clodoaldo Silva — parcerias com resultados reais.";

export function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const tryNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Clodoaldo Silva — Media Kit", text: SHARE_TEXT, url: SITE_URL });
        return;
      } catch {
        /* fallback to menu */
      }
    }
    setOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={tryNativeShare}
        aria-label="Compartilhar este Media Kit"
        className="floating-action-stack fixed z-40 bottom-5 right-5 h-12 w-12 rounded-full bg-gradient-orange text-primary-foreground shadow-glow grid place-items-center hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition hidden md:grid"
      >
        <Share2 size={20} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Opções de compartilhamento"
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-end sm:place-items-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-card p-5 mb-4 sm:mb-0"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-medium text-lg">Compartilhar</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="h-10 w-10 rounded-full grid place-items-center hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ShareLink
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(SHARE_TEXT + " " + SITE_URL)}`}
                label="WhatsApp"
                icon={<MessageCircle size={18} />}
              />
              <ShareLink
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
                label="Facebook"
                icon={<Facebook size={18} />}
              />
              <ShareLink
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`}
                label="X / Twitter"
                icon={<XLogo />}
              />
              <ShareLink
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`}
                label="LinkedIn"
                icon={<Linkedin size={18} />}
              />
              <button
                onClick={copyLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 min-h-11 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring col-span-2"
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
                {copied ? "Link copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShareLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 min-h-11 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
      {label}
    </a>
  );
}

function XLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.36 8.41L22.5 22h-6.79l-5.31-6.96L4.24 22H1l7.87-8.99L1.5 2h6.93l4.8 6.34L18.244 2Zm-1.19 18h2.04L7.04 4H4.9l12.155 16Z" />
    </svg>
  );
}
