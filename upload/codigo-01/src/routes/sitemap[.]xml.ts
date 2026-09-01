import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { APPS } from "@/lib/apps-catalog";

const BASE_URL = "https://clodoaldo-silva.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/biblioteca", changefreq: "weekly", priority: "0.9" },
          { path: "/apps", changefreq: "weekly", priority: "0.9" },
          { path: "/sobre", changefreq: "monthly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/termos", changefreq: "yearly", priority: "0.3" },
          { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
          ...APPS.map<SitemapEntry>((a) => ({
            path: `/apoiar/${a.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
