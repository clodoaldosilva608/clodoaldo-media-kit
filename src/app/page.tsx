import { Audience } from "@/components/media-kit/audience";
import { Cases } from "@/components/media-kit/cases";
import { Contact } from "@/components/media-kit/contact";
import { Ecosystem } from "@/components/media-kit/ecosystem";
import { Footer } from "@/components/media-kit/footer";
import { Header } from "@/components/media-kit/header";
import { Hero } from "@/components/media-kit/hero";
import { LibraryPreview } from "@/components/media-kit/library-preview";
import { Method } from "@/components/media-kit/method";
import { Metrics } from "@/components/media-kit/metrics";
import { Pricing } from "@/components/media-kit/pricing";
import { ProductsCatalog } from "@/components/media-kit/products-catalog";
import { FunilComDono } from "@/components/media-kit/funil-com-dono";
import { Services } from "@/components/media-kit/services";
import { ShareButton } from "@/components/media-kit/share-button";
import { WhyMe } from "@/components/media-kit/why-me";
import { YouTubeSection } from "@/components/media-kit/youtube";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { SocialProofCarousel } from "@/components/site/social-proof-carousel";
import { AffiliateTrackerWrapper } from "@/components/site/affiliate-tracker-wrapper";
import { QuizCTASection } from "@/components/quiz/quiz-cta";
import { ASSETS } from "@/lib/asset-urls";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AffiliateTrackerWrapper />
      <Header />
      <main id="main-content">
        {/* 1. Proposta de valor — Hero com globo 3D + microprova */}
        <Hero />

        {/* 2. Para quem é — Quem sou eu (foto + bio) */}
        <section className="relative py-12 sm:py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Quem sou eu
                </div>
                <h2 className="mt-3 font-display font-medium text-2xl sm:text-3xl md:text-4xl leading-tight">
                  Clodoaldo Silva
                </h2>
                <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                  Criador, desenvolvedor e estrategista digital. Há quase uma década
                  transforma ideias em produtos reais — apps, ferramentas, conteúdos
                  e soluções sob medida para quem quer sair do lugar.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Não vende fórmula mágica. O trabalho é guiado por método, clareza e
                  respeito pela pessoa do outro. Cada projeto é pensado pra resolver
                  uma dor específica — não pra encaixar em um template genérico.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href="/sobre"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 sm:px-5 py-2 sm:py-2.5 min-h-11 text-xs sm:text-sm font-semibold text-primary light:text-orange-800 hover:bg-primary/20 transition"
                  >
                    Conhecer minha história
                  </a>
                  <a
                    href="/quiz"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 sm:px-5 py-2 sm:py-2.5 min-h-11 text-xs sm:text-sm font-semibold text-foreground hover:border-primary/50 transition"
                  >
                    Fazer o quiz de recomendação
                  </a>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <figure className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ASSETS.clodoaldoHero}
                      alt="Clodoaldo Silva — criador e desenvolvedor digital"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(120% 80% at 50% 20%, transparent 40%, oklch(0.12 0.004 60 / 0.55) 100%)",
                      }}
                    />
                  </div>
                  <figcaption className="mt-3 flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Retrato oficial</span>
                    <span>Desde 2016</span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Descoberta guiada — Quiz CTA */}
        <QuizCTASection />

        {/* 4. Principais soluções — Services (antes do Method) */}
        <Services />

        {/* 5. Por que trabalhar comigo — diferenciais */}
        <WhyMe />

        {/* 6. Prova de resultados — Cases (antes do Method) */}
        <Cases />

        {/* 7. Números de resultado — Metrics */}
        <Metrics />

        {/* 8. Como funciona — Método em 5 etapas */}
        <Method />

        {/* 9. Funil com Dono — metodologia de growth */}
        <FunilComDono />

        {/* 10. Catálogo de produtos — 9 produtos com PIX + WhatsApp */}
        <ProductsCatalog />

        {/* 11. Planos e preços */}
        <Pricing />

        {/* 12. Ecossistema de apps */}
        <Ecosystem />

        {/* 13. Biblioteca de e-books e conteúdos */}
        <LibraryPreview />

        {/* 14. YouTube */}
        <YouTubeSection />

        {/* 15. Audiência / público */}
        <Audience />

        {/* 16. Prova social — depoimentos de clientes */}
        <section className="mx-auto max-w-5xl px-5 sm:px-8 py-12 sm:py-16 md:py-24" id="depoimentos">
          <div className="text-center mb-8 sm:mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Provas sociais</div>
            <h2 className="mt-2 font-display font-medium text-2xl sm:text-3xl md:text-4xl leading-tight">
              Como quem trabalhou comigo se sentiu
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Depoimentos reais de pessoas que confiaram no processo. O sentimento é o que importa — o resultado é consequência.
            </p>
          </div>
          <SocialProofCarousel />
          <div className="mt-6 sm:mt-8">
            <TestimonialCarousel limit={6} />
          </div>
        </section>

        {/* 17. CTA final */}
        <Contact />
      </main>
      <Footer />
      <ShareButton />
    </div>
  );
}
