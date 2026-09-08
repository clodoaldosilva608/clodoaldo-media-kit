"use client";

import { useEffect, useState } from "react";

/**
 * HeroGlobe — wrapper visual do GlobeCanvas.
 * Réplica do layout do United Carriers.
 */

export function HeroGlobe() {
  const [GlobeCanvas, setGlobeCanvas] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Load Three.js globe only on client, after mount
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
    <div className="relative w-full aspect-square max-w-[640px] mx-auto">
      {/* Star background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(2px 2px at 20% 30%, white, transparent), " +
            "radial-gradient(1px 1px at 60% 70%, white, transparent), " +
            "radial-gradient(1.5px 1.5px at 80% 20%, white, transparent), " +
            "radial-gradient(1px 1px at 40% 80%, white, transparent), " +
            "radial-gradient(2px 2px at 10% 60%, rgba(255,255,255,0.7), transparent), " +
            "radial-gradient(1px 1px at 90% 50%, white, transparent), " +
            "radial-gradient(1.5px 1.5px at 30% 90%, rgba(255,255,255,0.6), transparent)",
          backgroundSize: "300px 300px, 250px 250px, 200px 200px, 280px 280px, 220px 220px, 260px 260px, 240px 240px",
        }}
      />

      {/* Colored shadow halos (behind globe) */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(244,83,0,0.18) 0%, transparent 35%)", filter: "blur(40px)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 35% 50%, rgba(77,171,255,0.18) 0%, transparent 30%)", filter: "blur(50px)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 65% 50%, rgba(77,171,255,0.12) 0%, transparent 25%)", filter: "blur(60px)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 65%, rgba(244,83,0,0.10) 0%, transparent 30%)", filter: "blur(70px)" }} />

      {/* The globe canvas itself */}
      <div className="absolute inset-0 flex items-center justify-center">
        {GlobeCanvas ? (
          <GlobeCanvas
            className="w-full h-full"
            speed={1}
            tileDeg={isMobile ? 1.5 : 1.2}
            cameraZ={isMobile ? 2.8 : 2.45}
          />
        ) : (
          <div className="text-xs text-muted-foreground animate-pulse">Carregando globo…</div>
        )}
      </div>

      {/* Subtle radial vignette to fade edges into background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, transparent 50%, rgba(10,10,15,0.6) 100%)" }} />
    </div>
  );
}
