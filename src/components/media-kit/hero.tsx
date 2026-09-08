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
  const sectionRef = useRef<HTMLElement | null>(null);
  const globeWrapRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const sectionHeight = el.offsetHeight;
        const viewportH = window.innerHeight;

        // Progress: 0 when section top is at viewport top, 1 when section bottom reaches viewport bottom
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = sectionHeight - viewportH;
        const progress = Math.min(1, Math.max(0, scrolled / maxScroll));
        setScrollProgress(progress);

        // Parallax: move globe up + gradual fade + scale
        if (globeWrapRef.current) {
          const globeY = progress * -60; // gentle upward drift
          const globeScale = 1 - progress * 0.15; // gentle shrink
          // Start fade at 40% progress, complete by 90% — smooth gradual fade
          const globeOpacity = progress > 0.4 ? Math.max(0, 1 - (progress - 0.4) / 0.5) : 1;
          globeWrapRef.current.style.transform = `translateY(${globeY}px) scale(${globeScale})`;
          globeWrapRef.current.style.opacity = String(globeOpacity);
        }

        // Fade text out as you scroll past hero
        if (textWrapRef.current) {
          const textOpacity = Math.max(0, 1 - progress * 2.5);
          const textY = progress * -100;
          textWrapRef.current.style.opacity = String(textOpacity);
          textWrapRef.current.style.transform = `translateY(${textY}px)`;
        }

        // Background stays dark — subtle shift from black to deep blue-black
        if (bgRef.current) {
          const r = Math.round(6 + progress * 4);
          const g = Math.round(6 + progress * 8);
          const b = Math.round(10 + progress * 20);
          bgRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
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
    <section
      ref={sectionRef}
      id="inicio"
      className="relative"
      style={{ height: "260vh", backgroundColor: "#06060a", color: "#fff" }}
    >
      {/* Sticky inner container — globe + text stay fixed for 100vh of scroll */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Animated background */}
        <div
          ref={bgRef}
          className="absolute inset-0 transition-colors duration-100"
          style={{ backgroundColor: "rgb(6, 6, 10)" }}
        />

        {/* Atmospheric gradient overlay — washes from bottom up as you scroll */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: "linear-gradient(to top, rgba(77,171,255,0.4) 0%, rgba(77,171,255,0.1) 30%, transparent 60%)",
            opacity: scrollProgress * 1.5,
          }}
        />

        {/* Globe — absolutely positioned, fills right portion, behind text */}
        <div
          ref={globeWrapRef}
          className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[90vh] h-[90vh] max-w-[1100px] max-h-[1100px] will-change-transform z-0"
          style={{ transition: "opacity 0.2s ease-out, transform 0.2s ease-out" }}
        >
          <HeroGlobe scrollProgress={scrollProgress} />
        </div>

        {/* Text content — on top of globe, fades out on scroll */}
        <div
          ref={textWrapRef}
          className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 w-full will-change-transform"
        >
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
                <span key={line} className="hero-line-mask block">
                  <span
                    style={{ animationDelay: `${200 + i * 150}ms` }}
                  >
                    {i === 2 ? (
                      <em className="not-italic text-primary" style={{ animationDelay: `${320 + i * 150}ms` }}>{line}</em>
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/60 text-xs uppercase tracking-[0.2em] animate-bounce">
          Scroll ↓
        </div>
      </div>
    </section>
  );
}
