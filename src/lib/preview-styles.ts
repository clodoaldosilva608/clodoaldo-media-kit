/**
 * Estilos de design premium para previews de site.
 *
 * 4 estilos originais com fotos reais (Unsplash), fontes premium (Google Fonts)
 * e animações sofisticadas:
 * 1. "dark" — Dark Premium (glassmorphism, fotos fullscreen, Space Grotesk)
 * 2. "light" — Light Minimal (fundo claro, Sora, whitespace generoso)
 * 3. "bold" — Bold Editorial (fotos fullscreen, tipografia gigante, ousado)
 * 4. "elegant" — Elegant Classic (Playfair Display, serifas, fotos elegantes)
 */

import { renderDarkPremium } from "./styles/dark-premium";
import { renderLightMinimal } from "./styles/light-minimal";
import { renderBoldEditorial } from "./styles/bold-editorial";
import { renderElegantClassic } from "./styles/elegant-classic";

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
// ESTILOS PREMIUM (com fotos reais, fontes premium, animações)
// =====================================================
const styleDark: PreviewStyle = {
  id: "dark",
  name: "Dark Premium",
  description: "Glassmorphism, fotos fullscreen, fontes Space Grotesk + Inter",
  emoji: "🌙",
  render: renderDarkPremium,
};

const styleLight: PreviewStyle = {
  id: "light",
  name: "Light Minimal",
  description: "Fundo claro, tipografia Sora, whitespace generoso, fotos reais",
  emoji: "☀️",
  render: renderLightMinimal,
};

const styleBold: PreviewStyle = {
  id: "bold",
  name: "Bold Editorial",
  description: "Fotos fullscreen, tipografia gigante, layout ousado",
  emoji: "🔥",
  render: renderBoldEditorial,
};

const styleElegant: PreviewStyle = {
  id: "elegant",
  name: "Elegant Classic",
  description: "Playfair Display, serifas, fotos elegantes, paleta sofisticada",
  emoji: "🎩",
  render: renderElegantClassic,
};

// =====================================================
// EXPORTS
// =====================================================
export const PREVIEW_STYLES: PreviewStyle[] = [styleDark, styleLight, styleBold, styleElegant];

export function getStyleById(id: string): PreviewStyle {
  return PREVIEW_STYLES.find(s => s.id === id) || PREVIEW_STYLES[0];
}
