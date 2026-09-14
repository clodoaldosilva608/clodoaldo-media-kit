import type { MetadataRoute } from "next";

/**
 * robots.ts — Next.js auto-gera /robots.txt a partir deste arquivo.
 *
 * Regras:
 * - Permite crawl de tudo (páginas públicas, produtos, biblioteca)
 * - Bloqueia /admin, /api, /auth, /checkout (não devem ser indexados)
 * - Referencia o sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/auth",
          "/auth/*",
          "/checkout",
          "/checkout/*",
          "/aprovar",
          "/aprovar/*",
          "/fila",
          "/fila/*",
        ],
      },
    ],
    sitemap: "https://clodoaldo.vercel.app/sitemap.xml",
    host: "https://clodoaldo.vercel.app",
  };
}
