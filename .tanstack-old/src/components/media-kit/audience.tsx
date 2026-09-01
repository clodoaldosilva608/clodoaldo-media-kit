import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";
import { Briefcase, Cpu, LineChart, Sparkles } from "lucide-react";

const INTERESTS = [
  { label: "Empreendedorismo", icon: Briefcase },
  { label: "Tecnologia / IA", icon: Cpu },
  { label: "Finanças Pessoais", icon: LineChart },
  { label: "Desenvolvimento Pessoal", icon: Sparkles },
];

export function Audience() {
  return (
    <section id="audiencia" className="py-20 sm:py-28 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="02"
          eyebrow="Audiência"
          title="Quem me acompanha"
          subtitle="Um público qualificado, em fase de decisão de carreira e investimentos, com alto poder de consumo e influência."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-5">
          <Card title="Gênero">
            <BarRow label="Masculino" value={65} />
            <BarRow label="Feminino" value={35} />
          </Card>

          <Card title="Faixa Etária Principal">
            <BarRow label="25 – 34 anos" value={45} />
            <BarRow label="18 – 24 anos" value={30} />
            <BarRow label="35 – 44 anos" value={18} muted />
            <BarRow label="Outros" value={7} muted />
          </Card>

          <div className="lg:col-span-2">
            <Card title="Interesses Principais">
              <div className="flex flex-wrap gap-3 pt-2">
                {INTERESTS.map((i) => (
                  <span
                    key={i.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-2 text-sm font-medium"
                  >
                    <i.icon size={15} className="text-primary" />
                    {i.label}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal rounded-2xl border border-border bg-card/70 backdrop-blur p-6 sm:p-7 shadow-card"
    >
      <h3 className="font-display font-medium text-lg">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function BarRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className={muted ? "text-muted-foreground" : "text-foreground"}>
          {label}
        </span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-background/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            muted ? "bg-muted-foreground/40" : "bg-gradient-orange"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
