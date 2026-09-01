import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Heart, Search } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { ChapterSidebar } from "./chapter-sidebar";
import { NotesPanel } from "./notes-panel";
import { saveProgress, toggleChecklist, toggleFavorite } from "@/lib/knowledge.functions";

interface Chapter {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  is_preview: boolean;
  content_md: string;
}

interface Note {
  id: string;
  content: string;
  anchor: string | null;
  updated_at: string;
}

interface Props {
  knowledge: { id: string; slug: string; title: string };
  chapter: Chapter;
  allChapters: { id: string; slug: string; title: string; order_index: number; is_preview: boolean }[];
  initialFavorite: boolean;
  initialChecklist: Record<string, boolean>;
  notes: Note[];
  initialProgress: { progress_pct: number; last_position: number; completed: boolean } | null;
}

export function KnowledgeReader(props: Props) {
  const { knowledge, chapter, allChapters, initialChecklist, initialFavorite, notes, initialProgress } = props;
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [query, setQuery] = useState("");
  const [progressPct, setProgressPct] = useState(initialProgress?.progress_pct ?? 0);
  const readerRef = useRef<HTMLDivElement>(null);
  const saveFn = useServerFn(saveProgress);
  const toggleCheckFn = useServerFn(toggleChecklist);
  const toggleFavFn = useServerFn(toggleFavorite);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idx = allChapters.findIndex((c) => c.slug === chapter.slug);
  const prev = idx > 0 ? allChapters[idx - 1] : null;
  const next = idx >= 0 && idx < allChapters.length - 1 ? allChapters[idx + 1] : null;

  // Scroll tracking → progress
  useEffect(() => {
    function onScroll() {
      const el = readerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height;
      const scrolled = Math.min(Math.max(-rect.top + viewport, 0), total);
      const pct = Math.min(100, Math.round((scrolled / Math.max(total, 1)) * 100));
      setProgressPct((p) => (pct > p ? pct : p));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveFn({
          data: {
            knowledge_id: knowledge.id,
            chapter_id: chapter.id,
            progress_pct: pct,
            last_position: Math.round(window.scrollY),
            completed: pct >= 95,
          },
        });
      }, 1200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapter.id, knowledge.id, saveFn]);

  // Restore last position
  useEffect(() => {
    if (initialProgress?.last_position && initialProgress.last_position > 100) {
      window.scrollTo({ top: initialProgress.last_position, behavior: "auto" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  // Client-side search highlight
  const highlighted = useMemo(() => {
    if (!query.trim()) return chapter.content_md;
    const q = query.trim();
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return chapter.content_md.replace(new RegExp(safe, "gi"), (m) => `==${m}==`);
    // marks are handled by CSS on a wrapper if desired; we simply preserve the token
  }, [chapter.content_md, query]);

  async function onToggleCheck(key: string, checked: boolean) {
    setChecklist((p) => ({ ...p, [key]: checked }));
    try {
      await toggleCheckFn({ data: { chapter_id: chapter.id, item_key: key, checked } });
    } catch {
      setChecklist((p) => ({ ...p, [key]: !checked }));
    }
  }

  async function onFav() {
    const optimistic = !favorite;
    setFavorite(optimistic);
    try {
      const r = await toggleFavFn({ data: { knowledge_id: knowledge.id, chapter_id: chapter.id } });
      setFavorite(r.favorited);
    } catch {
      setFavorite(!optimistic);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* progress bar (top) */}
      <div className="fixed left-0 right-0 top-0 z-40 h-1 bg-transparent">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link to="/knowledge" className="text-muted-foreground hover:text-foreground">← Biblioteca</Link>
        <span className="text-muted-foreground">/</span>
        <Link to="/knowledge/$slug" params={{ slug: knowledge.slug }} className="text-muted-foreground hover:text-foreground">
          {knowledge.title}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <ChapterSidebar
          knowledgeSlug={knowledge.slug}
          chapters={allChapters}
          currentSlug={chapter.slug}
          hasAccess={true}
        />

        <div className="flex-1 min-w-0">
          <header className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Capítulo {chapter.order_index + 1}
              </div>
              <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                {chapter.title}
              </h1>
            </div>
            <button
              onClick={onFav}
              aria-label="Favoritar capítulo"
              className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition ${
                favorite ? "bg-red-500/15 text-red-500 border-red-500/40" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart size={16} fill={favorite ? "currentColor" : "none"} />
            </button>
          </header>

          <div className="mb-6 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar neste capítulo"
              className="w-full max-w-sm rounded-full border border-border bg-card/60 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <article ref={readerRef} className="reader-body">
            <MarkdownRenderer
              chapterSlug={chapter.slug}
              markdown={highlighted}
              checklist={checklist}
              onToggleChecklist={onToggleCheck}
            />
          </article>

          <nav className="mt-12 flex flex-col sm:flex-row gap-3 justify-between border-t border-border pt-6">
            {prev ? (
              <Link
                to="/knowledge/$slug/$chapter"
                params={{ slug: knowledge.slug, chapter: prev.slug }}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm hover:bg-card transition"
              >
                <ArrowLeft size={16} />
                <span className="text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Anterior</span>
                  <span className="block font-semibold">{prev.title}</span>
                </span>
              </Link>
            ) : <span />}
            {next ? (
              <Link
                to="/knowledge/$slug/$chapter"
                params={{ slug: knowledge.slug, chapter: next.slug }}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-orange px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                <span className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider opacity-80">Próximo</span>
                  <span className="block">{next.title}</span>
                </span>
                <ArrowRight size={16} />
              </Link>
            ) : <span />}
          </nav>

          <div className="mt-10">
            <NotesPanel knowledgeId={knowledge.id} chapterId={chapter.id} initialNotes={notes} />
          </div>
        </div>
      </div>
    </div>
  );
}
