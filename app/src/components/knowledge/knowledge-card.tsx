import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, Lock, PlayCircle, CheckCircle2 } from "lucide-react";

export interface KnowledgeCardData {
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
  chapter_count?: number;
  hasAccess?: boolean;
  progress_pct?: number;
  completed?: boolean;
}

function formatPrice(cents: number, currency: string) {
  const v = cents / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: currency.toUpperCase() });
}

export function KnowledgeCard({ item }: { item: KnowledgeCardData }) {
  const locked = !item.hasAccess && item.access_type !== "free";
  const done = item.completed;
  const inProgress = !done && (item.progress_pct ?? 0) > 0;

  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug: item.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl"
    >
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
            <BookOpen className="h-12 w-12 text-primary/60" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            {item.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-2.5 py-1 text-[10px] font-semibold">
              <CheckCircle2 size={12} /> Concluído
            </span>
          ) : locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-foreground">
              <Lock size={12} /> Bloqueado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground px-2.5 py-1 text-[10px] font-semibold">
              <PlayCircle size={12} /> Liberado
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 gap-3">
        <h3 className="font-display font-medium text-lg leading-tight text-foreground line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-auto pt-2">
          {item.estimated_minutes > 0 && (
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {item.estimated_minutes} min</span>
          )}
          {item.chapter_count !== undefined && item.chapter_count > 0 && (
            <span className="inline-flex items-center gap-1"><BookOpen size={12} /> {item.chapter_count} cap.</span>
          )}
          <span className="uppercase tracking-wider">{item.difficulty}</span>
        </div>

        {inProgress && (
          <div className="mt-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, item.progress_pct ?? 0)}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {Math.round(item.progress_pct ?? 0)}% lido
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {item.access_type === "free"
              ? "Grátis"
              : locked
                ? formatPrice(item.price_cents, item.currency)
                : done
                  ? "Reler"
                  : inProgress
                    ? "Continuar"
                    : "Ler agora"}
          </span>
          <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            {locked ? "Desbloquear →" : "Abrir →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
