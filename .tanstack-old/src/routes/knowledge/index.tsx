import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { listKnowledgeItems, listKnowledgeItemsForUser } from "@/lib/knowledge.functions";
import { KnowledgeGrid } from "@/components/knowledge/knowledge-grid";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { useAuth } from "@/hooks/use-auth";

const SITE_URL = "https://clodoaldo-silva.lovable.app";

export const Route = createFileRoute("/knowledge/")({
  head: () => ({
    meta: [
      { title: "Knowledge Hub | E-books e materiais premium" },
      {
        name: "description",
        content: "Biblioteca premium de e-books interativos, prompts e templates para creators e marcas.",
      },
      { property: "og:title", content: "Knowledge Hub | Clodoaldo Silva" },
      {
        property: "og:description",
        content: "E-books interativos, checklists e prompts para acelerar seus resultados.",
      },
      { property: "og:url", content: `${SITE_URL}/knowledge` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/knowledge` }],
  }),
  component: KnowledgeIndex,
});

function KnowledgeIndex() {
  const { session } = useAuth();
  const listPublic = useServerFn(listKnowledgeItems);
  const listAuthed = useServerFn(listKnowledgeItemsForUser);

  const publicQuery = useQuery(
    queryOptions({
      queryKey: ["knowledge", "list", "public"],
      queryFn: () => listPublic(),
    }),
  );

  const authedQuery = useQuery({
    queryKey: ["knowledge", "list", "user"],
    queryFn: () => listAuthed(),
    enabled: !!session,
  });

  const rawItems = authedQuery.data ?? publicQuery.data ?? [];
  const items = rawItems.map((i) => {
    const authed = i as Partial<{ chapter_count: number; hasAccess: boolean; progress_pct: number; completed: boolean }>;
    return {
      slug: i.slug,
      title: i.title,
      description: i.description,
      cover_url: i.cover_url,
      category: i.category,
      type: i.type,
      access_type: i.access_type,
      price_cents: i.price_cents,
      currency: i.currency,
      estimated_minutes: i.estimated_minutes,
      difficulty: i.difficulty,
      chapter_count: authed.chapter_count ?? 0,
      hasAccess: authed.hasAccess ?? i.access_type === "free",
      progress_pct: authed.progress_pct ?? 0,
      completed: authed.completed ?? false,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <BookOpen size={14} /> Knowledge Hub
            </div>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Biblioteca Premium
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              E-books interativos, cursos, templates e ferramentas para acelerar seu resultado. Continue de onde parou, marque capítulos e organize suas anotações.
            </p>
          </header>

          {publicQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl border border-border bg-card/40 animate-pulse" />
              ))}
            </div>
          ) : publicQuery.isError ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-6 text-sm text-red-500">
              Não foi possível carregar a biblioteca. Tente novamente.
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">Nenhum conteúdo publicado ainda. Volte em breve.</p>
            </div>
          ) : (
            <KnowledgeGrid items={items} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

