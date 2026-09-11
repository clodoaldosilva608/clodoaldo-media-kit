import { NextResponse } from "next/server";
import { PREVIEW_STYLES } from "@/lib/preview-styles";
import { NICHE_CONFIG, DEFAULT_CONFIG } from "@/lib/preview-generator";

/**
 * GET /api/preview/styles?niche=barbearia
 *
 * Returns the 4 niche templates with SVG thumbnails for the carousel selector.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const niche = url.searchParams.get("niche") || "";
    const nicheKey = (niche || "").toLowerCase().trim();
    const cfg = NICHE_CONFIG[nicheKey] || DEFAULT_CONFIG;
    const c = cfg.colors;
    const nicheLabel = nicheKey || "estabelecimento";

    const stylesWithThumbnails = PREVIEW_STYLES.map(style => {
      let svg = "";
      const w = 400, h = 280;

      if (style.id === "split") {
        // Template A: Hero Split (foto + texto lado a lado)
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <rect width="${w}" height="${h}" fill="${c.dark}"/>
          <rect x="0" y="0" width="200" height="${h}" fill="${c.dark}"/>
          <rect x="200" y="0" width="200" height="${h}" fill="${c.primary}" opacity="0.3"/>
          <rect x="200" y="0" width="200" height="${h}" fill="url(#splitGrad)"/>
          <defs><linearGradient id="splitGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${c.dark}" stop-opacity="1"/><stop offset="30%" stop-color="${c.dark}" stop-opacity="0"/></linearGradient></defs>
          <rect x="20" y="60" width="60" height="6" rx="3" fill="${c.primary}"/>
          <text x="20" y="100" font-family="Inter,sans-serif" font-size="20" font-weight="800" fill="#fff">${nicheLabel.slice(0,12)}</text>
          <text x="20" y="120" font-family="Inter,sans-serif" font-size="9" fill="rgba(255,255,255,0.5)">Premium • ${cfg.heroSubtitle("").replace(/^[^•]+•\s*/,"").trim().slice(0,15)}</text>
          <rect x="20" y="140" width="70" height="22" rx="11" fill="${c.primary}"/>
          <rect x="100" y="140" width="60" height="22" rx="11" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)"/>
          <rect x="20" y="180" width="100" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)"/>
          <rect x="130" y="180" width="60" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)"/>
          <circle cx="270" cy="80" r="30" fill="${c.primary}" opacity="0.4"/>
          <rect x="240" y="130" width="120" height="80" rx="8" fill="${c.accent}" opacity="0.3"/>
        </svg>`;
      } else if (style.id === "centered") {
        // Template B: Hero Centered (foto fullscreen + overlay)
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <defs><radialGradient id="centeredGrad" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="${c.primary}" stop-opacity="0.4"/><stop offset="100%" stop-color="${c.dark}" stop-opacity="0"/></radialGradient></defs>
          <rect width="${w}" height="${h}" fill="${c.primary}" opacity="0.2"/>
          <rect width="${w}" height="${h}" fill="url(#centeredGrad)"/>
          <rect width="${w}" height="${h}" fill="${c.dark}" opacity="0.5"/>
          <rect x="150" y="50" width="100" height="6" rx="3" fill="${c.primary}"/>
          <text x="200" y="110" text-anchor="middle" font-family="Inter,sans-serif" font-size="24" font-weight="900" fill="#fff">${nicheLabel.slice(0,12)}</text>
          <text x="200" y="130" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">Premium • Cidade</text>
          <rect x="160" y="150" width="60" height="22" rx="11" fill="${c.primary}"/>
          <rect x="230" y="150" width="50" height="22" rx="11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)"/>
          <rect x="80" y="200" width="80" height="50" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
          <rect x="170" y="200" width="80" height="50" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
          <rect x="260" y="200" width="80" height="50" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
        </svg>`;
      } else if (style.id === "card") {
        // Template C: Hero Card (foto em card flutuante arredondado)
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <rect width="${w}" height="${h}" fill="#f5f0e8"/>
          <rect x="0" y="0" width="200" height="6" fill="${c.primary}" opacity="0.1"/>
          <rect x="30" y="60" width="3" height="20" fill="${c.primary}"/>
          <text x="40" y="75" font-family="Inter,sans-serif" font-size="7" font-weight="700" fill="${c.primary}" letter-spacing="2">PREMIUM</text>
          <text x="30" y="110" font-family="Playfair Display,serif" font-size="22" font-weight="700" fill="#1a1410">${nicheLabel.slice(0,10)}</text>
          <text x="30" y="130" font-family="Playfair Display,serif" font-size="10" font-style="italic" fill="rgba(26,20,16,0.5)">Premium • Cidade</text>
          <rect x="30" y="150" width="70" height="22" fill="${c.primary}"/>
          <rect x="110" y="150" width="60" height="22" fill="transparent" stroke="rgba(26,20,16,0.2)"/>
          <path d="M 240 40 Q 240 20 260 20 L 360 20 Q 380 20 380 40 L 380 200 Q 380 220 360 220 L 260 220 Q 240 220 240 200 Z" fill="${c.primary}" opacity="0.3"/>
          <rect x="250" y="60" width="120" height="120" rx="60 60 12 12" fill="${c.accent}" opacity="0.4"/>
          <rect x="220" y="180" width="50" height="40" rx="8" fill="${c.primary}"/>
          <text x="245" y="200" text-anchor="middle" font-family="Playfair Display,serif" font-size="14" font-weight="700" fill="#f5f0e8">★</text>
          <rect x="30" y="210" width="160" height="3" fill="rgba(184,154,106,0.2)"/>
        </svg>`;
      } else if (style.id === "minimal") {
        // Template D: Hero Minimal (sem foto, tipografia gigante)
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <rect width="${w}" height="160" fill="${c.primary}"/>
          <rect width="${w}" height="120" y="160" fill="${c.dark}"/>
          <rect x="30" y="30" width="50" height="14" fill="${c.dark}"/>
          <text x="30" y="100" font-family="Inter,sans-serif" font-size="38" font-weight="900" fill="${c.dark}" letter-spacing="-2">${nicheLabel.slice(0,8)}.</text>
          <text x="30" y="125" font-family="Inter,sans-serif" font-size="11" fill="${c.dark}" opacity="0.6">Premium • Cidade</text>
          <rect x="30" y="135" width="70" height="18" fill="${c.dark}"/>
          <rect width="${w}" height="20" y="160" fill="${c.accent}"/>
          <text x="200" y="175" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="900" fill="${c.dark}" letter-spacing="2">/ ${nicheLabel.toUpperCase()} /</text>
          <rect x="30" y="200" width="100" height="50" fill="transparent" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
          <rect x="150" y="200" width="100" height="50" fill="transparent" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
          <rect x="270" y="200" width="100" height="50" fill="transparent" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
          <text x="80" y="230" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" fill="${c.primary}">01</text>
          <text x="200" y="230" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" fill="${c.primary}">02</text>
          <text x="320" y="230" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" fill="${c.primary}">03</text>
        </svg>`;
      }

      return {
        id: style.id,
        name: style.name,
        description: style.description,
        emoji: style.emoji,
        thumbnail: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      };
    });

    return NextResponse.json({
      styles: stylesWithThumbnails,
      niche: nicheKey || "default",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, styles: [] }, { status: 500 });
  }
}
