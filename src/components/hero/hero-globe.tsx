"use client";

import { useEffect, useState } from "react";

/**
 * HeroGlobe — wrapper visual do GlobeCanvas.
 * Aceita scrollProgress (0-1) para aplicar tilt + rotação adicional.
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

      {/* Subtle atmospheric glow — much fainter to match reference */}
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-orange"
        style={{
          background: "radial-gradient(circle at 60% 35%, rgba(244,83,0,0.12) 0%, transparent 40%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-blue"
        style={{
          background: "radial-gradient(circle at 35% 65%, rgba(77,171,255,0.10) 0%, transparent 35%)",
          filter: "blur(35px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-blue-plus"
        style={{
          background: "radial-gradient(circle at 20% 50%, rgba(77,171,255,0.15) 0%, transparent 35%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none globe-shadow-orange-plus"
        style={{
          background: "radial-gradient(circle at 80% 50%, rgba(244,83,0,0.15) 0%, transparent 35%)",
          filter: "blur(50px)",
        }}
      />

      {/* The globe canvas — with scroll-driven tilt */}
      <div
        className="absolute inset-0 flex items-center justify-center will-change-transform"
        style={{
          transform: `perspective(1000px) rotateX(${scrollProgress * 15}deg) rotateZ(${scrollProgress * -5}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {GlobeCanvas ? (
          <GlobeCanvas
            className="w-full h-full"
            speed={1}
            tileDeg={isMobile ? 1.5 : 1.2}
            cameraZ={isMobile ? 3.2 : 2.9}
            scrollProgress={scrollProgress}
          />
        ) : (
          <div className="text-xs text-muted-foreground animate-pulse">Carregando globo…</div>
        )}
      </div>

      {/* Very subtle rim lighting — barely visible, just for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 62% 28%, rgba(255,122,0,0.08) 0%, transparent 30%), " +
            "radial-gradient(circle at 32% 72%, rgba(77,171,255,0.06) 0%, transparent 30%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(10,10,15,0.5) 80%, rgba(10,10,15,0.8) 100%)",
        }}
      />
    </div>
  );
}
