"use client";

import { Code2, Compass, FileText, TrendingUp, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

type Differential = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const DIFFERENTIALS: Differential[] = [
  {
    title: "Um ponto de contato",
    description:
      "Estratégia, conteúdo e execução coordenados por uma só pessoa — sem ruído de reunião nem repasse infinito.",
    icon: UserCheck,
  },
  {
    title: "Método claro",
    description:
      "Cada projeto começa com diagnóstico e escopo definidos. Você sabe o que está comprando antes de pagar.",
    icon: Compass,
  },
  {
    title: "Execução real",
    description:
      "Experiência com conteúdo, produtos e aplicativos publicados — não é só PowerPoint, é entrega no ar.",
    icon: Code2,
  },
  {
    title: "Transparência comercial",
    description:
      "Entregáveis, prazos, limites e investimento explícitos desde a primeira conversa. Sem surpresa no fim.",
    icon: FileText,
  },
  {
    title: "Evolução contínua",
    description:
      "Análise dos resultados e próximos passos recomendados — o projeto não termina no envio do arquivo final.",
    icon: TrendingUp,
  },
];

export function WhyMe() {
  return (
    <section id="diferenciais" className="py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="03"
          eyebrow="Diferenciais"
          title="Por que trabalhar comigo"
          subtitle="Mais do que entregáveis, o que importa é a forma como o trabalho acontece — clareza, método e resultado que sobrevive ao tempo."
        />

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {DIFFERENTIALS.map((item, i) => (
            <DifferentialCard key={item.title} item={item} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DifferentialCard({
  item,
  delay,
}: {
  item: Differential;
  delay: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  const Icon = item.icon;

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className="reveal group relative rounded-2xl border border-border bg-card/60 backdrop-blur p-6 sm:p-7 transition-colors duration-300 hover:border-primary/60 hover:bg-card/80"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
          <Icon size={18} />
        </span>
        <span className="font-display text-xs text-muted-foreground tabular-nums">
          {String(DIFFERENTIALS.indexOf(item) + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-4 font-display font-medium text-lg leading-tight">
        {item.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}
