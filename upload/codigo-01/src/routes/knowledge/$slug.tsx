import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { ArrowRight, BookOpen, Clock, Lock, PlayCircle } from "lucide-react";
import { getKnowledgeItemPublic, getKnowledgeItemForUser } from "@/lib/knowledge.functions";
import { PaywallCard } from "@/components/knowledge/paywall-card";
import { ChapterSidebar } from "@/components/knowledge/chapter-sidebar";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { useAuth } from "@/hooks/use-auth";

const SITE_URL = "https://clodoaldo-silva.lovable.app";

export const Route = createFileRoute("/knowledge/$slug")({
  validateSearch: (s: Record<string, unknown>) =>
    z
      .object({
        status: z.enum(["success", "cancel"]).optional(),
        entitlement: z.string().uuid().optional(),
        buy: z.union([z.literal("1"), z.literal("true")]).optional(),
      })
      .parse(s),
  head: ({ params }) => {
    const url = `${SITE_URL}/knowledge/${params.slug}`;
    return {
      meta: [
        { title: `Knowledge Hub | ${params.slug}` },
        { name: "description", content: "E-book interativo com capítulos, checklists e prompts práticos." },
        { property: "og:title", content: `Knowledge Hub | Clodoaldo Silva` },
        { property: "og:description", content: "E-book interativo do Knowledge Hub." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: KnowledgeItemPage,
});

function KnowledgeItemPage() {
  const { slug } = useParams({ from: "/knowledge/$slug" });
  const { status, entitlement, buy } = Route.useSearch();
  const { session, loading: authLoading } = useAuth();

  const fetchPublic = useServerFn(getKnowledgeItemPublic);
  const fetchAuthed = useServerFn(getKnowledgeItemForUser);

  const publicQuery = useQuery(
    queryOptions({
      queryKey: ["knowledge", "item", "public", slug],
      queryFn: () => fetchPublic({ data: { slug } }),
    }),
  );

  const authedQuery = useQuery({
    queryKey: ["knowledge", "item", "user", slug],
    queryFn: () => fetchAuthed({ data: { slug } }),
    enabled: !!session,
  });

  const data = authedQuery.data ?? publicQuery.data;

  const isSyncingPayment = useMemo(
    () => status === "success" && Boolean(entitlement) && !data?.hasAccess,
    [entitlement, data?.hasAccess, status],
  );

  useEffect(() => {
    if (status !== "success" || !entitlement || data?.hasAccess) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      void authedQuery.refetch();
      if (attempts >= 10) window.clearInterval(timer);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [entitlement, authedQuery, data?.hasAccess, status]);

  // If ?buy=1 and user is authenticated, trigger checkout automatically once.
  const buyTriggered = useRef(false);
  useEffect(() => {
    if (buyTriggered.current) return;
    if (!buy || authLoading) return;
    if (!session) return;
    if (!data || data.hasAccess) return;
    if (data.item.access_type === "free") return;
    buyTriggered.current = true;
    // Fire checkout via PaywallCard by clicking a hidden trigger; simpler: dispatch a custom event
    window.dispatchEvent(new CustomEvent("knowledge:auto-buy"));
  }, [buy, authLoading, session, data]);

  if (publicQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-16">
          <div className="h-64 rounded-2xl border border-border bg-card/40 animate-pulse" />
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-16 text-center">
          <p className="text-muted-foreground">Conteúdo não encontrado.</p>
          <Link to="/knowledge" className="text-primary underline mt-4 inline-block">Voltar à biblioteca</Link>
        </div>
      </div>
    );
  }

  const { item, chapters, hasAccess } = data;
  const firstOpenable = chapters.find((c) => hasAccess || c.is_preview);
  const price = (item.price_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: item.currency.toUpperCase(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-4 text-sm">
            <Link to="/knowledge" className="text-muted-foreground hover:text-foreground">← Biblioteca</Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="rounded-2xl overflow-hidden border border-border aspect-[16/9] bg-muted">
                {item.cover_url ? (
                  <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                    <BookOpen className="h-16 w-16 text-primary/60" />
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-primary/15 text-primary px-3 py-1 font-semibold uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="rounded-full bg-card/60 border border-border px-3 py-1 uppercase tracking-wider text-muted-foreground">
                  {item.difficulty}
                </span>
                {item.estimated_minutes > 0 && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock size={12} />{item.estimated_minutes} min</span>
                )}
                <span className="inline-flex items-center gap-1 text-muted-foreground"><BookOpen size={12} />{chapters.length} capítulos</span>
              </div>

              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                {item.title}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-3xl">
                {item.description}
              </p>

              {status === "success" && (
                <div className={`mt-6 rounded-2xl border p-4 text-sm ${hasAccess ? "border-success/40 bg-success/10 text-success" : "border-primary/40 bg-primary/10 text-primary"}`}>
                  {hasAccess
                    ? "Pagamento confirmado. Seu acesso ao conteúdo foi liberado."
                    : "Pagamento recebido. Estamos sincronizando a liberação do acesso; esta página será atualizada automaticamente."}
                </div>
              )}
              {isSyncingPayment && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Se a liberação demorar mais que alguns segundos, atualize a página para checar novamente.
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {hasAccess ? (
                  firstOpenable && (
                    <Link
                      to="/knowledge/$slug/$chapter"
                      params={{ slug: item.slug, chapter: firstOpenable.slug }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      <PlayCircle size={16} /> Começar a ler
                      <ArrowRight size={16} />
                    </Link>
                  )
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-display font-bold text-foreground">{price}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Acesso vitalício</span>
                  </div>
                )}
              </div>

              {!hasAccess && item.access_type !== "free" && (
                <div className="mt-10">
                  <PaywallCard
                    knowledgeSlug={item.slug}
                    title={item.title}
                    priceCents={item.price_cents}
                    currency={item.currency}
                    autoTrigger={Boolean(buy) && !!session}
                  />
                </div>
              )}

              {item.access_type === "free" && !session && (
                <div className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground">Este e-book é gratuito. Aproveite a leitura — e, se quiser, deixe seu e-mail para receber novos conteúdos.</p>
                  <Link
                    to="/auth"
                    search={{ redirect: `/knowledge/${item.slug}` }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/50 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition"
                  >
                    Quero receber novidades <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              <div className="mt-12">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Prévia dos capítulos</h2>
                <ol className="space-y-2">
                  {chapters.map((c) => {
                    const isOpen = hasAccess || c.is_preview;
                    return (
                      <li key={c.id} className="rounded-xl border border-border bg-card/40 p-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Capítulo {c.order_index + 1}</div>
                          <h3 className="mt-1 font-semibold text-foreground">{c.title}</h3>
                          {c.preview_excerpt && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.preview_excerpt}</p>
                          )}
                        </div>
                        {isOpen ? (
                          <Link
                            to="/knowledge/$slug/$chapter"
                            params={{ slug: item.slug, chapter: c.slug }}
                            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-3 py-1.5 text-xs font-semibold"
                          >
                            Ler <ArrowRight size={12} />
                          </Link>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                            <Lock size={12} /> Bloqueado
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div>
              <ChapterSidebar
                knowledgeSlug={item.slug}
                chapters={chapters.map((c) => ({
                  id: c.id,
                  slug: c.slug,
                  title: c.title,
                  order_index: c.order_index,
                  is_preview: c.is_preview,
                }))}
                progressMap={Object.fromEntries(
                  chapters.map((c) => {
                    const prog = c as { progress_pct?: number; completed?: boolean };
                    return [c.id, { pct: prog.progress_pct ?? 0, completed: prog.completed ?? false }];
                  }),
                )}
                hasAccess={hasAccess}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
