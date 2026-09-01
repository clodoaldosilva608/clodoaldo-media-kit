// One-off script — reads the 7 uploaded ebooks and inserts them via
// Supabase service role (RLS bypass). Idempotent per slug.
// Run: node scripts/ingest-knowledge-hub.mjs
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { createClient } from "@supabase/supabase-js";

const EBOOKS = [
  {
    slug: "ebook-guia-briefing-viral",
    html: "/tmp/ebooks/guia-briefing-viral-web.html",
    title: "O Guia do Briefing Viral",
    description:
      "Guia rápido para criar briefings mais claros, estratégicos e prontos para gerar campanhas que performam melhor.",
    cover_url: "/__l5e/assets-v1/7d823698-d46d-48a0-9ef0-d1fd30ad5123/ebook-guia-briefing-viral.webp",
    category: "E-book",
    type: "ebook",
    access_type: "free",
    price_cents: 0,
  },
  {
    slug: "ebook-30-ganchos-reels",
    html: "/tmp/ebooks/30-ganchos-para-reels-web.html",
    title: "30 Ganchos para Reels",
    description:
      "Coleção prática de ganchos para vídeos curtos pensados para captar atenção mais rápido e aumentar retenção.",
    cover_asset: "src/assets/ebook-30-ganchos-reels.webp.asset.json",
    category: "E-book",
    type: "ebook",
    access_type: "one_time",
    price_cents: 2990,
  },
  {
    slug: "ebook-manual-edicao-premium",
    html: "/tmp/ebooks/manual-edicao-premium-web.html",
    title: "Manual da Edição Premium",
    description:
      "Manual com fundamentos e técnicas práticas para elevar a qualidade das suas edições no celular e vender melhor com vídeo.",
    cover_asset: "src/assets/ebook-manual-edicao-premium.webp.asset.json",
    category: "E-book",
    type: "ebook",
    access_type: "one_time",
    price_cents: 1990,
  },
  {
    slug: "ebook-storytelling-magnetico",
    html: "/tmp/ebooks/storytelling-magnetico-web.html",
    title: "Storytelling Magnético",
    description:
      "A arte de contar histórias que atraem, conectam e deixam legado. Frameworks e gatilhos para transformar palavras em conexão real.",
    cover_asset: "src/assets/ebook-storytelling-magnetico.jpg.asset.json",
    category: "E-book",
    type: "ebook",
    access_type: "one_time",
    price_cents: 1990,
  },
  {
    slug: "ebook-ia-criadores",
    html: "/tmp/ebooks/ia-para-criadores-web.html",
    title: "IA para Criadores de Conteúdo",
    description:
      "Ferramentas, estratégias e automações para criar mais, melhor e com inteligência. O futuro é o seu conteúdo — com IA como aliada.",
    cover_asset: "src/assets/ebook-ia-criadores.jpg.asset.json",
    category: "E-book",
    type: "ebook",
    access_type: "one_time",
    price_cents: 2490,
  },
  {
    slug: "ebook-networking-marcas",
    html: "/tmp/ebooks/guia-networking-marcas-web.html",
    title: "Guia de Networking com Marcas",
    description:
      "Estratégias para construir conexões reais com marcas, gerar oportunidades de valor e transformar relacionamento em parceria comercial.",
    cover_asset: "src/assets/ebook-networking-marcas.jpg.asset.json",
    category: "E-book",
    type: "ebook",
    access_type: "free",
    price_cents: 0,
  },
  {
    slug: "pack-prompts-premium",
    html: "/tmp/ebooks/pack-prompts-premium-web.html",
    title: "Pack de Prompts Premium",
    description:
      "Coleção exclusiva de prompts probados, otimizados e prontos para usar em ChatGPT, Gemini e Claude — para creators e negócios.",
    cover_asset: "src/assets/ebook-pack-prompts.jpg.asset.json",
    category: "Pack",
    type: "prompt_pack",
    access_type: "one_time",
    price_cents: 2700,
  },
];

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function sqlStr(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function loadCoverUrl(e) {
  if (e.cover_url) return e.cover_url;
  const j = JSON.parse(fs.readFileSync(path.resolve(e.cover_asset), "utf8"));
  return j.url;
}

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.remove(["script", "style", "noscript"]);

function splitChapters(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  // Strip decorative elements
  doc.querySelectorAll(".watermark, #progress, .scroll-cue, header nav, footer, img, svg, picture").forEach((n) => n.remove());

  const h2s = Array.from(doc.querySelectorAll("h2"));
  const chapters = [];

  // Hero title as ebook subtitle — skip; we already have title in config.
  h2s.forEach((h2, idx) => {
    const title = h2.textContent.trim().replace(/\s+/g, " ");
    // Collect siblings until next h2
    const parts = [];
    let n = h2.nextElementSibling;
    while (n && n.tagName !== "H2") {
      parts.push(n.outerHTML);
      n = n.nextElementSibling;
    }
    const bodyHtml = parts.join("\n");
    const md = td.turndown(bodyHtml).trim();
    chapters.push({ title, md, idx });
  });
  return chapters;
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

for (const e of EBOOKS) {
  const chapters = splitChapters(e.html);
  const words = chapters.reduce((a, c) => a + c.md.split(/\s+/).length, 0);
  const minutes = Math.max(5, Math.round(words / 220));
  const cover = loadCoverUrl(e);

  const { data: item, error: itemErr } = await supabase
    .from("knowledge_items")
    .upsert(
      {
        slug: e.slug,
        title: e.title,
        description: e.description,
        cover_url: cover,
        category: e.category,
        type: e.type,
        access_type: e.access_type,
        price_cents: e.price_cents,
        currency: "brl",
        estimated_minutes: minutes,
        difficulty: "intermediario",
        status: "published",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (itemErr) {
    console.error(`✖ item ${e.slug}:`, itemErr);
    process.exit(1);
  }

  // Wipe existing chapters for a clean re-import (idempotent, order stable).
  const { error: delErr } = await supabase.from("knowledge_chapters").delete().eq("knowledge_id", item.id);
  if (delErr) {
    console.error(`✖ delete chapters ${e.slug}:`, delErr);
    process.exit(1);
  }

  const rows = chapters.map((c, i) => {
    const cslug = slugify(c.title) || `capitulo-${i + 1}`;
    const isIntro = /introdu[çc][ãa]o/i.test(c.title);
    return {
      knowledge_id: item.id,
      slug: cslug,
      title: c.title,
      content_md: c.md,
      order_index: i,
      is_preview: isIntro || i === 0 || i === 1,
    };
  });

  // Dedupe slugs within one ebook (some HTMLs repeat headings)
  const seen = new Set();
  for (const r of rows) {
    let s = r.slug;
    let n = 2;
    while (seen.has(s)) s = `${r.slug}-${n++}`;
    r.slug = s;
    seen.add(s);
  }

  const { error: chErr } = await supabase.from("knowledge_chapters").insert(rows);
  if (chErr) {
    console.error(`✖ chapters ${e.slug}:`, chErr);
    process.exit(1);
  }

  console.log(`✔ ${e.slug} — ${chapters.length} caps, ${minutes} min`);
}


