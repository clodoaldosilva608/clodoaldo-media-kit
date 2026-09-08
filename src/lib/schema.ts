/**
 * JSON-LD structured data schemas para SEO.
 */

import { APPS, type AppItem } from "./apps-catalog";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Clodoaldo Silva",
    url: "https://clodoaldo.vercel.app",
    image: "https://clodoaldo.vercel.app/assets/clodoaldo-hero.webp",
    jobTitle: "Criador e desenvolvedor digital",
    description:
      "Criador, desenvolvedor e estrategista digital. Transforma ideias em produtos reais desde 2016.",
    sameAs: [
      "https://www.instagram.com/clodoaldo_c_silva",
      "https://www.tiktok.com/@clodoald_c_silva",
      "https://youtube.com/@clodoaldosilvaa",
    ],
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Clodoaldo Silva",
    url: "https://clodoaldo.vercel.app",
    logo: "https://clodoaldo.vercel.app/assets/clodoaldo-logo.webp",
    founder: { "@type": "Person", name: "Clodoaldo Silva" },
    foundingDate: "2016",
    description:
      "Ecossistema digital que combina criação de conteúdo, desenvolvimento de apps e serviços de estratégia.",
    sameAs: [
      "https://www.instagram.com/clodoaldo_c_silva",
      "https://www.tiktok.com/@clodoald_c_silva",
      "https://youtube.com/@clodoaldosilvaa",
    ],
  };
}

export function faqPageSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function softwareApplicationSchema(app: AppItem) {
  if (app.status === "conceito" || app.status === "em-desenvolvimento") return null;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.description,
    url: app.demoUrl,
    applicationCategory: app.category,
    operatingSystem: "Web",
  };
}

export function serializeSchema(schema: object): string {
  return JSON.stringify(schema);
}
