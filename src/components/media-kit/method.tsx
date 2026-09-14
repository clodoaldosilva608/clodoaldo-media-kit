"use client";

import { useState } from "react";
import { Compass, PenTool, Rocket, Stethoscope, TrendingUp, ChevronDown, ArrowRight, ArrowLeftRight, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

type Step = {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
  // Campos enriquecidos (Passo 9 do brief)
  input: string;       // Entrada necessária pra fase começar
  activity: string;    // Atividade executada na fase
  output: string;      // Saída entregue ao final
  done_when: string;   // Critério de conclusão
  duration: string;    // Prazo indicativo
};

const STEPS: Step[] = [
  {
    index: "01",
    title: "Diagnóstico",
    description: "Entender objetivo, público e restrições antes de qualquer proposta.",
    icon: Stethoscope,
    input: "Sua dúvida, link de site/redes, ou só a vontade de começar.",
    activity: "Conversa inicial (WhatsApp ou call de 30min) + auditoria rápida do seu digital atual.",
    output: "Documento simples com: onde você tá, onde quer chegar, e o que falta no caminho.",
    done_when: "Você aprova o diagnóstico e concorda com a prioridade definida.",
    duration: "1-2 dias",
  },
  {
    index: "02",
    title: "Direção",
    description: "Definir posicionamento, narrativa e prioridade para guiar a execução.",
    icon: Compass,
    input: "Diagnóstico aprovado + acesso às contas/material que você já tem.",
    activity: "Defino posicionamento, narrativa, escopo do projeto, cronograma e investimento.",
    output: "Proposta clara com escopo, entregáveis, prazo e valor — sem letra miúda.",
    done_when: "Você aprova a proposta (ou ajustamos até ficar bom). Aí fecha e começa a próxima fase.",
    duration: "1-3 dias",
  },
  {
    index: "03",
    title: "Produção",
    description: "Criar conteúdo, campanha, produto ou protótipo com clareza de escopo.",
    icon: PenTool,
    input: "Proposta aprovada + materiais necessários (fotos, textos, acessos) do seu lado.",
    activity: "Executo: crio o site, roteiro, arte, cardápio, app — o que foi combinado.",
    output: "Versão beta/preview pra você revisar. Sempre entregável, nunca promessa vazia.",
    done_when: "Você valida a versão beta e pede ajustes (ou aprova direto).",
    duration: "5-15 dias conforme escopo",
  },
  {
    index: "04",
    title: "Lançamento",
    description: "Publicar, entregar ou colocar a solução no ar dentro do combinado.",
    icon: Rocket,
    input: "Versão beta aprovada + acessos finais (domínio, hospedagem, redes) do seu lado.",
    activity: "Publico no ar, configuro domínio, SEO básico, integrações (WhatsApp, PIX, etc).",
    output: "Solução no ar, funcionando, com link pra você acessar e compartilhar.",
    done_when: "Solução publicada + você recebe o link final + tutorial de como usar.",
    duration: "1-3 dias",
  },
  {
    index: "05",
    title: "Evolução",
    description: "Medir resultados, ajustar rota e planejar o próximo ciclo.",
    icon: TrendingUp,
    input: "Solução no ar + 7-30 dias de uso real pra ter dados.",
    activity: "Análise de métricas (Google Analytics, Search Console, conversões), ajustes finos, sugestões de evolução.",
    output: "Relatório simples com: o que funcionou, o que ajustar, próximo passo recomendado.",
    done_when: "Você decide se segue com pacote recorrente ou se encerramos por aqui. Sem pressão.",
    duration: "Contínuo (mensal)",
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
          subtitle="Um método claro em cinco etapas — do diagnóstico inicial à evolução contínua dos resultados. Cada fase tem entrada, atividade, entrega e critério de conclusão definidos."
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

        {/* Aviso de limites de escopo (Passo 9 do brief) */}
        <div className="mt-10 sm:mt-12 rounded-2xl border border-amber-500/30 bg-amber-50 dark:bg-amber-500/[0.04] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">Limites de escopo transparentes</h4>
              <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-100/80">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span><strong>Canais de comunicação:</strong> WhatsApp durante toda a execução. Calls agendadas apenas quando necessário (geralmente 1-2 por projeto).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span><strong>Prazos:</strong> começam a contar após aprovação da proposta + envio dos materiais necessários. Atrasos do seu lado não conteabilizam no prazo de entrega.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span><strong>Alterações:</strong> 2 rodadas de ajuste inclusas na fase de Produção. Alterações fora do escopo combinado são orçadas à parte.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span><strong>Garantia:</strong> 15 dias após lançamento pra corrigir bugs sem custo. Depois disso, manutenção é paga (ou inclusa no pacote recorrente).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, delay }: { step: Step; delay: number }) {
  const ref = useReveal<HTMLLIElement>();
  const Icon = step.icon;
  const [expanded, setExpanded] = useState(false);

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

      {/* Prazo indicativo (badge) */}
      <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
        <Clock className="h-3 w-3" />
        {step.duration}
      </div>

      {/* Botão expandir detalhes (entrada/atividade/saída/critério) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition"
        aria-expanded={expanded}
      >
        {expanded ? "Ocultar detalhes" : "Ver detalhes da fase"}
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Detalhes expandíveis: entrada, atividade, saída, critério de conclusão */}
      {expanded && (
        <div className="mt-1 space-y-3 rounded-xl border border-border bg-background/50 p-3">
          <PhaseDetail
            icon={<ArrowRight className="h-3.5 w-3.5 text-blue-400" />}
            label="Entrada necessária"
            value={step.input}
          />
          <PhaseDetail
            icon={<ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />}
            label="Atividade"
            value={step.activity}
          />
          <PhaseDetail
            icon={<ArrowLeftRight className="h-3.5 w-3.5 text-emerald-400 rotate-90" />}
            label="Saída entregue"
            value={step.output}
          />
          <PhaseDetail
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />}
            label="Concluído quando"
            value={step.done_when}
          />
        </div>
      )}
    </li>
  );
}

function PhaseDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed pl-5">
        {value}
      </p>
    </div>
  );
}
