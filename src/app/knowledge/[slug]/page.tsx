import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, BookOpen, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { getSupabaseServer } from "@/lib/supabase-server";
import { SERVICES } from "@/lib/services-catalog";

export const dynamic = "force-dynamic";

interface KnowledgeItem {
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  category: string;
  type: string;
  access_type: string;
  price_cents: number;
  currency: string;
  estimated_minutes: number;
  difficulty: string;
  status: string;
  kiwify_checkout_url: string | null;
}

async function getKnowledgeItem(slug: string): Promise<KnowledgeItem | null> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("knowledge_items")
      .select("slug, title, description, cover_url, category, type, access_type, price_cents, currency, estimated_minutes, difficulty, status, kiwify_checkout_url")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;
    return data as KnowledgeItem;
  } catch (e) {
    console.error("[knowledge/[slug]] error:", e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getKnowledgeItem(slug);
  if (!item) {
    return { title: "Conteúdo não encontrado | Clodoaldo Silva" };
  }
  return {
    title: `${item.title} | Knowledge Hub`,
    description: item.description,
    alternates: { canonical: `https://clodoaldo.vercel.app/knowledge/${slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url: `https://clodoaldo.vercel.app/knowledge/${slug}`,
      type: "article",
      images: item.cover_url ? [item.cover_url] : undefined,
    },
  };
}

export default async function KnowledgeItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getKnowledgeItem(slug);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Conteúdo não encontrado</h1>
            <p className="text-muted-foreground mb-6">Este material não está disponível ou foi removido.</p>
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground"
            >
              Ver biblioteca completa <ArrowRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFree = item.access_type === "free" || item.price_cents === 0;
  const service = SERVICES[slug as keyof typeof SERVICES];
  const checkoutUrl = item.kiwify_checkout_url || (service ? `/checkout/${slug}` : null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowRight size={14} className="rotate-180" /> Voltar para Knowledge Hub
            </Link>
          </div>

          {/* Hero */}
          <div className="grid gap-8 md:grid-cols-2 items-start">
            {/* Cover */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card">
              {item.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                  <BookOpen className="h-12 w-12 text-primary/60" />
                </div>
              )}
              <span
                className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isFree
                    ? "bg-success/20 text-success border border-success/40"
                    : "bg-gradient-orange text-primary-foreground"
                }`}
              >
                {isFree ? "Gratuito" : `R$ ${(item.price_cents / 100).toFixed(2).replace(".", ",")}`}
              </span>
              {!isFree && (
                <span className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 border border-border text-foreground">
                  <Lock size={12} aria-hidden="true" />
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
                {item.category}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3">
                {item.title}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
                {item.estimated_minutes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} /> {item.estimated_minutes} min de leitura
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={14} /> {item.type}
                </span>
                <span className="uppercase tracking-wider">{item.difficulty}</span>
              </div>

              {/* CTA */}
              {isFree ? (
                <div className="space-y-3">
                  {service?.pdfUrl && (
                    <a
                      href={service.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow w-full justify-center"
                    >
                      <PlayCircle size={16} /> Baixar gratuitamente
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Acesso livre — sem necessidade de cadastro.
                  </p>
                </div>
              ) : checkoutUrl ? (
                <div className="space-y-3">
                  <a
                    href={checkoutUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow w-full justify-center"
                  >
                    {item.kiwify_checkout_url ? "Comprar agora" : "Ir para checkout"}
                    <ArrowRight size={16} />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Pagamento seguro via Kiwify. Entrega automática após confirmação.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card/60 p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock size={16} /> Conteúdo premium — faça login para acessar
                  </div>
                  <Link
                    href={`/auth?redirect=/knowledge/${slug}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 min-h-10 text-xs font-semibold text-primary"
                  >
                    Entrar / Criar conta <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* Features */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 size={14} className="text-primary" /> Conteúdo 100% original em PT-BR
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 size={14} className="text-primary" /> Ilustrações e frameworks práticos
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 size={14} className="text-primary" /> Acesso vitalício após compra
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
