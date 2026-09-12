import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/generate-site-prompt
 *
 * Gera um prompt completo de criação de site baseado nos dados do lead.
 * O prompt pode ser colado em qualquer plataforma AI (ChatGPT, Claude,
 * Lovable, v0, Bolt.new, etc).
 *
 * Body: { lead_id: string }
 * Response: { prompt: string, platforms: Array<{ name, url, method }> }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id } = body;
    if (!lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

    const sb: any = getSupabaseServer();
    const { data: lead, error } = await sb.from("crm_leads")
      .select("*")
      .eq("id", lead_id)
      .maybeSingle();
    if (error) throw error;
    if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });

    // Buscar contexto adicional do clodoaldo_prospects
    let niche = lead.intent || "negócio local";
    let city = "Recife, PE";
    let hasWebsite = lead.site_status === "ok";
    let rating: number | null = null;

    try {
      const { getMeucorrePool } = await import("@/lib/meucorre-db");
      const pool = getMeucorrePool();
      const client = await pool.connect();
      try {
        const r = await client.query(
          "SELECT niche, city, has_website, rating FROM clodoaldo_prospects WHERE name ILIKE $1 LIMIT 1",
          [`%${lead.name}%`]
        );
        if (r.rows.length > 0) {
          niche = r.rows[0].niche || niche;
          city = r.rows[0].city || city;
          hasWebsite = r.rows[0].has_website;
          rating = r.rows[0].rating;
        }
      } finally { client.release(); }
    } catch {}

    const prompt = buildSitePrompt(lead, niche, city, hasWebsite, rating);

    // Plataformas suportadas
    const platforms = [
      {
        name: "ChatGPT",
        icon: "🤖",
        url: `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`,
        method: "url_param",
        description: "Abre com prompt pré-preenchido",
      },
      {
        name: "Claude",
        icon: "🧠",
        url: `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
        method: "url_param",
        description: "Abre com prompt pré-preenchido",
      },
      {
        name: "v0.dev",
        icon: "⚡",
        url: `https://v0.dev/?prompt=${encodeURIComponent(prompt)}`,
        method: "url_param",
        description: "Vercel v0 — gera UI diretamente",
      },
      {
        name: "Bolt.new",
        icon: "🔧",
        url: `https://bolt.new/?prompt=${encodeURIComponent(prompt)}`,
        method: "url_param",
        description: "StackBlitz — gera app completo",
      },
      {
        name: "Lovable",
        icon: "💜",
        url: "https://lovable.dev",
        method: "clipboard",
        description: "Copia prompt → cole no Lovable",
      },
      {
        name: "Manus AI",
        icon: "🤝",
        url: "https://manus.im",
        method: "clipboard",
        description: "Copia prompt → cole no Manus",
      },
      {
        name: "Arena AI",
        icon: "🏟️",
        url: "https://arena.ai",
        method: "clipboard",
        description: "Copia prompt → cole no Arena",
      },
      {
        name: "chatz.ai",
        icon: "💬",
        url: "https://chatz.ai",
        method: "clipboard",
        description: "Copia prompt → cole no chatz.ai",
      },
      {
        name: "Replit",
        icon: "🔁",
        url: "https://replit.com",
        method: "clipboard",
        description: "Copia prompt → cole no Replit Agent",
      },
    ];

    return NextResponse.json({ prompt, platforms, lead_name: lead.name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildSitePrompt(lead: any, niche: string, city: string, hasWebsite: boolean, rating: number | null): string {
  const cityName = city.split(",")[0].trim();
  const nicheUpper = niche.charAt(0).toUpperCase() + niche.slice(1);

  return `Crie um site profissional completo para "${lead.name}", um(a) ${niche} localizado em ${cityName}.

CONTEXTO DO NEGÓCIO:
- Nome: ${lead.name}
- Tipo: ${nicheUpper}
- Cidade: ${cityName}
- ${hasWebsite ? "Já possui site (mas precisa de um novo, melhor e moderno)" : "Não possui site (oportunidade de criar presença digital do zero)"}
- ${rating ? `Avaliação no Google: ${rating} estrelas` : "Sem avaliação no Google ainda"}
- WhatsApp para contato: ${lead.whatsapp || "(81) 92005-1068"}

REQUISITOS DO SITE:

1. ESTRUTURA (seções):
- Header com logo "${lead.name}" + navegação + botão WhatsApp
- Hero section com headline impactante + subheadline + 2 CTAs (WhatsApp + Ver serviços)
- Seção "Sobre nós" com história do ${nicheUpper} em ${cityName}
- Seção "Serviços/Produtos" com cards visuais (4-6 itens)
- Seção "Galeria" com fotos do estabelecimento
- Seção "Depoimentos" com avaliações de clientes
- Seção "Localização" com Google Maps embed
- Seção "Contato" com formulário + WhatsApp + endereço + horários
- Footer com redes sociais + copyright

2. DESIGN:
- Paleta de cores moderna e profissional (adequada para ${nicheUpper})
- Tipografia: Inter ou Space Grotesk para títulos, Inter para corpo
- Animações suaves (fade-in, scroll reveal)
- Totalmente responsivo (mobile-first)
- Dark mode opcional

3. FUNCIONALIDADES:
- Botão flutuante de WhatsApp em todas as páginas
- Formulário de contato que abre WhatsApp com mensagem pronta
- SEO local otimizado (meta tags, structured data, Google Business Profile)
- Google Maps embed da localização
- Galeria de fotos com lightbox
- Menu Hamburguer no mobile
- Lazy loading de imagens

4. SEO:
- Title: "${lead.name} | ${nicheUpper} em ${cityName}"
- Meta description com keywords locais
- Schema.org LocalBusiness
- Open Graph tags
- Sitemap.xml
- robots.txt

5. CONTEÚDO SUGERIDO:
- Headline: algo como "O melhor ${nicheUpper} de ${cityName}" ou "${lead.name}: qualidade que você merece"
- CTAs: "Agendar pelo WhatsApp", "Ver serviços", "Como chegar"
- Depoimentos: criar 3-4 avaliações realistas baseadas no nicho
- Serviços: listar 4-6 serviços típicos de ${nicheUpper}

6. TECNOLOGIA:
- HTML5 semântico + CSS3 + JavaScript vanilla (ou React/Next.js)
- Tailwind CSS para estilização
- Sem dependências externas pesadas
- Performance: carregar em < 3 segundos

Use o WhatsApp ${(lead.whatsapp || "5581920051068")} como contato principal. O número formatado para wa.me é: https://wa.me/${(lead.whatsapp || "5581920051068").replace(/\D/g, "")}

Crie um site que converta visitantes em clientes. Foque em: velocidade, clareza, e facilidade de contato via WhatsApp.`;
}
