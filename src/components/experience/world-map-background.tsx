"use client";

import { useEffect, useRef, useState } from "react";
import { motionConfig } from "@/lib/experience/motion-config";

/**
 * WorldMapBackground — mapa-múndi pontilhado procedural usando Canvas 2D.
 * Pontos brancos de baixa opacidade formando continentes.
 * Alguns pontos destacados em laranja nos locais dos pins do globo.
 */
export function WorldMapBackground({ visible = true }: { visible?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let landPoints: Array<[number, number]> = [];
    let animFrame: number;
    let mounted = true;

    // Highlighted locations (same as globe pins)
    const highlights: Array<[number, number]> = [
      [40.41, -3.7], [-23.55, -46.63], [1.35, 103.82],
      [55.75, 37.62], [35.68, 139.69], [37.77, -122.42],
      [-1.29, 36.82], [41.9, 12.5], [28.61, 77.21], [31.79, -7.09],
    ];

    async function loadAndDraw() {
      try {
        const resp = await fetch("/land-points.json");
        landPoints = await resp.json();
      } catch {
        return;
      }
      if (!mounted || !canvas) return;
      draw();
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const isMobile = window.innerWidth < 768;
      const maxPoints = isMobile ? motionConfig.map.mobilePointCount : motionConfig.map.pointCount;

      // Sample points if needed
      const points = landPoints.length > maxPoints
        ? landPoints.filter((_, i) => i % Math.ceil(landPoints.length / maxPoints) === 0)
        : landPoints;

      // Draw land points (equirectangular projection)
      ctx.fillStyle = motionConfig.map.pointColor;
      for (const [lat, lng] of points) {
        const x = ((lng + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        ctx.beginPath();
        ctx.arc(x, y, motionConfig.map.pointSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw highlighted points (orange)
      ctx.fillStyle = motionConfig.map.highlightedPointColor;
      for (const [lat, lng] of highlights) {
        const x = ((lng + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw subtle connection lines between highlights
      ctx.strokeStyle = "rgba(255,107,26,0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < highlights.length - 1; i++) {
        const [lat1, lng1] = highlights[i];
        const [lat2, lng2] = highlights[i + 1];
        const x1 = ((lng1 + 180) / 360) * w;
        const y1 = ((90 - lat1) / 180) * h;
        const x2 = ((lng2 + 180) / 360) * w;
        const y2 = ((90 - lat2) / 180) * h;
        ctx.beginPath();
        // Quadratic curve for arc effect
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.15;
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(mx, my, x2, y2);
        ctx.stroke();
      }
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    }

    resize();
    window.addEventListener("resize", resize);
    loadAndDraw();

    // Animate opacity in
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !visible) {
      setOpacity(visible ? motionConfig.map.opacity : 0);
    } else {
      const startTime = performance.now() + motionConfig.map.entryDelayMs;
      const animate = (now: number) => {
        if (!mounted) return;
        const elapsed = now - startTime;
        if (elapsed < 0) {
          animFrame = requestAnimationFrame(animate);
          return;
        }
        const progress = Math.min(1, elapsed / motionConfig.map.entryDurationMs);
        setOpacity(progress * motionConfig.map.opacity);
        if (progress < 1) {
          animFrame = requestAnimationFrame(animate);
        }
      };
      animFrame = requestAnimationFrame(animate);
    }

    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [visible]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        opacity,
        transition: "opacity 0.3s ease-out",
        maskImage: "radial-gradient(ellipse at 70% 40%, black 0%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black 0%, transparent 75%)",
      }}
      aria-hidden="true"
    />
  );
}
