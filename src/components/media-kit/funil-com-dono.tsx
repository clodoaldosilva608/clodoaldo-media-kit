"use client";

import { TrendingUp, Target, BarChart3, ArrowRight } from "lucide-react";

const WHATSAPP_PHONE = "5581920051068";

/**
 * FunilComDono — Seção da landing page inspirada na metodologia Lead2Sales.
 * Mostra os 3 pilares: Aquisição, Conversão, Inteligência.
 * Posiciona o Clodoaldo como consultor de growth (não só "fazedor de site").
 */
export function FunilComDono() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20 md:py-24" id="funil-com-dono">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          Funil com Dono
        </div>
        <h2 className="mt-2 font-display font-medium text-2xl sm:text-3xl md:text-4xl leading-tight">
          Seu funil não tem dono
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
          Na maioria dos negócios, o anúncio funciona mas o caminho até a venda não.
          Eu construo e opero o funil inteiro — do clique à venda — com IA em cada etapa.
        </p>
      </div>

      {/* 3 Pilares */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {/* Pilar 1 — Aquisição */}
        <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pilar · 01
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-medium">Aquisição</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Demanda de leads entrando todo dia, dos canais certos, para o público correto
            e com a comunicação que atrai o seu cliente ideal.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Google Maps + Apify (prospecção automática)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> SEO local (aparecer em 1º nas buscas)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Google Meu Negócio otimizado
            </li>
          </ul>
        </div>

        {/* Pilar 2 — Conversão */}
        <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pilar · 02
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-medium">Conversão</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cada etapa do processo de conversão, do primeiro atendimento até a venda,
            medida e configurada para aumentar eficiência.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Site que converte visita em cliente
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Roteiros de WhatsApp com neurociência
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> IA Copiloto sugere próxima resposta
            </li>
          </ul>
        </div>

        {/* Pilar 3 — Inteligência */}
        <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pilar · 03
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-medium">Inteligência</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cada real de receita rastreado do clique até a venda.
            Relatórios que deixam claras as tomadas de decisão.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Dashboard de vendas em tempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Classificação de leads (quente/morno/frio)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Tracking de cada interação
            </li>
          </ul>
        </div>
      </div>

      {/* Comparison: como a maioria tenta vs como o Funil com Dono cresce */}
      <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Como a maioria tenta */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-6">
          <h4 className="text-sm font-bold text-rose-300 light:text-rose-700 mb-3">❌ Como a maioria tenta crescer</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Gerar mais leads (sem processo)</li>
            <li>• Contratar outra agência</li>
            <li>• Apertar a meta e mexer na comissão</li>
            <li>• Trocar de CRM</li>
            <li>• Colocar mais vendedor</li>
          </ul>
          <p className="mt-3 text-xs text-rose-300 light:text-rose-700 font-semibold">Resultado: mais orçamento, mesmo resultado</p>
        </div>

        {/* Como o Funil com Dono cresce */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
          <h4 className="text-sm font-bold text-emerald-300 light:text-emerald-700 mb-3">✅ Como o Funil com Dono cresce</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Converte os leads que já tem</li>
            <li>• Tem alguém que é Dono do Funil</li>
            <li>• Processo que conecta marketing e vendas</li>
            <li>• Meta estruturada com dados</li>
            <li>• IA em cada ponto de contato</li>
          </ul>
          <p className="mt-3 text-xs text-emerald-300 light:text-emerald-700 font-semibold">Resultado: mais receita, menos custo</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Olá Clodoaldo! Vi sua seção 'Funil com Dono' e quero entender como você pode aplicar no meu negócio.")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
        >
          Vamos analisar seu funil <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
