"use client";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

const CASES = [
  {
    title: "Reposicionamento de marca premium",
    challenge: "Marca precisava aumentar percepção de valor sem perder alcance.",
    result: "+342% de crescimento em alcance e mais solicitações comerciais no direct.",
    metric: "+342%",
  },
  {
    title: "Campanha com foco em conversão",
    challenge: "Produto digital precisava transformar visualizações em intenção de compra.",
    result: "Sequência de conteúdo com CTA mais forte e maior retenção no vídeo principal.",
    metric: "+6,2%",
  },
  {
    title: "Autoridade para perfil estratégico",
    challenge: "Criador queria parecer mais premium e confiável para fechar mais publis.",
    result: "Melhor organização do posicionamento, narrativa visual e clareza comercial do perfil.",
    metric: "+300",
  },
];

export function Cases() {
  return (
    <section id="cases" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="06"
          eyebrow="Cases de Sucesso"
          title="Estratégia que sustenta autoridade e resultado"
          subtitle="Exemplos de como estrutura, posicionamento e narrativa elevam percepção de valor e performance comercial."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {CASES.map((item, index) => (
            <CaseCard key={item.title} item={item} index={index} />
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
      className="reveal rounded-3xl border border-border bg-card/60 backdrop-blur p-6 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BadgeCheck size={20} />
        </div>
        <div className="font-display text-3xl font-black text-gradient-orange">
          {item.metric}
        </div>
      </div>
      <h3 className="mt-5 font-display text-xl font-black">{item.title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Desafio:</strong> {item.challenge}
      </p>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Resultado:</strong> {item.result}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Posicionamento, conteúdo e conversão
        <ArrowUpRight size={16} />
      </div>
    </article>
  );
}
