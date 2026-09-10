"use client";

import { useEffect, useState, useCallback } from "react";

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
  const [labels, setLabels] = useState<LabelData[]>([]);

  useEffect(() => {
    import("./globe-canvas").then((mod) => {
      setGlobeCanvas(() => mod.default);
    });
  }, []);

  const onLabelsUpdate = useCallback((newLabels: LabelData[]) => {
    setLabels(newLabels);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Globe shadows — replica United Carriers: orange, blue, blue-plus, orange-plus */}
      <div className="globe-shadow-orange" />
      <div className="globe-shadow-blue" />
      <div className="globe-shadow-blue-plus" />
      <div className="globe-shadow-orange-plus" />

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
            <div className="text-xs text-white/30 animate-pulse">...</div>
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
