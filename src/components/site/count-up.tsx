"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CountUp — anima número de 0 até o valor final quando entra na viewport.
 * Replica o comportamento do United Carriers (data-count attribute).
 *
 * Uso:
 *   <CountUp end={1200} suffix="+" />
 *   <CountUp end={98.2} decimals={1} suffix="%" />
 *   <CountUp end={8} suffix="+" />
 */

interface CountUpProps {
  end: number;
  duration?: number; // ms (default 2000)
  decimals?: number; // default 0
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2000,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = end * eased;
            setValue(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setValue(end); // ensure exact final value
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }, // trigger when 30% visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  // Format number with locale (pt-BR: comma for decimals, dot for thousands)
  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
