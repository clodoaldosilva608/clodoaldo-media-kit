"use client";

import { Eye, Rocket, TrendingUp, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { SITE_METRICS, getAppCountBreakdown } from "@/lib/site-metrics";

const breakdown = getAppCountBreakdown();
const METRICS = [
  {
    icon: Eye,
    label: SITE_METRICS.impactedPeople.label,
    value: Number((SITE_METRICS.impactedPeople.value / 1_000_000).toFixed(1)),
    suffix: "M",
    growth: SITE_METRICS.impactedPeople.period,
  },
  {
    icon: UserCheck,
    label: SITE_METRICS.communitySize.label,
    value: Number((SITE_METRICS.communitySize.value / 1_000).toFixed(0)),
    suffix: "K",
    growth: SITE_METRICS.communitySize.period,
  },
  {
    icon: TrendingUp,
    label: SITE_METRICS.clientsAttended.label,
    value: SITE_METRICS.clientsAttended.value,
    suffix: "+",
    growth: `em ${SITE_METRICS.yearsOfExperience} anos de carreira`,
  },
  {
    icon: Rocket,
    label: "Apps no ecossistema",
    value: breakdown.total,
    suffix: "",
    growth: `${breakdown.available} disponíveis · ${breakdown.beta} beta · ${breakdown.inDevelopment + breakdown.concept} em construção`,
  },
];

export function Metrics() {
  return (
    <section id="metricas" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="01"
          eyebrow="Performance"
          title="Números que sustentam autoridade e percepção de valor"
          subtitle="Impacto, escala e consistência — os indicadores que reduzem objeção antes da primeira reunião."
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
          {METRICS.map((m, i) => (
            <MetricCard key={m.label} metric={m} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  metric,
  delay,
}: {
  metric: (typeof METRICS)[number];
  delay: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  const Icon = metric.icon;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 36;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setDisplayValue(metric.value * progress);
      if (progress >= 1) window.clearInterval(timer);
    }, 22);

    return () => window.clearInterval(timer);
  }, [metric.value]);

  const formattedValue = useMemo(() => {
    if (metric.suffix === "%") {
      return `${displayValue.toFixed(1).replace(".", ",")}${metric.suffix}`;
    }
    const decimals = metric.value < 10 && metric.value % 1 !== 0 ? 1 : 0;
    return `${displayValue.toFixed(decimals).replace(".", ",")}${metric.suffix}`;
  }, [displayValue, metric.suffix, metric.value]);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className="reveal group relative border-t border-border pt-6 pb-2 transition-colors duration-500 hover:border-primary/60"
    >
      <div className="flex items-start justify-between gap-3">
        <Icon size={16} className="text-primary/80" />
        <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium tracking-wide text-primary">
          <TrendingUp size={11} />
          {metric.growth}
        </span>
      </div>
      <div className="mt-8 font-display font-medium text-4xl sm:text-5xl tracking-[-0.03em] tabular-nums">
        +{formattedValue}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{metric.label}</div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  index,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  index?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal max-w-3xl">
      <div className="flex items-center gap-4">
        {index && (
          <span className="font-display text-sm text-primary tabular-nums">{index}</span>
        )}
        <span className="eyebrow">{eyebrow}</span>
        <span className="hairline flex-1" />
      </div>
      <h2 className="mt-6 font-display font-medium text-3xl sm:text-4xl lg:text-[3.25rem] leading-[1.05] tracking-[-0.03em]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
