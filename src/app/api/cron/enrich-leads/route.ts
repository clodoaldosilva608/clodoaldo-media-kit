import { NextRequest, NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";
import { sendTelegram, escapeHtml } from "@/lib/telegram";

/**
 * POST /api/cron/enrich-leads
 *
 * Vercel Cron — roda diariamente ao 13:00 BRT (16:00 UTC).
 * Schedule sugerido: "0 16 * * *"
 *
 * Pra cada lead com site (has_website=true) e sem enriquecimento (enriched_at IS NULL):
 *   1. Crawl HTTP do site do lead
 *   2. Extrai e-mails (regex)
 *   3. Tenta achar nome do dono em /sobre, /contato, /quem-somos
 *   4. Tenta achar Instagram (link pra instagram.com/)
 *   5. Salva em owner_name, owner_email, instagram_handle, enriched_at
 *   6. Manda Telegram com top 3 enriquecidos
 *
 * Auth: protected by CRON_SECRET
 *
 * Limites: 10 leads por run (pra não sobrecarregar).
 */

const MAX_LEADS_PER_RUN = 10;
const HTTP_TIMEOUT_MS = 8000;

interface LeadToEnrich {
  id: string;
  name: string;
  niche: string;
  city: string;
  website: string | null;
  formatted_address: string | null;
}

interface EnrichmentResult {
  owner_name: string | null;
  owner_email: string | null;
  instagram_handle: string | null;
  extra_emails: string[];
  raw_data: any;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const pool = getMeucorrePool();
  const startedAt = Date.now();

  try {
    // Buscar leads com site, sem enriquecimento, com website não-nulo
    const { rows: leads } = await pool.query<LeadToEnrich>(`
      SELECT id, name, niche, city, website, formatted_address
      FROM clodoaldo_prospects
      WHERE has_website = true
        AND website IS NOT NULL
        AND website != ''
        AND enriched_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1
    `, [MAX_LEADS_PER_RUN]);

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum lead pra enriquecer agora",
        enriched_count: 0,
      });
    }

    console.log(`[enrich-leads] ${leads.length} leads pra enriquecer`);

    const enriched: Array<LeadToEnrich & EnrichmentResult> = [];

    for (const lead of leads) {
      try {
        const result = await enrichLead(lead);
        await saveEnrichment(lead.id, result);
        enriched.push({ ...lead, ...result });
        console.log(`[enrich-leads] ✓ ${lead.name}: email=${result.owner_email || "—"} ig=${result.instagram_handle || "—"}`);
      } catch (e: any) {
        console.error(`[enrich-leads] ✗ ${lead.name}:`, e.message);
        // Marcar como tentado mesmo falhando (pra não retentar)
        await pool.query(
          `UPDATE clodoaldo_prospects SET enriched_at = now(), enrichment_data = $2 WHERE id = $1`,
          [lead.id, JSON.stringify({ error: e.message, attempted_at: new Date().toISOString() })]
        );
      }
    }

    // Telegram com top 3
    if (enriched.length > 0 && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const top = enriched.filter(e => e.owner_email || e.instagram_handle).slice(0, 3);
        if (top.length > 0) {
          const lines = top.map(e => {
            const parts = [`<b>${escapeHtml(e.name)}</b>`];
            parts.push(`  Nicho: ${escapeHtml(e.niche)} · ${escapeHtml(e.city)}`);
            if (e.owner_name) parts.push(`  👤 Dono: <code>${escapeHtml(e.owner_name)}</code>`);
            if (e.owner_email) parts.push(`  📧 <code>${escapeHtml(e.owner_email)}</code>`);
            if (e.instagram_handle) parts.push(`  📸 @<code>${escapeHtml(e.instagram_handle)}</code>`);
            parts.push(`  🌐 ${escapeHtml(e.website || "")}`);
            return parts.join("\n");
          });
          const msg = `🧠 <b>Enriquecimento de leads</b>\n${enriched.length} leads enriquecidos agora.\n\nTop ${top.length}:\n\n${lines.join("\n\n")}`;
          await sendTelegram(msg);
        }
      } catch (e: any) {
        console.warn("[enrich-leads] Telegram error:", e.message);
      }
    }

    return NextResponse.json({
      success: true,
      enriched_count: enriched.length,
      total_attempted: leads.length,
      duration_ms: Date.now() - startedAt,
      top: enriched.filter(e => e.owner_email || e.instagram_handle).slice(0, 5).map(e => ({
        name: e.name,
        email: e.owner_email,
        instagram: e.instagram_handle,
        owner: e.owner_name,
      })),
    });
  } catch (e: any) {
    console.error("[enrich-leads] Fatal:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function enrichLead(lead: LeadToEnrich): Promise<EnrichmentResult> {
  const website = normalizeUrl(lead.website!);
  const result: EnrichmentResult = {
    owner_name: null,
    owner_email: null,
    instagram_handle: null,
    extra_emails: [],
    raw_data: { website, crawled_pages: [] as string[], found_emails: [] as string[] },
  };

  // URLs pra tentar crawlear (home + páginas comuns de contato/sobre)
  const pagesToCrawl = [
    website,
    `${website}/sobre`,
    `${website}/contato`,
    `${website}/quem-somos`,
    `${website}/about`,
    `${website}/contact`,
  ];

  const allEmails = new Set<string>();
  const crawledPages: string[] = [];

  for (const url of pagesToCrawl) {
    try {
      const html = await fetchWithTimeout(url);
      if (!html) continue;
      crawledPages.push(url);

      // Extrair e-mails (regex simples)
      const emailMatches = html.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
      for (const email of emailMatches) {
        const lower = email.toLowerCase();
        // Filtrar e-mails genéricos
        if (lower.includes("sentry.io") || lower.includes("wixpress") || lower.includes("cloudflare"))
          continue;
        if (lower.startsWith("noreply") || lower.startsWith("no-reply") || lower.startsWith("donotreply"))
          continue;
        if (lower.includes("example.com") || lower.includes("sentry") || lower.includes("sentry_key"))
          continue;
        allEmails.add(lower);
      }

      // Extrair Instagram
      if (!result.instagram_handle) {
        const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/?/i);
        if (igMatch && igMatch[1] && !["p", "reel", "explore", "accounts", "stories"].includes(igMatch[1].toLowerCase())) {
          result.instagram_handle = igMatch[1];
        }
      }

      // Extrair nome do dono (heurística)
      if (!result.owner_name) {
        result.owner_name = extractOwnerName(html, lead.name);
      }
    } catch (e: any) {
      // Página 404 ou timeout — continuar
    }
  }

  result.raw_data.crawled_pages = crawledPages;
  result.raw_data.found_emails = Array.from(allEmails);

  // Selecionar melhor e-mail (não-genérico, preferencialmente info@, contato@, etc)
  if (allEmails.size > 0) {
    const sorted = Array.from(allEmails).sort((a, b) => {
      // Preferir emails que parecem de contato
      const score = (e: string) => {
        if (e.startsWith("contato@")) return 0;
        if (e.startsWith("info@")) return 1;
        if (e.startsWith("contato.")) return 2;
        if (e.startsWith("admin@")) return 3;
        if (e.startsWith("sac@")) return 4;
        if (e.startsWith("atendimento@")) return 5;
        if (e.startsWith("orcamento@")) return 6;
        if (e.startsWith("vendas@")) return 7;
        // Email com nome do domício (ex: joao@barbearia.com.br) = provavelmente dono
        const domain = (lead.website || "").replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "").split(".")[0];
        if (e.startsWith(domain + "@")) return 8;
        return 100;
      };
      return score(a) - score(b);
    });
    result.owner_email = sorted[0];
    result.extra_emails = sorted.slice(1, 5);
  }

  return result;
}

