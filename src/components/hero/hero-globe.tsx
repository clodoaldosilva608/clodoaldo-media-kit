"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * HeroGlobe — wrapper do GlobeCanvas com:
 * - Star background CSS
 * - Halo radial (CSS blur layers)
 * - Labels HTML sobre o canvas (acessíveis)
 * - Detecção mobile
 */

interface LabelData {
  id: string;
  name: string;
  x: number;
  y: number;
  visible: boolean;
}

interface HeroGlobeProps {
  scrollProgress?: number;
}

export function HeroGlobe({ scrollProgress = 0 }: HeroGlobeProps) {
  const [GlobeCanvas, setGlobeCanvas] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [labels, setLabels] = useState<LabelData[]>([]);

  useEffect(() => {
    import("./globe-canvas").then((mod) => {
      setGlobeCanvas(() => mod.default);
    });

    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const onLabelsUpdate = useCallback((newLabels: LabelData[]) => {
    setLabels(newLabels);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Star background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(2px 2px at 15% 25%, white, transparent), " +
            "radial-gradient(1px 1px at 55% 65%, white, transparent), " +
            "radial-gradient(1.5px 1.5px at 75% 15%, white, transparent), " +
            "radial-gradient(1px 1px at 35% 75%, white, transparent), " +
            "radial-gradient(2px 2px at 8% 55%, rgba(255,255,255,0.7), transparent), " +
            "radial-gradient(1px 1px at 88% 45%, white, transparent), " +
            "radial-gradient(1.5px 1.5px at 25% 85%, rgba(255,255,255,0.6), transparent), " +
            "radial-gradient(1px 1px at 65% 35%, white, transparent), " +
            "radial-gradient(1px 1px at 12% 12%, rgba(255,255,255,0.5), transparent), " +
            "radial-gradient(1.5px 1.5px at 82% 82%, white, transparent)",
          backgroundSize: "300px 300px, 250px 250px, 200px 200px, 280px 280px, 220px 220px, 260px 260px, 240px 240px, 200px 200px, 230px 230px, 270px 270px",
        }}
      />

      {/* Halo radial — two layers of blur for atmospheric depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,107,26,0.06) 0%, transparent 45%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 45% 55%, rgba(40,80,180,0.05) 0%, transparent 40%)",
          filter: "blur(40px)",
        }}
      />

      {/* Globe canvas */}
      <div className="absolute inset-0">
        {GlobeCanvas ? (
          <GlobeCanvas
            className="w-full h-full"
            scrollProgress={scrollProgress}
            onLabelsUpdate={onLabelsUpdate}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-xs text-muted-foreground animate-pulse">Carregando globo…</div>
          </div>
        )}
      </div>

      {/* HTML labels — accessible, positioned over canvas */}
      {labels.map((label) => (
        label.visible && (
          <div
            key={label.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${label.x}px`,
              top: `${label.y}px`,
              transform: "translate(-50%, -50%)",
              transition: "opacity 0.3s ease",
            }}
          >
            <div
              className="whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
              aria-label={label.name}
            >
              {label.name}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
