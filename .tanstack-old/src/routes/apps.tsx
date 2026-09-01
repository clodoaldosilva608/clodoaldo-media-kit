import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search, ExternalLink, Heart } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { AppPreviewModal } from "@/components/apps/app-preview-modal";
import { AppsCarousel } from "@/components/apps/apps-carousel";
import {
  APPS,
  APP_CATEGORIES,
  STATUS_LABEL,
  MONETIZATION_LABEL,
  type AppItem,
  type AppCategory,
} from "@/lib/apps-catalog";

const SITE_URL = "https://clodoaldo-silva.lovable.app";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "Ecossistema de Apps | Clodoaldo Silva" },
      {
        name: "description",
        content:
          "Portfólio completo de ~50 aplicativos criados por Clodoaldo Silva — autoconhecimento, IA, educação, produtividade, saúde, finanças e mais. Explore e apoie.",
      },
      { property: "og:title", content: "Ecossistema de Apps | Clodoaldo Silva" },
      {
        property: "og:description",
        content:
          "Empreendedor Tech e criador de produtos. Explore o ecossistema de apps e torne-se um Criador Parceiro.",
      },
      { property: "og:url", content: `${SITE_URL}/apps` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/apps` }],
  }),
  component: AppsPage,
});

function AppsPage() {
  const [category, setCategory] = useState<AppCategory | "todos">("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AppItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPS.filter((a) => {
      const catOk = category === "todos" || a.category === category;
      const qOk =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Empreendedor Tech
          </div>
          <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl leading-tight">
            Ecossistema de {APPS.length} aplicativos
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            De autoconhecimento a saúde, de educação infantil a concursos. Cada app resolve uma dor
            real — explore, teste a demo interativa e apoie o desenvolvimento dos que estão por vir.
          </p>
        </div>

        <AppsCarousel
          title="Destaques em vitrine"
          subtitle="Passe pelas capas premium e clique para ver a prévia interativa."
        />


        <div className="mt-10 rounded-3xl border border-border bg-card/50 p-4 sm:p-6">
          <label htmlFor="apps-search" className="sr-only">
            Buscar apps
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3">
            <Search size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              id="apps-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, dor ou nicho..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div id="categorias" className="mt-4 flex flex-wrap gap-2">
            <CategoryChip active={category === "todos"} onClick={() => setCategory("todos")}>
              Todos ({APPS.length})
            </CategoryChip>
            {APP_CATEGORIES.map((cat) => {
              const count = APPS.filter((a) => a.category === cat).length;
              if (count === 0) return null;
              return (
                <CategoryChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                  {cat} ({count})
                </CategoryChip>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((app) => (
            <AppCard key={app.slug} app={app} onOpen={() => setSelected(app)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-border bg-card/50 p-10 text-center text-muted-foreground">
            Nenhum app encontrado. Ajuste os filtros ou a busca.
          </div>
        )}
      </main>
      <Footer />

      <AppPreviewModal app={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AppCard({ app, onOpen }: { app: AppItem; onOpen: () => void }) {
  return (
    <article
      id={app.slug}
      className="scroll-mt-28 group overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur shadow-card flex flex-col hover:border-primary/50 transition"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver prévia do app ${app.name}`}
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${app.gradient} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <img
          src={app.coverUrl}
          alt={`Capa de ${app.name}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-foreground bg-background/70 border border-border px-2 py-0.5 rounded-full">
          {STATUS_LABEL[app.status]}
        </span>
      </button>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {app.category}
        </div>
        <h2 className="mt-1 font-display text-lg font-black leading-tight">{app.name}</h2>
        <p className="text-xs text-primary font-semibold">{app.tagline}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
          {app.description}
        </p>
        <div className="mt-3 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{MONETIZATION_LABEL[app.monetization]}</span>
          {" · "}
          {app.priceLabel}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2.5 min-h-10 text-xs font-semibold text-primary"
          >
            Ver prévia
          </button>
          <a
            href={app.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${app.name} em nova aba`}
            className="inline-flex items-center justify-center rounded-full border border-border px-3 py-2.5 min-h-10 text-xs font-semibold hover:border-primary/50"
          >
            <ExternalLink size={12} />
          </a>
          <Link
            to="/apoiar/$app"
            params={{ app: app.slug }}
            aria-label={`Apoiar ${app.name}`}
            className="inline-flex items-center justify-center rounded-full bg-gradient-orange px-3 py-2.5 min-h-10 text-xs font-semibold text-primary-foreground"
          >
            <Heart size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full border px-4 py-2 min-h-10 text-xs font-semibold transition ${
        active
          ? "bg-gradient-orange text-primary-foreground border-transparent shadow-glow"
          : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// Silence unused import warning when ArrowRight isn't rendered (kept for future).
void ArrowRight;
