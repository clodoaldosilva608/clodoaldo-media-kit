import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Download, Instagram, Mail, Youtube } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { FREE_EBOOKS, PAID_EBOOKS, type Service, type ServiceSlug } from "@/lib/services-catalog";
import { createLead } from "@/lib/leads.functions";

const SITE_URL = "https://clodoaldo-silva.lovable.app";
const INSTAGRAM_URL = "https://www.instagram.com/clodoaldo_c_silva";
const YOUTUBE_URL = "https://youtube.com/@clodoaldosilvaa";

// Slugs publicados no Knowledge Hub — o card vira link para o leitor de capítulos.
const HUB_SLUGS = new Set<ServiceSlug>([
  "ebook-guia-briefing-viral",
  "ebook-networking-marcas",
  "ebook-30-ganchos-reels",
  "ebook-manual-edicao-premium",
  "ebook-storytelling-magnetico",
  "ebook-ia-criadores",
  "pack-prompts-premium",
  "pack-imagens-premium",
]);

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca Digital | Clodoaldo Silva" },
      {
        name: "description",
        content:
          "Biblioteca Digital com e-books estratégicos, materiais gratuitos e produtos de entrada para creators, marcas e negócios digitais.",
      },
      { property: "og:title", content: "Biblioteca Digital | Clodoaldo Silva" },
      {
        property: "og:description",
        content:
          "Acesse e-books gratuitos, manuais premium e materiais rápidos para posicionamento, conteúdo e conversão.",
      },
      { property: "og:url", content: `${SITE_URL}/biblioteca` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/biblioteca` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Biblioteca Digital Clodoaldo Silva",
          url: `${SITE_URL}/biblioteca`,
          hasPart: [...FREE_EBOOKS, ...PAID_EBOOKS].map((item) => ({
            "@type": "Product",
            name: item.shortName,
            image: `${SITE_URL}${item.cover}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "BRL",
              price: (item.priceCents / 100).toFixed(2),
              availability: "https://schema.org/InStock",
            },
          })),
        }),
      },
    ],
  }),
  component: BibliotecaPage,
});

function BibliotecaPage() {
  const saveLead = useServerFn(createLead);
  const [selectedFree, setSelectedFree] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const selectedLabel = useMemo(() => selectedFree?.shortName ?? "", [selectedFree]);

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFree) return;
    setStatus("saving");
    setError("");
    try {
      await saveLead({
        data: {
          name,
          email,
          ebook_slug: selectedFree.slug,
          source: "biblioteca",
          consent: true,
          instagram_follow_intent: true,
        },
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Não foi possível liberar o material.");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20">
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
                      to="/knowledge/$slug"
                      params={{ slug: ebook.slug }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      Ler no Hub
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFree(ebook);
                        setStatus("idle");
                        setError("");
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      {ebook.ctaLabel}
                      <ArrowRight size={16} />
                    </button>
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
                  HUB_SLUGS.has(ebook.slug) ? (
                    <div className="flex flex-col gap-2 items-end">
                      <Link
                        to="/knowledge/$slug"
                        params={{ slug: ebook.slug }}
                        search={{ buy: "1" }}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                      >
                        Comprar {ebook.priceLabel}
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/knowledge/$slug"
                        params={{ slug: ebook.slug }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Ver detalhes no Hub
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to="/checkout/$service"
                      params={{ service: ebook.slug }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      {ebook.ctaLabel}
                      <ArrowRight size={16} />
                    </Link>
                  )
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

      {selectedFree && (
        <div className="fixed inset-0 z-[70] bg-background/75 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Liberação do material</div>
                <h2 className="mt-2 font-display text-2xl font-black">{selectedLabel}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFree(null)}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold"
              >
                Fechar
              </button>
            </div>

            {status === "done" ? (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="mt-4 font-display text-xl font-black">Acesso liberado</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Baixe o PDF agora e siga as redes para receber mais materiais, dicas e bastidores.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {selectedFree.pdfUrl && (
                    <a
                      href={selectedFree.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      <Download size={16} /> Baixar PDF agora
                    </a>
                  )}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <Instagram size={16} /> Seguir no Instagram
                  </a>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#FF0000]/40 bg-[#FF0000]/10 px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <Youtube size={16} /> Seguir no YouTube
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedFree(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <BookOpen size={16} /> Continuar navegando
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-6 space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preencha seus dados para liberar este material e entrar no ecossistema de conteúdos do Clodoaldo Silva.
                </p>
                <div>
                  <label htmlFor="lead-name" className="block text-sm font-medium mb-1.5">
                    Nome
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="lead-email" className="block text-sm font-medium mb-1.5">
                    E-mail *
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm"
                    placeholder="voce@email.com"
                  />
                </div>
                <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/40 p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className="text-muted-foreground">
                    Concordo em receber o material e comunicações relacionadas à Biblioteca Digital.
                  </span>
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!consent || status === "saving"}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                  >
                    <Mail size={16} /> {status === "saving" ? "Liberando..." : "Liberar material"}
                  </button>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <Instagram size={16} /> Seguir no Instagram
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
