"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppItem } from "@/lib/apps-catalog";
import { APPS } from "@/lib/apps-catalog";
import { AppPreviewModal } from "./app-preview-modal";

interface AppsCarouselProps {
  apps?: AppItem[];
  title?: string;
  subtitle?: string;
}

export function AppsCarousel({ apps, title = "Destaques do Ecossistema", subtitle }: AppsCarouselProps) {
  const list = apps ?? [
    ...APPS.filter((a) => a.premiumCoverUrl),
    ...APPS.filter((a) => !a.premiumCoverUrl && a.featured),
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selected, setSelected] = useState<AppItem | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-4xl leading-tight">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Slide anterior"
              className="h-11 w-11 rounded-full border border-border bg-card/70 hover:border-primary/60 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Próximo slide"
              className="h-11 w-11 rounded-full border border-border bg-card/70 hover:border-primary/60 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6">
            {list.map((app) => {
              const cover = app.premiumCoverUrl ?? app.coverUrl;
              return (
                <button
                  key={app.slug}
                  type="button"
                  onClick={() => setSelected(app)}
                  className="group relative shrink-0 basis-[85%] sm:basis-[48%] lg:basis-[32%] rounded-3xl overflow-hidden border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                  aria-label={`Abrir prévia de ${app.name}`}
                >
                  <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${app.gradient}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={`Capa de ${app.name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    {app.premiumCoverUrl && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-orange px-2.5 py-1 rounded-full shadow-glow">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {app.category}
                    </div>
                    <div className="mt-1 font-display font-black text-lg sm:text-xl">{app.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{app.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          {list.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-1.5 rounded-full transition-all ${
                i === selectedIdx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <AppPreviewModal app={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
