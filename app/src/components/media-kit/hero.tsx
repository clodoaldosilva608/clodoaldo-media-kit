import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import portrait from "@/assets/clodoaldo-hero.png.asset.json";

const LINES = ["Transformando", "conhecimento", "em patrimônio."];

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
    <section id="inicio" className="relative pt-28 sm:pt-32 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className="eyebrow">MEDIA KIT 2026 / 2027</span>
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

            <div className="mt-9 grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10 items-start">
              <div>
                <div className="font-display text-xl text-foreground">Clodoaldo Silva</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Influenciador Digital
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Lifestyle · Business · Vision
                </div>
              </div>
              <p className="max-w-md text-base text-muted-foreground leading-relaxed sm:border-l sm:border-border sm:pl-8">
                Conectando marcas a uma audiência engajada em negócios, IA,
                produtividade e liberdade financeira — com narrativa própria e
                execução consistente.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#contato"
                className="group inline-flex items-center gap-3 rounded-full border border-primary/60 px-7 py-3.5 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                Propor uma parceria
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              <a
                href="#metricas"
                className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver métricas
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5" ref={imageWrap}>
            <figure className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card">
                <img
                  src={portrait.url}
                  alt="Clodoaldo Silva — Influenciador Digital"
                  className="absolute inset-0 h-[112%] w-full object-cover object-right will-change-transform"
                  style={{ transform: `translate3d(0, ${shift}px, 0)` }}
                  width={1083}
                  height={1453}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 50% 20%, transparent 40%, oklch(0.12 0.004 60 / 0.55) 100%)",
                  }}
                />
              </div>
              <figcaption className="mt-3 flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Retrato oficial</span>
                <span>São Paulo · BR</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
