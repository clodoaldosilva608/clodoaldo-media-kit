"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES, type Service } from "@/lib/services-catalog";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

const PREVIEW_ITEMS: Service[] = [
  SERVICES["ebook-guia-briefing-viral"],
  SERVICES["ebook-storytelling-magnetico"],
  SERVICES["ebook-ia-criadores"],
  SERVICES["pack-imagens-premium"],
].filter(Boolean);

export function LibraryPreview() {
  return (
    <section id="biblioteca" className="py-16 sm:py-20 md:py-28 bg-card/20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="04"
          eyebrow="Biblioteca Digital"
          title="E-books, packs e recursos para creators e negócios"
          subtitle="Materiais gratuitos para começar e produtos digitais premium para acelerar posicionamento, conteúdo e conversão."
        />

        <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {PREVIEW_ITEMS.map((item) => (
            <PreviewCard key={item.slug} item={item} />
          ))}
        </div>

        <div className="mt-8 sm:mt-10 flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/biblioteca"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 sm:px-7 py-3 sm:py-3.5 min-h-11 text-xs sm:text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Explorar Biblioteca
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ item }: { item: Service }) {
  const ref = useReveal<HTMLDivElement>();
  const isFree = item.priceCents === 0;
  return (
    <article
      ref={ref}
      className="reveal overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur shadow-card flex flex-col"
    >
      <div className="aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.cover}
          alt={`Capa do produto digital ${item.shortName}`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      </div>
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
          {item.tag}
        </div>
        <h3 className="mt-1.5 sm:mt-2 font-display text-sm sm:text-lg font-black leading-tight">{item.shortName}</h3>
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 sm:line-clamp-none">
          {item.description}
        </p>
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
          <div className={`font-display text-base sm:text-xl font-extrabold ${isFree ? "text-success" : "text-gradient-orange"} break-words`}>
            {item.priceLabel}
          </div>
          <Link
            href="/biblioteca"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-9 sm:min-h-10 text-[11px] sm:text-xs font-semibold text-primary"
          >
            Ver <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
