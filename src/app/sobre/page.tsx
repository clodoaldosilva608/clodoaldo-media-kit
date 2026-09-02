import type { Metadata } from "next";
import { Target, Eye, Heart, TrendingUp } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";

export const metadata: Metadata = {
  title: "Sobre — Clodoaldo Silva | Influenciador Digital",
  description:
    "Conheça Clodoaldo Silva — influenciador digital de Lifestyle, Business e Vision. Missão, visão, valores e trajetória.",
  alternates: { canonical: "https://clodoaldo-silva.lovable.app/sobre" },
  openGraph: {
    title: "Sobre — Clodoaldo Silva",
    description: "Influenciador digital transformando conhecimento em patrimônio.",
    url: "https://clodoaldo-silva.lovable.app/sobre",
  },
};

const PILARES = [
  {
    icon: Target,
    title: "Missão",
    text: "Inspirar pessoas a transformarem conhecimento em patrimônio, através de conteúdo autêntico sobre negócios, IA, produtividade e liberdade financeira.",
  },
  {
    icon: Eye,
    title: "Visão",
    text: "Ser referência em marketing de influência consciente, conectando marcas premium a uma audiência engajada e qualificada.",
  },
  {
    icon: Heart,
    title: "Valores",
    text: "Autenticidade, estratégia, transparência com parceiros e respeito absoluto pela audiência que confia no nosso trabalho.",
  },
  {
    icon: TrendingUp,
    title: "Trajetória",
    text: "Crescimento explosivo no último ano: +5.593% em visualizações, +75.900% em visualizações de perfil e milhares de engajamentos qualificados.",
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-4xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Sobre
        </div>
        <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl leading-tight">
          Conheça a história por trás da marca
          <span className="text-gradient-orange"> Clodoaldo Silva</span>
        </h1>

        <div className="mt-8 space-y-5 text-base sm:text-lg text-foreground/90 leading-relaxed">
          <p>
            <strong>Clodoaldo Silva</strong> é influenciador digital focado em
            <strong> Lifestyle, Business e Vision</strong>. Conteúdos sobre
            empreendedorismo, IA, produtividade e construção de patrimônio
            conectam uma audiência qualificada em busca de crescimento real.
          </p>
          <p>
            Com crescimento orgânico explosivo nos últimos meses, o canal se
            tornou referência para marcas que buscam parcerias autênticas,
            engajamento real e resultados mensuráveis — longe do marketing
            artificial.
          </p>
          <p>
            Mais do que números, o trabalho é guiado por <strong>propósito</strong>:
            cada conteúdo é pensado para entregar valor à audiência e gerar
            conexão verdadeira entre seguidores e marcas.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {PILARES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 shadow-card"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-orange grid place-items-center text-primary-foreground shadow-glow">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display font-medium text-xl">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.text}
                </p>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
