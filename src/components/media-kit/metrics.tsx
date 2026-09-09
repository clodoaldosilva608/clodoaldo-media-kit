"use client";

import { Eye, Rocket, TrendingUp, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { SITE_METRICS, getAppCountBreakdown } from "@/lib/site-metrics";
import { CountUp } from "@/components/site/count-up";

const breakdown = getAppCountBreakdown();
const METRICS = [
  { icon: Eye, label: SITE_METRICS.impactedPeople.label, endValue: SITE_METRICS.impactedPeople.value / 1_000_000, decimals: 1, suffix: "M", growth: SITE_METRICS.impactedPeople.period, isCountUp: true },
  { icon: UserCheck, label: SITE_METRICS.communitySize.label, endValue: SITE_METRICS.communitySize.value / 1_000, decimals: 0, suffix: "K", growth: SITE_METRICS.communitySize.period, isCountUp: true },
  { icon: TrendingUp, label: SITE_METRICS.clientsAttended.label, endValue: SITE_METRICS.clientsAttended.value, decimals: 0, suffix: "+", growth: `em ${SITE_METRICS.yearsOfExperience} anos de carreira`, isCountUp: true },
  { icon: Rocket, label: "Apps no ecossistema", endValue: breakdown.total, decimals: 0, suffix: "", growth: `${breakdown.available} disponíveis · ${breakdown.beta} beta · ${breakdown.inDevelopment + breakdown.concept} em construção`, isCountUp: true },
];

export function Metrics() {
  return (
    <section id="metricas" className="py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="01"
          eyebrow="Performance"
          title="Números que sustentam autoridade e percepção de valor"
          subtitle="Impacto, escala e consistência — os indicadores que reduzem objeção antes da primeira reunião."
        />

        <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-8 sm:gap-y-12">
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

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className="reveal group relative border-t border-border pt-4 sm:pt-6 pb-2 transition-colors duration-500 hover:border-primary/60"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <Icon size={16} className="text-primary/80 shrink-0" />
        <span className="inline-flex items-center gap-1 text-[0.625rem] sm:text-[0.6875rem] font-medium tracking-wide text-primary text-right">
          <TrendingUp size={11} className="shrink-0" />
          <span className="leading-tight">{metric.growth}</span>
        </span>
      </div>
      <div className="mt-4 sm:mt-8 font-display font-medium text-3xl sm:text-5xl tracking-[-0.03em] tabular-nums">
        <CountUp end={metric.endValue} decimals={metric.decimals || 0} suffix={metric.suffix || ""} duration={2200} />
      </div>
      <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-tight">{metric.label}</div>
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
      <h2 className="mt-4 sm:mt-6 font-display font-medium text-2xl sm:text-4xl lg:text-[3.25rem] leading-[1.1] sm:leading-[1.05] tracking-[-0.03em]">
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
