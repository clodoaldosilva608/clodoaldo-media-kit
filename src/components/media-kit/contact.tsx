"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send, Instagram, Music2, Youtube } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

const EMAIL = "clodoaldosilva608@gmail.com";
const TIKTOK = "https://www.tiktok.com/@clodoald_c_silva";
const INSTAGRAM = "https://www.instagram.com/clodoaldo_c_silva";
const YOUTUBE = "https://youtube.com/@clodoaldosilvaa";
const WHATSAPP = "https://wa.me/qr/AGB4UOBZXOSAE1";

export function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nome = String(fd.get("nome") || "");
    const empresa = String(fd.get("empresa") || "");
    const email = String(fd.get("email") || "");
    const mensagem = String(fd.get("mensagem") || "");

    const subject = encodeURIComponent(
      `Proposta de parceria${empresa ? ` — ${empresa}` : ""}`,
    );
    const body = encodeURIComponent(
      `Olá Clodoaldo,\n\n${mensagem}\n\n---\nNome: ${nome}\nEmpresa: ${empresa}\nE-mail: ${email}`,
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <section id="contato" className="py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="09"
          eyebrow="Contato"
          title="Vamos construir algo incrível juntos?"
          subtitle="Conte sobre o seu projeto. Respondo todas as propostas em até 48 horas."
        />

        <div className="mt-10 sm:mt-14 grid lg:grid-cols-5 gap-4 sm:gap-6">
          <div
            ref={ref}
            className="reveal lg:col-span-3 rounded-3xl border border-border bg-card/70 backdrop-blur p-5 sm:p-6 md:p-8 shadow-card"
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <Field label="Nome" name="nome" required />
                <Field label="Empresa" name="empresa" />
              </div>
              <Field label="E-mail" name="email" type="email" required />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  name="mensagem"
                  required
                  rows={5}
                  placeholder="Conte sobre seu projeto, objetivos e prazos."
                  className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-base sm:text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
              <button
                type="submit"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-orange px-6 sm:px-7 py-3 sm:py-3.5 min-h-12 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
              >
                <Send size={16} />
                Enviar Proposta
              </button>
              {sent && (
                <p className="text-sm text-primary break-words">
                  Abrindo seu cliente de e-mail… se nada acontecer, escreva
                  diretamente para {EMAIL}.
                </p>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <a
              href={`mailto:${EMAIL}`}
              className="block rounded-2xl border border-border bg-card/70 backdrop-blur p-4 sm:p-6 shadow-card hover:border-primary/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-orange grid place-items-center text-primary-foreground shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    E-mail profissional
                  </div>
                  <div className="font-semibold break-all text-sm sm:text-base">{EMAIL}</div>
                </div>
              </div>
            </a>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-success/30 bg-success/10 backdrop-blur p-4 sm:p-6 hover:border-success/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-success grid place-items-center text-success-foreground shrink-0">
                  <WhatsAppIcon />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Resposta rápida
                  </div>
                  <div className="font-semibold text-sm sm:text-base">Falar no WhatsApp</div>
                </div>
              </div>
            </a>

            <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-4 sm:p-6 shadow-card">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Siga nas redes sociais
              </div>
              <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
                <FollowButton href={INSTAGRAM} label="Seguir no Instagram" handle="@clodoaldo_c_silva" tone="instagram">
                  <Instagram size={18} />
                </FollowButton>
                <FollowButton href={TIKTOK} label="Seguir no TikTok" handle="@clodoald_c_silva" tone="tiktok">
                  <Music2 size={18} />
                </FollowButton>
                <FollowButton href={YOUTUBE} label="Seguir no YouTube" handle="@clodoaldosilvaa" tone="youtube">
                  <Youtube size={18} />
                </FollowButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-base sm:text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
      />
    </div>
  );
}

function FollowButton({
  href,
  label,
  handle,
  tone,
  children,
}: {
  href: string;
  label: string;
  handle: string;
  tone: "instagram" | "tiktok" | "youtube";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "youtube"
      ? "border-[#FF0000]/40 hover:bg-[#FF0000]/15"
      : tone === "instagram"
        ? "border-primary/40 hover:bg-primary/10"
        : "border-border hover:bg-card";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex items-center justify-between gap-3 rounded-xl border ${toneClass} bg-background/50 px-4 py-3 min-h-11 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background/70 text-foreground">
          {children}
        </span>
        <span className="flex flex-col leading-tight">
          <span>{label}</span>
          <span className="text-xs font-normal text-muted-foreground">{handle}</span>
        </span>
      </span>
      <span aria-hidden="true" className="text-xs text-muted-foreground">→</span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 2.05 16.34L1 22l5.78-1.02A10 10 0 1 0 19.05 4.91Zm-7.06 15.36a8.4 8.4 0 0 1-4.27-1.17l-.31-.18-3.43.6.61-3.35-.2-.32a8.41 8.41 0 1 1 7.6 4.42Zm4.62-6.29c-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.57.13-.17.25-.65.82-.79.99-.15.17-.29.18-.54.06-.25-.13-1.06-.39-2.02-1.24a7.6 7.6 0 0 1-1.4-1.74c-.15-.25 0-.39.11-.51.11-.11.25-.29.38-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43-.15 0-.31-.02-.48-.02s-.43.06-.66.31c-.23.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.13.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.49-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
