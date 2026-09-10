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
      {/* Star background — subtle, like United Carriers */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
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

      {/* Rainbow glow halo — replica United Carriers style (orange→pink→blue gradient on edge) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "conic-gradient(from 315deg at 50% 50%, rgba(255,107,26,0.15) 0deg, rgba(255,107,26,0.08) 60deg, rgba(236,72,153,0.1) 120deg, rgba(59,130,246,0.1) 180deg, rgba(59,130,246,0.06) 240deg, rgba(236,72,153,0.08) 300deg, rgba(255,107,26,0.15) 360deg)",
          maskImage: "radial-gradient(circle at 50% 50%, transparent 38%, black 42%, black 48%, transparent 52%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 38%, black 42%, black 48%, transparent 52%)",
        }}
      />

      {/* Atmospheric glow — warm orange inner halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,107,26,0.08) 0%, transparent 42%)",
          filter: "blur(25px)",
        }}
      />

      {/* Atmospheric glow — blue outer halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 48% 52%, rgba(59,130,246,0.06) 0%, transparent 45%)",
          filter: "blur(35px)",
        }}
      />

      {/* Diffuse outer aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,107,26,0.04) 30%, transparent 50%)",
          filter: "blur(50px)",
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
              className="whitespace-nowrap rounded bg-black/80 border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm"
              aria-label={label.name}
            >
              {label.name.toUpperCase()}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
