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
      {/* NO star background — pure black like United Carriers */}

      {/* Glow halo — blue→purple→magenta (United Carriers style) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "conic-gradient(from 180deg at 50% 50%, rgba(59,130,246,0.12) 0deg, rgba(139,92,246,0.1) 90deg, rgba(236,72,153,0.1) 180deg, rgba(59,130,246,0.12) 270deg, rgba(59,130,246,0.12) 360deg)",
          maskImage: "radial-gradient(circle at 50% 50%, transparent 38%, black 42%, black 48%, transparent 52%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 38%, black 42%, black 48%, transparent 52%)",
        }}
      />

      {/* Atmospheric glow — blue inner halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 42%)",
          filter: "blur(25px)",
        }}
      />

      {/* Atmospheric glow — purple mid halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 48% 52%, rgba(139,92,246,0.06) 0%, transparent 45%)",
          filter: "blur(35px)",
        }}
      />

      {/* Diffuse outer aura — magenta/blue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.04) 30%, transparent 50%)",
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
