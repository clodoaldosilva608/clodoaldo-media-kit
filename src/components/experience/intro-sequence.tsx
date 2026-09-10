"use client";

import { useEffect, useState, useRef } from "react";
import { motionConfig } from "@/lib/experience/motion-config";

/**
 * IntroSequence — tela de abertura cinematográfica overlay.
 * 
 * Sequência:
 * 1. 0-500ms: fundo preto + mapa pontilhado surge
 * 2. 500-1500ms: pontos do globo surgem
 * 3. 1000-2000ms: arcos aparecem
 * 4. 1500-2500ms: "Clodoaldo Silva" em fade
 * 5. 2500-3000ms: overlay sai por fade + scale
 * 
 * - Botão "Pular introdução" após 800ms
 * - sessionStorage evita repetir
 * - prefers-reduced-motion pula imediatamente
 */
export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=visible, 2=exiting
  const [showSkip, setShowSkip] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    // Check if should skip
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(motionConfig.intro.sessionStorageKey);

    if (reduced || seen) {
      onComplete();
      return;
    }

    // Start intro
    setPhase(1);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Show skip button
    timers.push(setTimeout(() => setShowSkip(true), motionConfig.intro.skipButtonDelayMs));

    // Show brand name
    timers.push(setTimeout(() => setShowBrand(true), 1500));

    // Start exit
    timers.push(setTimeout(() => {
      finish();
    }, motionConfig.intro.durationMs));

    // Fallback: force finish after 5s
    timers.push(setTimeout(() => {
      finish();
    }, 5000));

    function finish() {
      if (completedRef.current) return;
      completedRef.current = true;
      setPhase(2); // exit animation
      sessionStorage.setItem(motionConfig.intro.sessionStorageKey, "1");
      timers.push(setTimeout(() => {
        onComplete();
      }, 500)); // exit transition duration
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  function handleSkip() {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase(2);
    sessionStorage.setItem(motionConfig.intro.sessionStorageKey, "1");
    setTimeout(() => onComplete(), 400);
  }

  if (phase === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        backgroundColor: "#000000",
        opacity: phase === 2 ? 0 : 1,
        transform: phase === 2 ? "scale(1.05)" : "scale(1)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        pointerEvents: phase === 2 ? "none" : "auto",
      }}
    >
      {/* Dot pattern background (matching world map) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: phase === 1 ? 0.6 : 0,
          transition: "opacity 1s ease-out",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: phase === 1 ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
      />

      {/* Animated dots — simulating globe points appearing */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
          opacity: phase === 1 ? 0.15 : 0,
          transition: "opacity 1.5s ease-out 0.5s",
          maskImage: "radial-gradient(circle at 65% 50%, black 0%, transparent 50%)",
          WebkitMaskImage: "radial-gradient(circle at 65% 50%, black 0%, transparent 50%)",
        }}
      />

      {/* Connection arcs — subtle orange lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: phase === 1 ? 0.3 : 0,
          transition: "opacity 1s ease-out 1s",
        }}
      >
        <defs>
          <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,107,26,0)" />
            <stop offset="50%" stopColor="rgba(255,107,26,0.4)" />
            <stop offset="100%" stopColor="rgba(255,107,26,0)" />
          </linearGradient>
        </defs>
        {[20, 35, 50, 65, 80].map((y, i) => (
          <path
            key={i}
            d={`M 0 ${y}% Q 50% ${y - 10}% 100% ${y}%`}
            fill="none"
            stroke="url(#arc-grad)"
            strokeWidth="1"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </svg>

      {/* Brand name */}
      <div
        className="relative z-10 text-center"
        style={{
          opacity: showBrand ? 1 : 0,
          transform: showBrand ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1s ease-out, transform 1s ease-out",
        }}
      >
        <div className="font-display text-3xl sm:text-5xl text-white tracking-tight">
          Clodoaldo <span className="text-primary">Silva</span>
        </div>
        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
          Estratégia · Conteúdo · Resultados
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-primary/40 to-primary"
          style={{
            animation: `intro-progress ${motionConfig.intro.durationMs}ms linear forwards`,
          }}
        />
      </div>

      {/* Skip button */}
      {showSkip && phase === 1 && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 text-xs uppercase tracking-wider text-zinc-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-3 py-2"
        >
          Pular introdução →
        </button>
      )}

      <style jsx>{`
        @keyframes intro-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
