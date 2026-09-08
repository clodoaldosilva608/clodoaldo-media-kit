"use client";

import { useEffect, useState } from "react";

/**
 * HeroGlobe — wrapper do GlobeCanvas.
 * O shader do globo já faz o rim glow ciano + gradiente.
 * Aqui só adicionamos: estrelas de fundo + vignette.
 */

interface HeroGlobeProps {
  scrollProgress?: number;
}

export function HeroGlobe({ scrollProgress = 0 }: HeroGlobeProps) {
  const [GlobeCanvas, setGlobeCanvas] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="relative w-full h-full">
      {/* Star background — deep space */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
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
            "radial-gradient(1.5px 1.5px at 82% 82%, white, transparent), " +
            "radial-gradient(1px 1px at 45% 50%, rgba(255,255,255,0.4), transparent), " +
            "radial-gradient(1px 1px at 92% 92%, white, transparent)",
          backgroundSize: "300px 300px, 250px 250px, 200px 200px, 280px 280px, 220px 220px, 260px 260px, 240px 240px, 200px 200px, 230px 230px, 270px 270px, 250px 250px, 210px 210px",
        }}
      />

      {/* Subtle blue nebula glow behind globe (very faint) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 45% 50%, rgba(30,50,100,0.15) 0%, transparent 50%)",
        }}
      />

      {/* The globe canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        {GlobeCanvas ? (
          <GlobeCanvas
            className="w-full h-full"
            speed={1}
            cameraZ={isMobile ? 3.0 : 2.5}
            scrollProgress={scrollProgress}
          />
        ) : (
          <div className="text-xs text-muted-foreground animate-pulse">Carregando globo…</div>
        )}
      </div>
    </div>
  );
}
