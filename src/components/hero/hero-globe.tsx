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
      {/* Shadow group — rotaciona 180deg como United Carriers */}
      <div className="globe-shadow-group">
        <div className="globe-shadow-orange" />
        <div className="globe-shadow-blue" />
        <div className="globe-shadow-blue-plus" />
        <div className="globe-shadow-orange-plus" />
      </div>

      {/* Globe canvas */}
      <div className="absolute inset-0 z-2">
        {GlobeCanvas ? (
          <GlobeCanvas
            className="w-full h-full"
            scrollProgress={scrollProgress}
            onLabelsUpdate={onLabelsUpdate}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-xs text-white/20 animate-pulse">...</div>
          </div>
        )}
      </div>

      {/* Globe blur — desfoque sutil sobre o globo */}
      <div className="globe-blur" />

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
              className="globe-label-text whitespace-nowrap bg-[#111] px-[5.9px] py-[4.4px] text-[7.4px] font-normal text-white"
              aria-label={label.name}
              style={{ fontSize: "clamp(8px, 0.6vw, 12px)" }}
            >
              {label.name.toUpperCase()}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
