import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { KnowledgeGrid } from "@/components/knowledge/knowledge-grid";
import { listPublishedKnowledgeItems } from "@/lib/knowledge";

export const metadata: Metadata = {
  title: "Knowledge Hub | E-books e materiais premium",
  description:
    "Biblioteca premium de e-books interativos, prompts e templates para creators e marcas.",
  alternates: { canonical: "https://clodoaldo-silva.lovable.app/knowledge" },
  openGraph: {
    title: "Knowledge Hub | Clodoaldo Silva",
    description: "E-books interativos, checklists e prompts para acelerar seus resultados.",
    url: "https://clodoaldo-silva.lovable.app/knowledge",
  },
};

// Force dynamic rendering so the page reflects DB changes during dev.
export const dynamic = "force-dynamic";

export default async function KnowledgeHubPage() {
  const items = await listPublishedKnowledgeItems();

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

          {items.length === 0 ? (
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
