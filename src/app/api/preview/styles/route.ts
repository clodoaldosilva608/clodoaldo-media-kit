import { NextResponse } from "next/server";
import { listPreviewStyles } from "@/lib/preview-generator";
import { PREVIEW_STYLES } from "@/lib/preview-styles";
import { NICHE_CONFIG, DEFAULT_CONFIG } from "@/lib/preview-generator";

/**
 * GET /api/preview/styles?niche=barbearia
 *
 * Returns the list of available preview styles with SVG thumbnails
 * (mini previews) for the carousel selector in the admin.
 *
 * Each thumbnail is an SVG that visually represents the style's aesthetic
 * using the niche's colors, so the user can preview before clicking.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const niche = url.searchParams.get("niche") || "";
    const nicheKey = (niche || "").toLowerCase().trim();
    const cfg = NICHE_CONFIG[nicheKey] || DEFAULT_CONFIG;
    const c = cfg.colors;

    // Generate SVG thumbnail for each style
    const stylesWithThumbnails = PREVIEW_STYLES.map(style => {
      let svg = "";
      const w = 400, h = 280;

      if (style.id === "dark") {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <defs>
            <radialGradient id="g1" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stop-color="${c.primary}" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="${c.dark}" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="${w}" height="${h}" fill="${c.dark}"/>
          <rect width="${w}" height="${h}" fill="url(#g1)"/>
          <rect x="160" y="80" width="80" height="6" rx="3" fill="${c.primary}" opacity="0.6"/>
          <text x="200" y="130" text-anchor="middle" font-family="Inter,sans-serif" font-size="22" font-weight="900" fill="#fff">BARBEARIA</text>
          <text x="200" y="152" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="rgba(255,255,255,0.5)">Premium • Recife</text>
          <rect x="140" y="170" width="60" height="24" rx="12" fill="${c.primary}"/>
          <rect x="210" y="170" width="60" height="24" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)"/>
          <rect x="0" y="240" width="${w}" height="40" fill="${c.primary}"/>
          <text x="200" y="265" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="800" fill="${c.dark}" letter-spacing="3">CORTE • BARBA • ESTILO</text>
        </svg>`;
      } else if (style.id === "light") {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <rect width="${w}" height="${h}" fill="#fafafa"/>
          <rect x="0" y="0" width="${w}" height="50" fill="#fff" stroke="#eee"/>
          <circle cx="30" cy="25" r="8" fill="${c.primary}"/>
          <rect x="250" y="18" width="60" height="14" rx="7" fill="#0a0a0a"/>
          <text x="200" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="28" font-weight="900" fill="#0a0a0a">BARBEARIA</text>
          <text x="200" y="145" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#666">Premium • Recife</text>
          <rect x="155" y="165" width="50" height="20" rx="10" fill="#0a0a0a"/>
          <rect x="215" y="165" width="50" height="20" rx="10" fill="#fff" stroke="#ddd"/>
          <rect x="60" y="210" width="80" height="50" rx="8" fill="#fff" stroke="#eee"/>
          <rect x="160" y="210" width="80" height="50" rx="8" fill="#fff" stroke="#eee"/>
          <rect x="260" y="210" width="80" height="50" rx="8" fill="#fff" stroke="#eee"/>
          <circle cx="100" cy="235" r="10" fill="${c.primary}" opacity="0.3"/>
          <circle cx="200" cy="235" r="10" fill="${c.primary}" opacity="0.3"/>
          <circle cx="300" cy="235" r="10" fill="${c.primary}" opacity="0.3"/>
        </svg>`;
      } else if (style.id === "bold") {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <rect width="${w}" height="180" fill="${c.primary}"/>
          <rect width="${w}" height="100" y="180" fill="${c.dark}"/>
          <text x="30" y="100" font-family="Inter,sans-serif" font-size="44" font-weight="900" fill="${c.dark}" letter-spacing="-2">BARBEARIA</text>
          <text x="30" y="125" font-family="Inter,sans-serif" font-size="13" fill="${c.dark}" opacity="0.6">Premium • Recife</text>
          <rect x="30" y="145" width="70" height="22" fill="${c.dark}"/>
          <text x="65" y="160" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="800" fill="#fff" letter-spacing="2">PEDIR</text>
          <rect x="110" y="145" width="70" height="22" fill="transparent" stroke="${c.dark}" stroke-width="2"/>
          <rect width="${w}" height="24" y="180" fill="${c.accent}"/>
          <text x="200" y="197" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="900" fill="${c.dark}" letter-spacing="2">/ CORTE / BARBA / ESTILO /</text>
          <rect x="30" y="220" width="100" height="40" fill="transparent" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
          <rect x="150" y="220" width="100" height="40" fill="transparent" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
          <rect x="270" y="220" width="100" height="40" fill="transparent" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
          <text x="80" y="244" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" fill="${c.primary}">✂</text>
          <text x="200" y="244" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" fill="${c.primary}">🧔</text>
          <text x="320" y="244" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" fill="${c.primary}">💈</text>
        </svg>`;
      } else if (style.id === "elegant") {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <rect width="${w}" height="${h}" fill="#1a1410"/>
          <line x1="150" y1="60" x2="190" y2="60" stroke="${c.primary}" stroke-width="1"/>
          <text x="200" y="65" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="${c.primary}" letter-spacing="3">PREMIUM</text>
          <line x1="210" y1="60" x2="250" y2="60" stroke="${c.primary}" stroke-width="1"/>
          <text x="200" y="115" text-anchor="middle" font-family="Playfair Display,serif" font-size="30" font-weight="700" fill="#f5f0e8">Barbearia</text>
          <text x="200" y="140" text-anchor="middle" font-family="Playfair Display,serif" font-size="13" font-style="italic" fill="rgba(245,240,232,0.5)">Premium • Recife</text>
          <rect x="155" y="160" width="60" height="22" fill="${c.primary}"/>
          <text x="185" y="175" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="#1a1410" letter-spacing="2">AGENDAR</text>
          <rect x="225" y="160" width="60" height="22" fill="transparent" stroke="rgba(245,240,232,0.3)"/>
          <text x="255" y="175" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="#f5f0e8" letter-spacing="2">MAPS</text>
          <line x1="100" y1="210" x2="300" y2="210" stroke="rgba(184,154,106,0.2)"/>
          <text x="200" y="235" text-anchor="middle" font-family="Playfair Display,serif" font-size="11" font-style="italic" fill="rgba(245,240,232,0.4)">Sobre Nós</text>
          <line x1="100" y1="250" x2="300" y2="250" stroke="rgba(184,154,106,0.2)"/>
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
