import type { Metadata } from "next";
import { Filter, Lock, ExternalLink, Sparkles } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { CASE_STUDIES, CASE_CATEGORY_LABELS, CASE_CATEGORY_COLORS, type CaseCategory } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Resultados — Cases estruturados | Clodoaldo Silva",
  description: "Cases reais com contexto, problema, estratégia, execução, métrica e resultado. Transparência total.",
  alternates: { canonical: "https://clodoaldo.vercel.app/resultados" },
  openGraph: { title: "Resultados — Clodoaldo Silva", description: "Cases estruturados com transparência total.", url: "https://clodoaldo.vercel.app/resultados" },
};

const CATEGORIES: Array<{ id: CaseCategory | "todos"; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "posicionamento", label: "Posicionamento" },
  { id: "conteudo", label: "Conteúdo" },
  { id: "conversao", label: "Conversão" },
  { id: "produto-digital", label: "Produto digital" },
  { id: "desenvolvimento", label: "Desenvolvimento" },
];

export default function ResultadosPage() {
  const authorizedCases = CASE_STUDIES.filter((c) => c.authorized);
  const pendingCases = CASE_STUDIES.filter((c) => !c.authorized);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-5xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Resultados</div>
        <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl leading-tight">Cases estruturados com transparência</h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Cada case segue um modelo fixo: <strong>contexto, problema, estratégia, execução, período, métrica de base, resultado e evidência</strong>. Nada de número solto sem contexto — se não tem autorização para publicar, fica marcado como anonimizado.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground mr-2">Filtrar por categoria:</span>
          {CATEGORIES.map((cat) => (
            <span key={cat.id} className={`rounded-full border px-3 py-1 ${cat.id === "todos" ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card/40 text-muted-foreground"}`}>{cat.label}</span>
          ))}
        </div>

        {authorizedCases.length > 0 && (
          <section className="mt-10 space-y-6">
            <h2 className="font-display font-bold text-xl sm:text-2xl">Cases autorizados ({authorizedCases.length})</h2>
            {authorizedCases.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </section>
        )}

        {pendingCases.length > 0 && (
          <section className="mt-10">
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-amber-300 light:text-amber-700 font-semibold">
                <Lock size={18} />
                <h2 className="font-display font-bold text-lg">Aguardando cases autorizados</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Esta seção está estruturada para receber cases reais com modelo fixo (contexto → problema → estratégia → execução → métrica → resultado → evidência). Nenhum case será exibido como real sem autorização explícita do cliente.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Se você é cliente e quer autorizar a publicação do seu case (com ou sem identificação), me chama no WhatsApp — combinamos o que pode ser compartilhado.
              </p>
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-display font-bold text-xl sm:text-2xl mb-4">Método aplicado em cada case</h2>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { n: 1, t: "Diagnóstico" },
              { n: 2, t: "Estratégia" },
              { n: 3, t: "Produção" },
              { n: 4, t: "Publicação" },
              { n: 5, t: "Análise" },
              { n: 6, t: "Otimização" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card/60 p-4 text-center">
                <div className="font-display font-bold text-2xl text-primary">{s.n}</div>
                <div className="mt-1 text-xs font-semibold text-foreground">{s.t}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 text-center">
          <h2 className="font-display font-bold text-2xl">Quer ser o próximo case?</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">Cada trabalho bem-sucedido pode virar case (com sua autorização). Bora construir algo que dê orgulho de mostrar?</p>
          <a href="https://wa.me/5581920051068?text=Ol%C3%A1!%20Quero%20conversar%20sobre%20um%20projeto." target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow">
            <Sparkles size={16} /> Vamos conversar
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CaseCard({ c }: { c: (typeof CASE_STUDIES)[number] }) {
  return (
    <article className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${CASE_CATEGORY_COLORS[c.category]}`}>{CASE_CATEGORY_LABELS[c.category]}</span>
          <h3 className="mt-2 font-display font-bold text-xl sm:text-2xl">{c.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{c.anonymized ? "Case anonimizado · " : ""}{c.clientCategory} · {c.period}</p>
        </div>
        {!c.authorized && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 light:text-amber-700">
            <Lock size={10} /> Sem autorização
          </span>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <CaseField label="Contexto" value={c.context} />
        <CaseField label="Problema" value={c.problem} />
        <CaseField label="Estratégia" value={c.strategy} />
        <CaseField label="Execução" value={c.execution} />
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-background/40 p-4 grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Métrica de base</div>
          <div className="mt-1 text-sm text-foreground/90">{c.baseMetric}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Resultado</div>
          <div className="mt-1 text-sm text-foreground/90 font-semibold">{c.result}</div>
        </div>
      </div>
      {c.evidence && (
        <a href={c.evidence} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
          <ExternalLink size={12} /> Ver evidência
        </a>
      )}
    </article>
  );
}

function CaseField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{value}</p>
    </div>
  );
}
