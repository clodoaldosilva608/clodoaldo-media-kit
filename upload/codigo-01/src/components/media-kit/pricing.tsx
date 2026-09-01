import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

const ITEMS = [
  {
    name: "Vídeo Dedicado",
    detail: "Campanha premium com foco em posicionamento e conversão",
    price: "R$ 1.500",
  },
  {
    name: "Menção Patrocinada",
    detail: "Integração natural para awareness e tráfego qualificado",
    price: "R$ 700",
  },
  {
    name: "Série de Stories",
    detail: "Sequência interativa para aquecimento e ação rápida",
    price: "R$ 1.200",
  },
  {
    name: "Combo Completo",
    detail: "Solução 360° com bônus digital liberado automaticamente",
    price: "R$ 2.500",
    highlight: true,
  },
  {
    name: "Roteiro Estratégico",
    detail: "Ghost Service low-ticket para gravação própria",
    price: "R$ 147",
  },
  {
    name: "Edição Viral",
    detail: "Edição premium para vídeos gravados pelo cliente",
    price: "R$ 297",
  },
  {
    name: "Pack de Criativos",
    detail: "Templates editáveis para campanhas e redes sociais",
    price: "R$ 77",
  },
  {
    name: "Auditoria de Perfil",
    detail: "Diagnóstico estratégico com recomendações práticas",
    price: "R$ 347",
  },
];

export function Pricing() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="valores" className="py-20 sm:py-28 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="08"
          eyebrow="Investimento"
          title="Formatos para diferentes níveis de entrada"
          subtitle="De campanhas premium a produtos estratégicos de entrada, a estrutura foi pensada para ampliar conversão e aumentar valor percebido."
        />

        <div
          ref={ref}
          className="reveal mt-14 rounded-3xl border border-border bg-card/70 backdrop-blur shadow-card overflow-hidden"
        >
          <ul className="divide-y divide-border">
            {ITEMS.map((item) => (
              <li
                key={item.name}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-8 py-6 ${
                  item.highlight
                    ? "bg-gradient-to-r from-primary/10 via-transparent to-transparent"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.highlight && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-orange px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shrink-0">
                        Mais escolhido
                      </span>
                    )}
                    <span className="font-display font-medium text-base sm:text-lg break-words">
                      {item.name}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground flex items-start gap-1.5">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span className="break-words">{item.detail}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs text-muted-foreground">A partir de</div>
                  <div className="font-display font-medium text-2xl sm:text-3xl text-gradient-orange whitespace-nowrap">
                    {item.price}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-card">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Biblioteca Digital
            </div>
            <h3 className="mt-2 font-display text-2xl font-black">
              E-books gratuitos e tripwires
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Materiais de entrada para capturar leads, gerar confiança e criar novas portas de monetização.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-card">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Bônus automáticos
            </div>
            <h3 className="mt-2 font-display text-2xl font-black">
              Mais valor sem aumentar fricção
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Alguns formatos premium liberam materiais extras durante o checkout para aumentar percepção de valor e facilitar a decisão.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            hash="servicos"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-3.5 min-h-11 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition"
          >
            Contratar Agora
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            to="/biblioteca"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 min-h-11 text-sm sm:text-base font-semibold hover:bg-card transition"
          >
            Ver E-books
          </Link>
        </div>
      </div>
    </section>
  );
}
