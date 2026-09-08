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
  const [shift, setShift] = useState(0);
  const imageWrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el = imageWrap.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight),
        );
        setShift(progress * -24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="inicio" className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Background gradient + ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(244,83,0,0.08) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 20% 70%, rgba(77,171,255,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 lg:col-span-7 relative z-10">
            <div className="flex items-center gap-4">
              <span className="eyebrow">Criador · Desenvolvedor · Estrategista</span>
              <span className="hairline flex-1" />
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-primary">
                Aberto a parcerias
              </span>
            </div>

            <h1 className="mt-8 font-display text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-medium leading-[0.98] tracking-[-0.03em] text-foreground">
              {LINES.map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <span
                    className="hero-line block"
                    style={{ animationDelay: `${120 + i * 110}ms` }}
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

            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Estratégia, conteúdo e produtos digitais para transformar atenção em resultado.
              Ajudo <strong className="text-foreground">marcas</strong>,{" "}
              <strong className="text-foreground">creators</strong> e{" "}
              <strong className="text-foreground">negócios</strong> a posicionarem suas ideias,
              comunicarem valor e lançarem experiências digitais — do início ao fim.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/quiz"
                onClick={() => trackEvent("entry_path_selected", { path: "quiz_principal" })}
                className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors duration-300 hover:opacity-90"
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
            <div className="mt-10 grid sm:grid-cols-3 gap-3">
              {ENTRY_PATHS.map((path) => {
                const Icon = path.icon;
                return (
                  <a
                    key={path.id}
                    href={path.href}
                    onClick={() =>
                      trackEvent("entry_path_selected", { path: path.id })
                    }
                    className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-4 transition-all hover:border-primary/50 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

          {/* Globe — replaces the portrait image */}
          <div className="order-1 lg:order-2 lg:col-span-5" ref={imageWrap}>
            <div
              className="will-change-transform"
              style={{ transform: `translate3d(0, ${shift}px, 0)` }}
            >
              <HeroGlobe />
            </div>
            <div className="mt-3 flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>One operator</span>
              <span>Global reach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
