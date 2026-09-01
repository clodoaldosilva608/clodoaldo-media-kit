import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getChapter, getChapterPublic } from "@/lib/knowledge.functions";
import { KnowledgeReader } from "@/components/knowledge/knowledge-reader";
import { PaywallCard } from "@/components/knowledge/paywall-card";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/knowledge/$slug/$chapter")({
  head: () => ({ meta: [{ title: "Leitor | Knowledge Hub" }, { name: "robots", content: "noindex" }] }),
  component: ChapterPage,
});

function ChapterPage() {
  const { slug, chapter } = useParams({ from: "/knowledge/$slug/$chapter" });
  const { session } = useAuth();
  const fetchPublic = useServerFn(getChapterPublic);
  const fetchAuthed = useServerFn(getChapter);

  const publicQuery = useQuery(
    queryOptions({
      queryKey: ["knowledge", "chapter", "public", slug, chapter],
      queryFn: () => fetchPublic({ data: { knowledgeSlug: slug, chapterSlug: chapter } }),
    }),
  );
  const authedQuery = useQuery({
    queryKey: ["knowledge", "chapter", "user", slug, chapter],
    queryFn: () => fetchAuthed({ data: { knowledgeSlug: slug, chapterSlug: chapter } }),
    enabled: !!session,
  });

  const data = authedQuery.data ?? publicQuery.data;

  if (publicQuery.isLoading && !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pt-32">
          <div className="h-8 w-1/2 rounded bg-card/40 animate-pulse" />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-card/40 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-4xl px-6 pt-32 pb-16 text-center">
          <p className="text-muted-foreground">Capítulo não encontrado.</p>
          <Link to="/knowledge" className="text-primary underline mt-4 inline-block">Voltar</Link>
        </div>
      </div>
    );
  }

  if (!data.hasAccess && data.item.access_type !== "free" && (data.item.price_cents ?? 0) !== 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-28 pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <PaywallCard
              knowledgeSlug={data.item.slug}
              title={data.item.title}
              priceCents={data.item.price_cents ?? 0}
              currency={data.item.currency ?? "brl"}
            />
            <div className="mt-6 text-center">
              <Link to="/knowledge/$slug" params={{ slug: data.item.slug }} className="text-sm text-primary underline">
                Ver detalhes do conteúdo
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authed data includes progress/notes/favorites; public data has empty defaults.
  const authed = data as Partial<{
    allChapters: Array<{ id: string; slug: string; title: string; order_index: number; is_preview: boolean }>;
    favorite: boolean;
    checklist: Record<string, boolean>;
    notes: Array<{ id: string; content: string; anchor: string | null; updated_at: string }>;
    progress: { progress_pct: number; last_position: number; completed: boolean } | null;
  }>;


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 pt-24">
        <KnowledgeReader
          knowledge={data.item}
          chapter={{
            id: data.chapter.id,
            slug: data.chapter.slug,
            title: data.chapter.title,
            order_index: data.chapter.order_index,
            is_preview: data.chapter.is_preview,
            content_md: data.chapter.content_md ?? "",
          }}
          allChapters={authed.allChapters ?? []}
          initialFavorite={authed.favorite ?? false}
          initialChecklist={authed.checklist ?? {}}
          notes={authed.notes ?? []}
          initialProgress={authed.progress ?? null}
        />
      </main>
      <Footer />
    </div>
  );
}
