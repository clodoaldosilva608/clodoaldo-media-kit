"use client";

import { useEffect, useState } from "react";

/**
 * HeroGlobe — wrapper visual do GlobeCanvas.
 * Réplica do layout do United Carriers com:
 * - Globo grande preenchendo o container
 * - 4 sombras coloridas pulsantes (orange + blue + blue-plus + orange-plus)
 * - Star background
 * - Vignette
 */

export function HeroGlobe() {
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
      {/* Star background */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(2px 2px at 20% 30%, white, transparent), " +
            "radial-gradient(1px 1px at 60% 70%, white, transparent), " +
            "radial-gradient(1.5px 1.5px at 80% 20%, white, transparent), " +
            "radial-gradient(1px 1px at 40% 80%, white, transparent), " +
            "radial-gradient(2px 2px at 10% 60%, rgba(255,255,255,0.7), transparent), " +
            "radial-gradient(1px 1px at 90% 50%, white, transparent), " +
            "radial-gradient(1.5px 1.5px at 30% 90%, rgba(255,255,255,0.6), transparent), " +
            "radial-gradient(1px 1px at 70% 40%, white, transparent), " +
            "radial-gradient(1px 1px at 15% 15%, rgba(255,255,255,0.5), transparent), " +
            "radial-gradient(1.5px 1.5px at 85% 85%, white, transparent)",
          backgroundSize: "350px 350px, 280px 280px, 220px 220px, 300px 300px, 250px 250px, 270px 270px, 260px 260px, 200px 200px, 230px 230px, 290px 290px",
        }}
      />

      {/* Dramatic atmospheric glow — orange (top-right) */}
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-orange"
        style={{
          background:
            "radial-gradient(circle at 60% 35%, rgba(244,83,0,0.35) 0%, rgba(244,83,0,0.12) 25%, transparent 50%)",
          filter: "blur(30px)",
        }}
      />
      {/* Blue glow (bottom-left) */}
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-blue"
        style={{
          background:
            "radial-gradient(circle at 35% 65%, rgba(77,171,255,0.30) 0%, rgba(77,171,255,0.10) 25%, transparent 45%)",
          filter: "blur(35px)",
        }}
      />
      {/* Blue-plus (far left) */}
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-blue-plus"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(77,171,255,0.15) 0%, transparent 35%)",
          filter: "blur(50px)",
        }}
      />
      {/* Orange-plus (far right) */}
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-orange-plus"
        style={{
          background:
            "radial-gradient(circle at 80% 50%, rgba(244,83,0,0.15) 0%, transparent 35%)",
          filter: "blur(50px)",
        }}
      />

      {/* The globe canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        {GlobeCanvas ? (
          <GlobeCanvas
            className="w-full h-full"
            speed={1}
            tileDeg={isMobile ? 1.5 : 1.0}
            cameraZ={isMobile ? 2.8 : 2.3}
          />
        ) : (
          <div className="text-xs text-muted-foreground animate-pulse">Carregando globo…</div>
        )}
      </div>

      {/* Atmospheric rim lighting — ON TOP of canvas, creates the orange/blue glow on globe edge */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 62% 28%, rgba(255,122,0,0.35) 0%, rgba(255,122,0,0.08) 25%, transparent 40%), " +
            "radial-gradient(circle at 32% 72%, rgba(77,171,255,0.25) 0%, rgba(77,171,255,0.05) 25%, transparent 40%)",
        }}
      />

      {/* Vignette — fade edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 45%, rgba(10,10,15,0.5) 80%, rgba(10,10,15,0.8) 100%)",
        }}
      />
    </div>
  );
}
