"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, Megaphone, Edit3, Code2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { HeroGlobe } from "@/components/hero/hero-globe";

const LINES = ["Transformando", "conhecimento", "em patrimônio."];

const ENTRY_PATHS = [
  {
    id: "marca",
    icon: Megaphone,
    title: "Sou marca ou produto",
    promise: "Campanhas com narrativa, alcance e conversão.",
    cta: "Montar campanha",
    href: "/quiz?profile=marca",
    color: "from-[#FF7A00] to-[#B34A00]",
  },
  {
    id: "creator",
    icon: Edit3,
    title: "Sou creator ou negócio",
    promise: "Roteiro, edição, criativos e auditoria de conteúdo.",
    cta: "Melhorar meu conteúdo",
    href: "/quiz?profile=creator",
    color: "from-[#8b5cf6] to-[#4c1d95]",
  },
  {
    id: "empresa",
    icon: Code2,
    title: "Tenho ideia digital",
    promise: "MVP, aplicativo ou ferramenta sob medida.",
    cta: "Falar sobre meu projeto",
    href: "/quiz?profile=empresa",
    color: "from-[#0ea5a5] to-[#065f5f]",
  },
] as const;

export function Hero() {
  return (
    <section id="inicio" className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden min-h-[90vh] flex items-center">
      {/* Globe — positioned absolutely, fills right half, BEHIND text */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[80vh] h-[80vh] max-w-[900px] max-h-[900px]">
          <HeroGlobe />
        </div>
      </div>

      {/* Text content — on top of globe */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10 w-full">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 hero-text-reveal" style={{ animationDelay: "0ms" }}>
            <span className="eyebrow">Criador · Desenvolvedor · Estrategista</span>
            <span className="hairline flex-1 max-w-[120px]" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-primary hidden sm:inline">
              Aberto a parcerias
            </span>
          </div>

          <h1 className="mt-8 font-display text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-medium leading-[0.98] tracking-[-0.03em] text-foreground">
            {LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <span
                  className="hero-text-reveal block"
                  style={{ animationDelay: `${200 + i * 150}ms` }}
                >
                  {i === 2 ? (
                    <em className="not-italic text-primary">{line}</em>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed hero-text-reveal"
            style={{ animationDelay: "650ms" }}
          >
            Estratégia, conteúdo e produtos digitais para transformar atenção em resultado.
            Ajudo <strong className="text-foreground">marcas</strong>,{" "}
            <strong className="text-foreground">creators</strong> e{" "}
            <strong className="text-foreground">negócios</strong> a posicionarem suas ideias,
            comunicarem valor e lançarem experiências digitais — do início ao fim.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3 hero-text-reveal"
            style={{ animationDelay: "800ms" }}
          >
            <a
              href="/quiz"
              onClick={() => trackEvent("entry_path_selected", { path: "quiz_principal" })}
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-105"
            >
              <Sparkles size={17} />
              Encontrar a melhor solução
              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver media kit
            </a>
          </div>

          {/* Três portas de entrada por perfil */}
          <div
            className="mt-10 grid sm:grid-cols-3 gap-3 max-w-2xl hero-text-reveal"
            style={{ animationDelay: "950ms" }}
          >
            {ENTRY_PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <a
                  key={path.id}
                  href={path.href}
                  onClick={() => trackEvent("entry_path_selected", { path: path.id })}
                  className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-4 transition-all hover:border-primary/50 hover:bg-card/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${path.color} text-white shadow-glow`}>
                    <Icon size={16} />
                  </div>
                  <div className="mt-3 font-display font-semibold text-sm text-foreground leading-tight">
                    {path.title}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {path.promise}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {path.cta}
                    <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caption bottom */}
      <div className="absolute bottom-4 left-0 right-0 z-10 mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>One operator</span>
        <span className="hidden sm:inline">Global reach</span>
      </div>
    </section>
  );
}
