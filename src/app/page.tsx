import { Audience } from "@/components/media-kit/audience";
import { Cases } from "@/components/media-kit/cases";
import { Contact } from "@/components/media-kit/contact";
import { Ecosystem } from "@/components/media-kit/ecosystem";
import { Footer } from "@/components/media-kit/footer";
import { Header } from "@/components/media-kit/header";
import { Hero } from "@/components/media-kit/hero";
import { LibraryPreview } from "@/components/media-kit/library-preview";
import { Metrics } from "@/components/media-kit/metrics";
import { Pricing } from "@/components/media-kit/pricing";
import { Services } from "@/components/media-kit/services";
import { ShareButton } from "@/components/media-kit/share-button";
import { YouTubeSection } from "@/components/media-kit/youtube";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { SocialProofCarousel } from "@/components/site/social-proof-carousel";
import { AffiliateTrackerWrapper } from "@/components/site/affiliate-tracker-wrapper";
import { QuizCTASection } from "@/components/quiz/quiz-cta";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AffiliateTrackerWrapper />
      <Header />
      <main id="main-content">
        <Hero />
        {/* Quiz CTA — chamada principal para o quiz de recomendação */}
        <QuizCTASection />
        <Metrics />
        <Audience />
        <Services />
        <LibraryPreview />
        <Ecosystem />
        <Cases />
        <YouTubeSection />
        <Pricing />
        {/* Prova social — depoimentos de clientes */}
        <section className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24" id="depoimentos">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Provas sociais</div>
            <h2 className="mt-2 font-display font-medium text-3xl sm:text-4xl">
              Como quem trabalhou comigo se sentiu
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Depoimentos reais de pessoas que confiaram no processo. O sentimento é o que importa — o resultado é consequência.
            </p>
          </div>
          <SocialProofCarousel />
          {/* Carrossel adicional do banco (testimonials cadastrados via admin) */}
          <div className="mt-8">
            <TestimonialCarousel limit={6} />
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
      <ShareButton />
    </div>
  );
}