function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u.replace(/\/$/, "");
}

async function fetchWithTimeout(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ClodoaldoBot/1.0)" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const text = await r.text();
    return text.slice(0, 500_000); // limitar a 500KB
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractOwnerName(html: string, fallbackName: string): string | null {
  // Heurísticas: procurar padrões comuns
  // 1. <title>Tag</title> - pode ter "Barbearia do João" → "João"
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const title = titleMatch[1].trim();
    // Se começa com "Barbearia", "Restaurante", etc. → pega o que vem depois
    const m = title.match(/(?:Barbearia|Restaurante|Pizzaria|Academia|Salão|Salao|Clínica|Clinica|Cafeteria|Hamburgueria|Loja|Pet\s*Shop|Imobiliária|Imobiliaria)\s+(?:do|da|de|dos|das)\s+([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+)?)/);
    if (m && m[1]) return m[1];
  }

  // 2. meta name="author"
  const authorMatch = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  if (authorMatch && authorMatch[1]) return authorMatch[1].trim();

  // 3. Procurar por "Fundado por X", "Proprietário: X", "Dono: X"
  const ownerMatch = html.match(/(?:fundado\s+por|propriet[áa]rio|dono|founder|owner)\s*:?\s*([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+){0,2})/i);
  if (ownerMatch && ownerMatch[1]) return ownerMatch[1].trim();

  // 4. Footer copyright "© 2024 João Silva"
  const copyMatch = html.match(/©\s*\d{4}\s+([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+){0,2})/);
  if (copyMatch && copyMatch[1]) return copyMatch[1].trim();

  return null;
}

async function saveEnrichment(leadId: string, result: EnrichmentResult) {
  const pool = getMeucorrePool();
  await pool.query(
    `UPDATE clodoaldo_prospects
     SET owner_name = $2,
         owner_email = $3,
         instagram_handle = $4,
         enrichment_data = $5,
         enriched_at = now(),
         updated_at = now()
     WHERE id = $1`,
    [
      leadId,
      result.owner_name,
      result.owner_email,
      result.instagram_handle,
      JSON.stringify(result.raw_data),
    ]
  );
}
