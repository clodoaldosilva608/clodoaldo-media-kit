"use client";

import { Compass, PenTool, Rocket, Stethoscope, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

type Step = {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    index: "01",
    title: "Diagnóstico",
    description: "Entender objetivo, público e restrições antes de qualquer proposta.",
    icon: Stethoscope,
  },
  {
    index: "02",
    title: "Direção",
    description: "Definir posicionamento, narrativa e prioridade para guiar a execução.",
    icon: Compass,
  },
  {
    index: "03",
    title: "Produção",
    description: "Criar conteúdo, campanha, produto ou protótipo com clareza de escopo.",
    icon: PenTool,
  },
  {
    index: "04",
    title: "Lançamento",
    description: "Publicar, entregar ou colocar a solução no ar dentro do combinado.",
    icon: Rocket,
  },
  {
    index: "05",
    title: "Evolução",
    description: "Medir resultados, ajustar rota e planejar o próximo ciclo.",
    icon: TrendingUp,
  },
];

export function Method() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20 md:py-28 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="01"
          eyebrow="Método"
          title="Como trabalhamos"
          subtitle="Um método claro em cinco etapas — do diagnóstico inicial à evolução contínua dos resultados."
        />

        {/* Timeline: vertical on mobile, 5-column with connector on desktop */}
        <div className="relative mt-12 sm:mt-16">
          {/* Connector line — desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[42px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-4 lg:gap-3">
            {STEPS.map((step, i) => (
              <StepCard key={step.index} step={step} delay={i * 90} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, delay }: { step: Step; delay: number }) {
  const ref = useReveal<HTMLLIElement>();
  const Icon = step.icon;

  return (
    <li
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className="reveal relative flex flex-col gap-3 rounded-2xl border border-border bg-card/70 backdrop-blur p-5 sm:p-6 transition-colors duration-300 hover:border-primary/60"
    >
      {/* Numbered node — sits on the connector line on desktop */}
      <div className="flex items-center gap-3">
        <span
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-background border border-primary/40 text-primary"
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
        <span className="font-display text-sm text-primary tabular-nums">
          {step.index}
        </span>
      </div>

      <h3 className="mt-1 font-display font-medium text-base sm:text-lg leading-tight">
        {step.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </li>
  );
}
