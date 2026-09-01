import { useEffect, useState } from "react";
import { ExternalLink, X, Heart, Play, Info, ImageIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { AppItem } from "@/lib/apps-catalog";
import { MONETIZATION_LABEL, STATUS_LABEL } from "@/lib/apps-catalog";

interface AppPreviewModalProps {
  app: AppItem | null;
  onClose: () => void;
}

type TabId = "galeria" | "demo" | "tour";

export function AppPreviewModal({ app, onClose }: AppPreviewModalProps) {
  const [tab, setTab] = useState<TabId>("galeria");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!app) return;
    setTab("galeria");
    setIframeLoaded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [app, onClose]);

  if (!app) return null;

  const tourPoints = buildTourPoints(app.description, app.tagline);
  const gallery: Array<{ url: string; label: string; premium?: boolean }> = [
    ...(app.premiumCoverUrl
      ? [{ url: app.premiumCoverUrl, label: "Capa premium", premium: true }]
      : []),
    { url: app.coverUrl, label: "Preview do app" },
  ];
  const headerCover = app.premiumCoverUrl ?? app.coverUrl;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Prévia do app ${app.name}`}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-glow flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar prévia"
          className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-background/70 border border-border flex items-center justify-center hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} />
        </button>

        {/* Header w/ cover */}
        <div className={`relative aspect-[16/8] sm:aspect-[16/6] overflow-hidden bg-gradient-to-br ${app.gradient}`}>
          <img
            src={headerCover}
            alt={`Capa do app ${app.name}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                {app.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground bg-background/60 border border-border px-2 py-0.5 rounded-full">
                {STATUS_LABEL[app.status]}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground bg-background/60 border border-border px-2 py-0.5 rounded-full">
                {MONETIZATION_LABEL[app.monetization]}
              </span>
            </div>
            <h2 className="mt-1.5 font-display font-black text-2xl sm:text-4xl leading-tight">
              {app.name}
            </h2>
            <p className="text-sm sm:text-base text-primary font-semibold">{app.tagline}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card/70 backdrop-blur px-2 sm:px-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <TabButton active={tab === "galeria"} onClick={() => setTab("galeria")} icon={<ImageIcon size={14} />}>
              Galeria
            </TabButton>
            <TabButton active={tab === "demo"} onClick={() => setTab("demo")} icon={<Play size={14} />}>
              Demo ao vivo
            </TabButton>
            <TabButton active={tab === "tour"} onClick={() => setTab("tour")} icon={<Info size={14} />}>
              Tour
            </TabButton>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {tab === "galeria" && (
            <div className="space-y-4">
              {gallery.map((g, i) => (
                <div key={i} className="space-y-2">
                  <div className={`relative aspect-[16/10] overflow-hidden rounded-2xl border ${g.premium ? "border-primary/60 shadow-glow" : "border-border"} bg-gradient-to-br ${app.gradient}`}>
                    <img
                      src={g.url}
                      alt={`${g.label} de ${app.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {g.premium && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-orange px-2.5 py-1 rounded-full shadow-glow">
                        Capa Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
            </div>
          )}

          {tab === "demo" && (
            <div>
              <div className="relative rounded-2xl border border-border bg-background/60 overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src={app.demoUrl}
                    title={`Demo interativa de ${app.name}`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    referrerPolicy="no-referrer"
                    onLoad={() => setIframeLoaded(true)}
                    className="h-full w-full"
                  />
                </div>
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-sm text-muted-foreground animate-pulse">Carregando demo…</div>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Algumas plataformas bloqueiam a exibição em iframe. Se a demo não carregar,{" "}
                <a
                  href={app.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  abra em uma nova aba
                </a>
                .
              </p>
            </div>
          )}

          {tab === "tour" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
              <ol className="space-y-3">
                {tourPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 rounded-2xl border border-border bg-background/40 p-4"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">{point}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border bg-card/70 backdrop-blur p-4 sm:p-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Preço sugerido: <span className="font-semibold text-foreground">{app.priceLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={app.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-5 py-3 min-h-11 text-sm font-semibold hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Acessar app <ExternalLink size={14} />
            </a>
            <Link
              to="/apoiar/$app"
              params={{ app: app.slug }}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Heart size={14} /> Apoiar projeto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function buildTourPoints(description: string, tagline: string): string[] {
  // Deriva 3 bullets curtos a partir da descrição.
  const sentences = description
    .split(/\.\s+|[,;]\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 6);
  const pts = sentences.slice(0, 3);
  while (pts.length < 3) pts.push(tagline);
  return pts.map((p) => (p.endsWith(".") ? p : p + "."));
}
