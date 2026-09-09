"use client";

import { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Carrossel de Provas Sociais — depoimentos genéricos focados em como
 * a pessoa se sentiu e o quanto valeu a pena, sem especificar tipo de
 * negócio físico. Depoimentos embutidos para sempre ter conteúdo visível.
 */

interface SocialProof {
  id: string;
  content: string;
  authorName: string;
  authorInitials: string;
  authorContext: string;
  rating: number;
}

const DEFAULT_TESTIMONIALS: SocialProof[] = [
  {
    id: "1",
    content: `Trabalhar com o Clodoaldo foi a melhor decisão que tomei pro meu negócio esse ano. Eu me sentia perdida no digital, sem saber por onde começar. Em poucas semanas eu finalmente entendi o que fazia sentido pra mim — e o que era só ruído. Hoje me sinto no controle.`,
    authorName: "Camila M.",
    authorInitials: "CM",
    authorContext: "empreendedora",
    rating: 5,
  },
  {
    id: "2",
    content: `Eu tinha vergonha de mostrar meu trabalho online. Achava que não era bom o suficiente. Depois de conversar e seguir o plano que ele montou, postei meu primeiro conteúdo com orgulho. A primeira venda veio na mesma semana. Valeu cada real investido.`,
    authorName: "Rafael S.",
    authorInitials: "RS",
    authorContext: "cliente recorrente",
    rating: 5,
  },
  {
    id: "3",
    content: `O que mais me marcou foi a forma como ele me ouviu antes de propor qualquer coisa. Não foi uma solução genérica — foi algo pensado pra minha realidade, pro meu tempo, pro meu momento. Me senti respeitada como pessoa, não como mais um número.`,
    authorName: "Patrícia L.",
    authorInitials: "PL",
    authorContext: "primeira viagem",
    rating: 5,
  },
  {
    id: "4",
    content: `Cheguei sem saber nem o que eu queria. Saí com clareza, com direção e com um passo a passo que cabia na minha rotina. É raro encontrar alguém que entenda tanto de estratégia E de gente ao mesmo tempo. Recomendo de olhos fechados.`,
    authorName: "Júnior A.",
    authorInitials: "JA",
    authorContext: "profissional liberal",
    rating: 5,
  },
  {
    id: "5",
    content: `Eu já tinha tentado de tudo. Curso atrás de curso, mentorias caras que não me levaram a lugar nenhum. Com o Clodoaldo foi diferente — ele me fez entender o que eu já tinha e como aproveitar isso. Sai da sensação de 'falta algo' pra sensação de 'estou no caminho'.`,
    authorName: "Bruna T.",
    authorInitials: "BT",
    authorContext: "creator iniciante",
    rating: 5,
  },
  {
    id: "6",
    content: `Mais do que resultado, eu encontrei confiança. Eu duvidava de mim o tempo todo. Hoje eu tomo decisões com mais clareza, posto sem medo de julgamento e — o melhor — minha audiência cresceu naturalmente porque eu tô sendo eu. Não tem preço pra isso.`,
    authorName: "Diego R.",
    authorInitials: "DR",
    authorContext: "creator em transição",
    rating: 5,
  },
  {
    id: "7",
    content: `Fui meio cética no começo. Pensei: 'mais um vendendo solução mágica'. Mas ele nunca prometeu mágica. Prometeu clareza, método e presença. Cumpriu os três. Em 2 meses eu já tinha recuperado o investimento. Em 6, estava em outro patamar.`,
    authorName: "Aline F.",
    authorInitials: "AF",
    authorContext: "client desde 2023",
    rating: 5,
  },
  {
    id: "8",
    content: `O que eu mais valorizo é a honestidade. Ele me disse 'não faz isso, não vai funcionar pra você' quando eu queria muito fazer. Isso me poupo tempo, dinheiro e frustração. Difícil encontrar alguém que te fala a verdade mesmo quando não é o que você quer ouvir.`,
    authorName: "Marcos V.",
    authorInitials: "MV",
    authorContext: "empreendedor",
    rating: 5,
  },
];

export function SocialProofCarousel() {
  const [items] = useState<SocialProof[]>(DEFAULT_TESTIMONIALS);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length === 0) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  const t = items[idx];
  const next = () => setIdx((i) => (i + 1) % items.length);
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card/80 via-card/40 to-transparent p-5 sm:p-8 md:p-12 shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Quote className="absolute right-4 sm:right-6 top-4 sm:top-6 h-10 w-10 sm:h-16 sm:w-16 text-primary/10 pointer-events-none" />
      <button
        onClick={prev}
        aria-label="Depoimento anterior"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card transition z-20"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Próximo depoimento"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card transition z-20"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="relative px-7 sm:px-0">
        <div className="mb-4 sm:mb-5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 sm:h-5 w-4 sm:w-5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`}
            />
          ))}
        </div>
        <blockquote className="mb-5 sm:mb-7 text-base sm:text-lg md:text-xl font-medium leading-relaxed text-foreground">
          &ldquo;{t.content}&rdquo;
        </blockquote>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs sm:text-sm font-bold text-background shrink-0">
            {t.authorInitials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{t.authorName}</div>
            <div className="text-xs text-muted-foreground">{t.authorContext}</div>
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-5 sm:mt-7 flex items-center gap-1.5 flex-wrap">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-7 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                aria-label={`Ir para depoimento ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
