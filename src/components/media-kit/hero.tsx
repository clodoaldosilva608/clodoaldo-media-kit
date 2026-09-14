"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, Megaphone, Edit3, Code2, Handshake } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { IntroSequence } from "@/components/experience/intro-sequence";
import { WorldMapBackground } from "@/components/experience/world-map-background";

const LINES = ["Transformando", "conhecimento", "em patrimônio."];

const ENTRY_PATHS = [
  { id: "marca", icon: Megaphone, title: "Sou marca ou produto", promise: "Campanhas com narrativa, alcance e conversão.", cta: "Montar campanha", href: "/quiz?profile=marca", color: "from-[#FF7A00] to-[#B34A00]" },
  { id: "creator", icon: Edit3, title: "Sou creator ou negócio", promise: "Roteiro, edição, criativos e auditoria de conteúdo.", cta: "Melhorar meu conteúdo", href: "/quiz?profile=creator", color: "from-[#8b5cf6] to-[#4c1d95]" },
  { id: "empresa", icon: Code2, title: "Tenho ideia digital", promise: "MVP, aplicativo ou ferramenta sob medida.", cta: "Falar sobre meu projeto", href: "/quiz?profile=empresa", color: "from-[#0ea5a5] to-[#065f5f]" },
  { id: "parceria", icon: Handshake, title: "Quero uma parceria", promise: "Indicar, afiliar ou crescer junto comigo.", cta: "Ver parcerias", href: "/criadores-parceiros", color: "from-[#10b981] to-[#065f46]" },
] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [introDone, setIntroDone] = useState(false);

  // Check if intro should be skipped
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("cs-intro-seen");
    if (reduced || seen) setIntroDone(true);
  }, []);

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

        // SCROLL INDICATOR: fades immediately on scroll
        if (scrollIndicatorRef.current) {
          scrollIndicatorRef.current.style.opacity = String(Math.max(0, 1 - p * 5));
        }

        // BACKGROUND: stays pure black (like United Carriers)
        if (bgRef.current) {
          bgRef.current.style.backgroundColor = "#000000";
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
    <>
      {!introDone && <IntroSequence onComplete={() => setIntroDone(true)} />}
      <section
        ref={sectionRef}
        id="inicio"
        className="relative"
        style={{ height: "150vh", backgroundColor: "#000000", color: "#fff" }}
      >
        <div className="hero-sticky sticky top-0 h-screen overflow-hidden flex items-center">
          {/* Background — pure black */}
          <div ref={bgRef} className="absolute inset-0" style={{ backgroundColor: "#000000" }} />

          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

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

        {/* Text content — left-aligned, globo removido */}
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
              className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-2xl hero-text-reveal"
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

            {/* Microprova de autoridade — números reais (Passo 4 do brief de design) */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-muted-foreground hero-text-reveal" style={{ animationDelay: "1100ms" }}>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Desde 2016
              </span>
              <span className="text-border">·</span>
              <span><strong className="text-foreground">+75</strong> empresas atendidas</span>
              <span className="text-border">·</span>
              <span><strong className="text-foreground">9</strong> produtos digitais</span>
              <span className="text-border">·</span>
              <span><strong className="text-foreground">+8 anos</strong> de experiência</span>
            </div>
          </div>
        </div>
        <div ref={scrollIndicatorRef} className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/50 text-xs uppercase tracking-[0.2em] animate-bounce">
          Scroll ↓
        </div>
      </div>
    </section>
    </>
  );
}
