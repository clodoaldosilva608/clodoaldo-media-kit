"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";
import { CASE_STUDIES, CASE_CATEGORY_LABELS } from "@/lib/case-studies";

/**
 * Cases da home — 100% reais e verificáveis (operação própria).
 * Métricas curtas derivadas do modelo rico em src/lib/case-studies.ts.
 */

const METRIC_SHORT: Record<string, string> = {
  "meucorre-prospeccao-ia": "485 leads",
  "linha-produtos-kiwify": "5 produtos",
  "ecossistema-51-apps": "22 apps",
};

const EVIDENCE_HREF: Record<string, string> = {
  "meucorre-prospeccao-ia": "/resultados",
  "linha-produtos-kiwify": "/produtos",
  "ecossistema-51-apps": "/apps",
};

const CASES = CASE_STUDIES.map((c) => ({
  id: c.id,
  title: c.title,
  category: CASE_CATEGORY_LABELS[c.category],
  challenge: c.problem,
  result: c.result,
  metric: METRIC_SHORT[c.id] ?? c.baseMetric,
  href: EVIDENCE_HREF[c.id] ?? "/resultados",
}));

export function Cases() {
  return (
    <section id="cases" className="py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="08"
          eyebrow="Cases de Sucesso"
          title="Estratégia que sustenta autoridade e resultado"
          subtitle="Cases reais da minha própria operação — cada número abaixo está vivo em produção, nos sistemas que eu construo e uso diariamente."
        />

        <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 lg:grid-cols-3">
          {CASES.map((item, index) => (
            <CaseCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseCard({
  item,
  index,
}: {
  item: (typeof CASES)[number];
  index: number;
}) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <article
      ref={ref}
      style={{ animationDelay: `${index * 80}ms` }}
      className="reveal rounded-3xl border border-border bg-card/60 backdrop-blur p-5 sm:p-6 shadow-card flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BadgeCheck size={18} />
        </div>
        <div className="font-display text-2xl sm:text-3xl font-black text-gradient-orange break-words">
          {item.metric}
        </div>
      </div>
      <h3 className="mt-4 sm:mt-5 font-display text-lg sm:text-xl font-black">{item.title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Desafio:</strong> {item.challenge}
      </p>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
        <strong className="text-foreground">Resultado:</strong> {item.result}
      </p>
      <Link
        href={item.href}
        className="mt-4 sm:mt-5 inline-flex w-fit items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline underline-offset-4"
      >
        {item.category} · ver evidência
        <ArrowUpRight size={14} />
      </Link>
    </article>
  );
}
