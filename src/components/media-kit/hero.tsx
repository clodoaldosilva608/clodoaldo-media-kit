"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, Megaphone, Edit3, Code2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { HeroGlobe } from "@/components/hero/hero-globe";

const LINES = ["Transformando", "conhecimento", "em patrimônio."];

const ENTRY_PATHS = [
  { id: "marca", icon: Megaphone, title: "Sou marca ou produto", promise: "Campanhas com narrativa, alcance e conversão.", cta: "Montar campanha", href: "/quiz?profile=marca", color: "from-[#FF7A00] to-[#B34A00]" },
  { id: "creator", icon: Edit3, title: "Sou creator ou negócio", promise: "Roteiro, edição, criativos e auditoria de conteúdo.", cta: "Melhorar meu conteúdo", href: "/quiz?profile=creator", color: "from-[#8b5cf6] to-[#4c1d95]" },
  { id: "empresa", icon: Code2, title: "Tenho ideia digital", promise: "MVP, aplicativo ou ferramenta sob medida.", cta: "Falar sobre meu projeto", href: "/quiz?profile=empresa", color: "from-[#0ea5a5] to-[#065f5f]" },
] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const globeWrapRef = useRef<HTMLDivElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // On mobile, the 150vh hero creates too much empty scroll — collapse to ~110vh
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile && sectionRef.current) {
      sectionRef.current.style.height = "110vh";
    }

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
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, sectionHeight - viewportH);
        const p = Math.min(1, Math.max(0, scrolled / maxScroll));
        setScrollProgress(p);

        // === CONTINUOUS SCROLL STATES — no empty space ===
        // 0-10%:   Everything visible. Entrance CSS animations playing.
        // 10-35%:  Title fades + moves left. Globe grows + moves right. Scroll indicator fades.
        // 35-60%:  Cards fade out downward. Globe continues growing + rotating.
        // 60-85%:  Globe dissolves. Background shifts to deep blue. Overlay grows.
        // 85-100%: Clean transition to next section.

        // TEXT: fade 10→35%, move left 60px
        if (textWrapRef.current) {
          const textOpacity = p < 0.1 ? 1 : Math.max(0, 1 - (p - 0.1) / 0.25);
          const textX = p < 0.1 ? 0 : -(p - 0.1) * 60 / 0.25;
          textWrapRef.current.style.opacity = String(textOpacity);
          textWrapRef.current.style.transform = `translateX(${textX}px)`;
        }

        // CARDS: fade 35→60%, move down 30px
        if (cardsRef.current) {
          const cardOpacity = p < 0.35 ? 1 : Math.max(0, 1 - (p - 0.35) / 0.25);
          const cardY = p < 0.35 ? 0 : (p - 0.35) * 30 / 0.25;
          cardsRef.current.style.opacity = String(cardOpacity);
          cardsRef.current.style.transform = `translateY(${cardY}px)`;
        }

        // GLOBE: grow 1.0→1.5, move right 100px, fade starts at 60%
        if (globeWrapRef.current) {
          const globeScale = 1 + p * 0.5;
          const globeX = p * 100;
          const globeOpacity = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.3);
          globeWrapRef.current.style.transform = `translateX(${globeX}px) scale(${globeScale})`;
          globeWrapRef.current.style.opacity = String(globeOpacity);
        }

        // SCROLL INDICATOR: fades immediately on scroll
        if (scrollIndicatorRef.current) {
          scrollIndicatorRef.current.style.opacity = String(Math.max(0, 1 - p * 5));
        }

        // BACKGROUND: dark → deep blue (stays dark, no white)
        if (bgRef.current) {
          const r = Math.round(6 + p * 5);
          const g = Math.round(6 + p * 10);
          const b = Math.round(10 + p * 25);
          bgRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }

        // OVERLAY: atmospheric blue grows from 30% onward
        if (overlayRef.current) {
          const overlayOpacity = p < 0.3 ? 0 : Math.min(1, (p - 0.3) * 1.5);
          overlayRef.current.style.opacity = String(overlayOpacity);
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
      style={{ height: "150vh", backgroundColor: "#06060a", color: "#fff" }}
    >
      <div className="hero-sticky sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background */}
        <div ref={bgRef} className="absolute inset-0" style={{ backgroundColor: "rgb(6, 6, 10)" }} />

        {/* Atmospheric overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(40,60,120,0.35) 0%, transparent 50%)",
            opacity: 0,
            transition: "opacity 0.15s ease-out",
          }}
        />

        {/* Globe — idêntico em desktop e mobile (mesma opacidade, posicionamento proporcional) */}
        <div
          ref={globeWrapRef}
          className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[1100px] h-[1100px] max-w-[95vw] max-h-[95vh] will-change-transform z-0
                     max-md:right-[-15%] max-md:top-1/2 max-md:w-[900px] max-md:h-[900px]"
          style={{ transition: "opacity 0.2s ease-out" }}
        >
          <HeroGlobe scrollProgress={scrollProgress} />
        </div>

        {/* Text content — ON TOP of globe, left-aligned */}
        <div
          ref={textWrapRef}
          className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 w-full will-change-transform max-md:pt-20 max-md:max-w-md"
          style={{ transition: "opacity 0.15s ease-out, transform 0.15s ease-out" }}
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-2 sm:gap-4 hero-text-reveal" style={{ animationDelay: "0ms" }}>
              <span className="eyebrow text-[0.625rem] sm:text-[0.6875rem]">Criador · Desenvolvedor · Estrategista</span>
              <span className="hairline flex-1 max-w-[120px] hidden sm:block" />
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-primary hidden lg:inline">
                Aberto a parcerias
              </span>
            </div>

            <h1 className="mt-5 sm:mt-8 font-display text-[2rem] sm:text-6xl lg:text-[4.5rem] font-medium leading-[1.02] sm:leading-[0.98] tracking-[-0.03em] text-foreground">
              {LINES.map((line, i) => (
                <span key={line} className="hero-line-mask block">
                  <span style={{ animationDelay: `${200 + i * 150}ms` }}>
                    {i === 2 ? (
                      <em className="not-italic text-primary" style={{ animationDelay: `${320 + i * 150}ms` }}>{line}</em>
                    ) : line}
                  </span>
                </span>
              ))}
            </h1>

            <p className="mt-4 sm:mt-6 text-primary font-bold text-base sm:text-lg leading-snug hero-text-reveal" style={{ animationDelay: "500ms" }}>
              Da primeira ideia ao resultado real.
            </p>

            <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-lg text-muted-foreground leading-relaxed hero-text-reveal" style={{ animationDelay: "650ms" }}>
              Estratégia, conteúdo e produtos digitais para transformar atenção em resultado.
              Ajudo <strong className="text-foreground">marcas</strong>,{" "}
              <strong className="text-foreground">creators</strong> e{" "}
              <strong className="text-foreground">negócios</strong> a posicionarem suas ideias,
              comunicarem valor e lançarem experiências digitais — do início ao fim.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2 sm:gap-3 hero-text-reveal" style={{ animationDelay: "800ms" }}>
              <a href="/quiz" onClick={() => trackEvent("entry_path_selected", { path: "quiz_principal" })}
                className="group btn-micro inline-flex items-center gap-2 sm:gap-3 rounded-full bg-primary px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
                <Sparkles size={16} />
                <span className="whitespace-nowrap">Encontrar a melhor solução</span>
                <ArrowUpRight size={16} className="arrow-hover transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#contato" className="inline-flex items-center gap-2 px-3 py-3.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                Ver media kit
              </a>
            </div>

            {/* Entry path cards */}
            <div
              ref={cardsRef}
              className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-xl hero-text-reveal"
              style={{ animationDelay: "950ms", transition: "opacity 0.2s ease-out, transform 0.2s ease-out" }}
            >
              {ENTRY_PATHS.map((path) => {
                const Icon = path.icon;
                return (
                  <a key={path.id} href={path.href} onClick={() => trackEvent("entry_path_selected", { path: path.id })}
                    className="group card-tilt rounded-2xl border border-border bg-card/60 backdrop-blur p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br ${path.color} text-white shadow-glow`}>
                      <Icon size={15} />
                    </div>
                    <div className="mt-2 sm:mt-3 font-display font-semibold text-xs sm:text-sm text-foreground leading-tight">{path.title}</div>
                    <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">{path.promise}</p>
                    <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-primary">
                      {path.cta}
                      <ArrowUpRight size={11} className="arrow-hover transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator — hidden on mobile via CSS .scroll-indicator class */}
        <div ref={scrollIndicatorRef} className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/50 text-xs uppercase tracking-[0.2em] animate-bounce">
          Scroll ↓
        </div>
      </div>
    </section>
  );
}
