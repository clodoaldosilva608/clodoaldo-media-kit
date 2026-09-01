import { createFileRoute } from "@tanstack/react-router";
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
import { InstallPrompt } from "@/components/pwa/install-prompt";
import heroPortrait from "@/assets/clodoaldo-hero.png.asset.json";
import ogImage from "@/assets/og-image-v2.jpg.asset.json";

const SITE_URL = "https://clodoaldo-silva.lovable.app";
const TITLE = "Clodoaldo Silva — Media Kit 2026 | Serviços, E-books e Parcerias";
const DESCRIPTION =
  "Media Kit oficial de Clodoaldo Silva com parcerias, Ghost Services, produtos digitais e contratação online em poucos passos.";
const OG_IMAGE = `${SITE_URL}${ogImage.url}`;
const HERO_IMAGE = `${SITE_URL}${heroPortrait.url}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Clodoaldo Silva, media kit, influenciador digital, parcerias, ghost services, e-books, marketing de influência",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1216" },
      { property: "og:image:height", content: "640" },
      { property: "og:image:alt", content: "Clodoaldo Silva — Media Kit 2026" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: SITE_URL + "/" },
      {
        rel: "preload",
        as: "image",
        href: heroPortrait.url,
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Clodoaldo Silva",
          jobTitle: "Criador de Conteúdo e Estrategista Digital",
          description: DESCRIPTION,
          url: SITE_URL,
          image: HERO_IMAGE,
          sameAs: [
            "https://www.instagram.com/clodoaldo_c_silva",
            "https://www.tiktok.com/@clodoald_c_silva",
            "https://youtube.com/@clodoaldosilvaa",
          ],
          email: "mailto:clodoaldosilva608@gmail.com",
          knowsAbout: [
            "Conteúdo Digital",
            "Posicionamento de Marca",
            "Performance",
            "Marketing de Influência",
            "Produtos Digitais",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <Hero />
        <Metrics />
        <Audience />
        <Services />
        <LibraryPreview />
        <Ecosystem />
        <Cases />
        <YouTubeSection />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <ShareButton />
      <InstallPrompt />
    </div>
  );
}
