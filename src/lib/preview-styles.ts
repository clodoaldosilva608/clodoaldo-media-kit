/**
 * Sistema de templates de preview — 4 templates distintos por nicho.
 *
 * Cada nicho tem 4 templates visualmente diferentes:
 * - "split"    — Hero split (foto + texto lado a lado)
 * - "centered" — Hero centered (foto fullscreen + overlay)
 * - "card"     — Hero card (foto em card flutuante arredondado)
 * - "minimal"  — Hero minimal (sem foto no hero, tipografia gigante)
 *
 * Os 4 templates compartilham o conteúdo do nicho (features, depoimentos, etc.)
 * mas têm layouts, paletas e estruturas visualmente diferentes.
 */

import { renderTemplateA, renderTemplateB, renderTemplateC, renderTemplateD } from "./niche-templates";

export interface StyleContext {
  lead: {
    name: string;
    formatted_address?: string;
    phone?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    rating?: number | null;
    user_ratings_total?: number | null;
    lat?: number;
    lng?: number;
  };
  wa: string;
  maps: string;
  embed: string;
  n: string;
  city: string;
}

export interface NicheConfig {
  colors: { primary: string; accent: string; dark: string; light: string };
  heroBadge: string;
  heroTitle: (name: string) => string;
  heroSubtitle: (city: string) => string;
  searchPlaceholder: string;
  marqueeWords: string[];
  categoryPills: string[];
  sectionTitle: string;
  sectionSub: string;
  features: { emoji: string; tag: string; title: string; desc: string }[];
  testimonials: { name: string; text: string; rating: number }[];
  aboutText: (name: string, niche: string, city: string, rating?: number | null, total?: number | null) => string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  galleryEmojis: string[];
}

export interface PreviewStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  render: (cfg: NicheConfig, ctx: StyleContext) => string;
}

// =====================================================
// 4 TEMPLATES DISTINTOS POR NICHO
// =====================================================
const templateSplit: PreviewStyle = {
  id: "split",
  name: "Hero Split",
  description: "Foto + texto lado a lado, layout moderno",
  emoji: "📐",
  render: renderTemplateA,
};

const templateCentered: PreviewStyle = {
  id: "centered",
  name: "Hero Centered",
  description: "Foto fullscreen com overlay, tipografia centralizada",
  emoji: "🎯",
  render: renderTemplateB,
};

const templateCard: PreviewStyle = {
  id: "card",
  name: "Hero Card",
  description: "Foto em card flutuante arredondado, estilo elegante",
  emoji: "🎴",
  render: renderTemplateC,
};

const templateMinimal: PreviewStyle = {
  id: "minimal",
  name: "Hero Minimal",
  description: "Sem foto no hero, tipografia gigante, ousado",
  emoji: "⚡",
  render: renderTemplateD,
};

// =====================================================
// EXPORTS
// =====================================================
export const PREVIEW_STYLES: PreviewStyle[] = [
  templateSplit,
  templateCentered,
  templateCard,
  templateMinimal,
];

export function getStyleById(id: string): PreviewStyle {
  return PREVIEW_STYLES.find(s => s.id === id) || PREVIEW_STYLES[0];
}
