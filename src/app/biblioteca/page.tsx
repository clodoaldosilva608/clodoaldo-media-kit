import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { FREE_EBOOKS, PAID_EBOOKS, type Service, type ServiceSlug } from "@/lib/services-catalog";
import { BibliotecaClient } from "./biblioteca-client";

export const metadata: Metadata = {
  title: "Biblioteca Digital | Clodoaldo Silva",
  description:
    "Biblioteca Digital com e-books estratégicos, materiais gratuitos e produtos de entrada para creators, marcas e negócios digitais.",
  alternates: { canonical: "https://clodoaldo-silva.lovable.app/biblioteca" },
  openGraph: {
    title: "Biblioteca Digital | Clodoaldo Silva",
    description:
      "Acesse e-books gratuitos, manuais premium e materiais rápidos para posicionamento, conteúdo e conversão.",
    url: "https://clodoaldo-silva.lovable.app/biblioteca",
  },
};

// Slugs publicados no Knowledge Hub — o card vira link para o leitor de capítulos.
// E-books gratuitos NÃO estão aqui — usam BibliotecaClient (form + download direto).
const HUB_SLUGS = new Set<ServiceSlug>([
  "pack-imagens-premium",
]);

export default function BibliotecaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <div className="max-w-3xl">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Biblioteca Digital
          </div>
          <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl leading-tight">
            Materiais para capturar atenção, posicionar melhor e vender com mais clareza
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Aqui você encontra lead magnets, produtos digitais de entrada e materiais estratégicos para elevar sua presença e sua conversão.
          </p>
        </div>

        <SectionBlock
          eyebrow="E-book Gratuito"
          title="Comece pelo lead magnet"
          subtitle="Capture direção estratégica com um material rápido e prático para organizar melhor seus briefings e conteúdos."
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {FREE_EBOOKS.map((ebook) => (
              <EbookCard
                key={ebook.slug}
                item={ebook}
                action={
                  HUB_SLUGS.has(ebook.slug) ? (
                    <Link
                      href={`/knowledge/${ebook.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      Ler no Hub
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <BibliotecaClient item={ebook} />
                  )
                }
              />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Tripwire"
          title="Produtos digitais de entrada"
          subtitle="E-books pagos para transformar conhecimento em ação imediata com compra rápida e entrega digital."
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PAID_EBOOKS.map((ebook) => (
              <EbookCard
                key={ebook.slug}
                item={ebook}
                action={
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/checkout/${ebook.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      {ebook.ctaLabel}
                      <ArrowRight size={16} />
                    </Link>
                    {ebook.pdfUrl && (
                      <a
                        href={ebook.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 min-h-10 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        <BookOpen size={14} /> Ver preview
                      </a>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Bundles e bônus"
          title="Valor adicional nas compras principais"
          subtitle="Algumas soluções liberam bônus automáticos durante o checkout para aumentar percepção de valor e acelerar implementação."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-card">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Bônus do Vídeo Dedicado</div>
              <h3 className="mt-2 font-display text-2xl font-black">Como Escalar sua Marca com Tráfego Pago</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Material liberado como bônus automático para quem escolhe campanhas com mais foco em performance e expansão.
              </p>
            </div>
            <div className="rounded-3xl border border-primary/40 bg-primary/5 p-6 shadow-card">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Bônus do Combo Completo</div>
              <h3 className="mt-2 font-display text-2xl font-black">Estratégias Avançadas de Conteúdo para 2026</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Conteúdo premium liberado dentro do pedido para campanhas mais robustas e com visão de escala.
              </p>
            </div>
          </div>
        </SectionBlock>
      </main>
      <Footer />
    </div>
  );
}

function SectionBlock({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        <h2 className="mt-3 font-display text-2xl sm:text-4xl font-black">{title}</h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function EbookCard({ item, action }: { item: Service; action: React.ReactNode }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur shadow-card">
      <div className="aspect-[4/5] overflow-hidden bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.cover}
          alt={`Capa do e-book ${item.shortName}`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      </div>
      <div className="p-5 sm:p-6">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{item.tag}</div>
        <h3 className="mt-2 font-display text-xl font-black">{item.shortName}</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {item.bullets.map((bullet) => (
            <li key={bullet}>• {bullet}</li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="font-display text-2xl font-extrabold text-gradient-orange">{item.priceLabel}</div>
          {action}
        </div>
      </div>
    </article>
  );
}
