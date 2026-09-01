import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Lock } from "lucide-react";

interface Chapter {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  is_preview: boolean;
}

interface Props {
  knowledgeSlug: string;
  chapters: Chapter[];
  currentSlug?: string;
  progressMap?: Record<string, { pct: number; completed: boolean }>;
  hasAccess: boolean;
}

export function ChapterSidebar({ knowledgeSlug, chapters, currentSlug, progressMap = {}, hasAccess }: Props) {
  return (
    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sumário</h3>
        <ol className="space-y-1">
          {chapters.map((c) => {
            const active = currentSlug === c.slug;
            const p = progressMap[c.id];
            const locked = !hasAccess && !c.is_preview;
            return (
              <li key={c.id}>
                <Link
                  to="/knowledge/$slug/$chapter"
                  params={{ slug: knowledgeSlug, chapter: c.slug }}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {locked ? (
                      <Lock size={14} />
                    ) : p?.completed ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <Circle size={14} className={p && p.pct > 0 ? "text-primary" : ""} />
                    )}
                  </span>
                  <span className="flex-1 leading-snug">
                    <span className="block">{c.title}</span>
                    {c.is_preview && !hasAccess && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Prévia</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
