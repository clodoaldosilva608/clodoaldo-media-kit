import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/generate-site-prompt
 *
 * Gera prompt personalizado por plataforma AI, com instruções premium:
 * - Design premium totalmente responsivo
 * - Imagens reais do lead (Google Maps photos, website) ou AI-generated coerentes com nicho
 * - Cada plataforma recebe um prompt otimizado pra suas capacidades
 *
 * Body: { lead_id: string }
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
    let website: string | null = null;
    let formattedAddress: string | null = null;
    let lat: number | null = null;
    let lng: number | null = null;
    let instagram: string | null = null;
    let facebook: string | null = null;

    try {
      const { getMeucorrePool } = await import("@/lib/meucorre-db");
      const pool = getMeucorrePool();
      const client = await pool.connect();
      try {
        const r = await client.query(
          `SELECT niche, city, has_website, rating, website, formatted_address,
                  lat, lng, instagram, facebook
           FROM clodoaldo_prospects WHERE name ILIKE $1 LIMIT 1`,
          [`%${lead.name}%`]
        );
        if (r.rows.length > 0) {
          const p = r.rows[0];
          niche = p.niche || niche;
          city = p.city || city;
          hasWebsite = p.has_website;
          rating = p.rating;
          website = p.website;
          formattedAddress = p.formatted_address;
          lat = p.lat;
          lng = p.lng;
          instagram = p.instagram;
          facebook = p.facebook;
        }
      } finally { client.release(); }
    } catch {}

    const waNum = (lead.whatsapp || "5581920051068").replace(/\D/g, "");
    const cityName = city.split(",")[0].trim();
    const nicheUpper = niche.charAt(0).toUpperCase() + niche.slice(1);
    const demoUrl = lead.demo_url || `https://clodoaldo-media-kit.vercel.app/api/preview?lead=${lead.id}&style=dark`;

    // Gerar prompt base (compartilhado por todas as plataformas)
    const basePrompt = buildBasePrompt(lead, niche, cityName, hasWebsite, rating, website, formattedAddress, lat, lng, instagram, facebook, waNum, demoUrl);

    // Gerar prompts específicos por plataforma
    const platforms = [
      {
        name: "ChatGPT",
        icon: "🤖",
        url: `https://chat.openai.com/?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("chatgpt", niche))}`,
        method: "url_param",
        description: "Pré-preenchido no chat",
        color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      },
      {
        name: "Claude",
        icon: "🧠",
        url: `https://claude.ai/new?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("claude", niche))}`,
        method: "url_param",
        description: "Pré-preenchido no chat",
        color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      },
      {
        name: "v0.dev",
        icon: "⚡",
        url: `https://v0.dev/chat?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("v0", niche))}`,
        method: "url_param",
        description: "Gera UI + código",
        color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
      },
      {
        name: "Bolt.new",
        icon: "🔧",
        url: `https://bolt.new/?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("bolt", niche))}`,
        method: "url_param",
        description: "App completo + preview",
        color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      },
      {
        name: "Lovable",
        icon: "💜",
        url: `https://lovable.dev/?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("lovable", niche))}`,
        method: "url_param",
        description: "React + Tailwind + deploy",
        color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      },
      {
        name: "Manus AI",
        icon: "🤝",
        url: `https://manus.im/chat?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("manus", niche))}`,
        method: "url_param",
        description: "Agente autônomo",
        color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      },
      {
        name: "Arena AI",
        icon: "🏟️",
        url: `https://arena.ai/?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("arena", niche))}`,
        method: "url_param",
        description: "Múltiplos modelos",
        color: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      },
      {
        name: "chatz.ai",
        icon: "💬",
        url: `https://chatz.ai/?q=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("chatz", niche))}`,
        method: "url_param",
        description: "Chat AI brasileiro",
        color: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      },
      {
        name: "Replit",
        icon: "🔁",
        url: `https://replit.com/ai?prompt=${encodeURIComponent(basePrompt + "\n\n" + platformSpecific("replit", niche))}`,
        method: "url_param",
        description: "Deploy direto",
        color: "bg-orange-500/15 text-orange-300 border-orange-500/30",
      },
    ];

    return NextResponse.json({
      prompt: basePrompt,
      platforms,
      lead_name: lead.name,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildBasePrompt(
  lead: any, niche: string, city: string, hasWebsite: boolean,
  rating: number | null, website: string | null, address: string | null,
  lat: number | null, lng: number | null, instagram: string | null,
  facebook: string | null, waNum: string, demoUrl: string
): string {
  const nicheUpper = niche.charAt(0).toUpperCase() + niche.slice(1);
  const mapsEmbed = lat && lng
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat},${lng}!5e0!3m2!1spt-BR!2sbr!4v1`
    : null;

  return `Crie uma APLICAÇÃO WEB PREMIUM para "${lead.name}", um(a) ${nicheUpper} em ${city}.

═══ CONTEXTO DO NEGÓCIO ═══
• Nome: ${lead.name}
• Tipo: ${nicheUpper}
• Cidade: ${city}
• Endereço: ${address || "Não disponível — use um endereço genérico de " + city}
• ${hasWebsite ? `Site atual: ${website || "não disponível"} (substituir por site premium novo)` : "Não possui site — criar do zero"}
• ${rating ? `Avaliação Google: ${rating} estrelas` : "Sem avaliação no Google"}
• WhatsApp: +${waNum.slice(0, 2)} ${waNum.slice(2, 4)} ${waNum.slice(4, 9)}-${waNum.slice(9)}
• ${instagram ? `Instagram: ${instagram}` : "Instagram: não disponível — criar @${lead.name.toLowerCase().replace(/\s+/g, "")}"}
• ${facebook ? `Facebook: ${facebook}` : "Facebook: não disponível"}
• Coordenadas: ${lat && lng ? `${lat}, ${lng}` : "não disponível — usar centro de " + city}
• Demo de referência: ${demoUrl}

═══ DESIGN PREMIUM ═══
• Estilo: MODERNO, ELEGANTE, PROFISSIONAL — visual de empresa premium
• Paleta de cores: escolha uma paleta coerente com ${nicheUpper} (ex: ${nicheColors(niche)})
• Tipografia: Space Grotesk (títulos) + Inter (corpo) — Google Fonts
• Animações: fade-in suave, scroll reveal, hover effects, parallax sutil no hero
• Micro-interações: botões com ripple, cards com lift no hover, transições fluidas
• Dark mode: suporte completo (toggle no header)
• Totalmente RESPONSIVO: mobile-first, tablet, desktop, ultrawide
• Performance: carregar em < 2 segundos, lazy loading, optimized images

═══ IMAGENS ═══
${hasWebsite && website
    ? `• EXTRAIR imagens reais do site atual: ${website} — usar como referência visual
• Se o site tiver fotos do estabelecimento, produtos ou equipe, usar essas imagens`
    : `• Não há site atual para extrair imagens`}
• Se não houver imagens reais disponíveis, GERAR imagens AI coerentes com ${nicheUpper}:
  - Foto do hero: fachada/ambiente de um(a) ${nicheUpper} premium em ${city}
  - Fotos da galeria: 6 imagens do nicho (ambiente, produtos, equipe, detalhes)
  - Use Unsplash (https://source.unsplash.com) como fallback com queries: "${niche}", "${niche} interior", "${niche} ${city}"
• Todas as imagens devem ter alt text descritivo para acessibilidade
• Use WebP ou AVIF quando possível para performance

═══ ESTRUTURA (seções) ═══
1. HEADER: Logo "${lead.name}" + nav (Início, Sobre, Serviços, Galeria, Contato) + botão WhatsApp + toggle dark mode
2. HERO: Headline impactante + subheadline + 2 CTAs (WhatsApp + Ver serviços) + imagem fullscreen com overlay
3. STATS BAR: 4 números (anos de experiência, clientes atendidos, avaliação, serviços)
4. SOBRE: História do ${nicheUpper} + missão + valores + foto da equipe
5. SERVIÇOS: 4-6 cards com ícone + título + descrição + preço (se aplicável)
6. GALERIA: Grid de 6-8 fotos com lightbox (clique pra ampliar)
7. DEPOIMENTOS: 3-4 avaliações com foto + nome + estrelas + texto
8. LOCALIZAÇÃO: Google Maps embed + endereço + horários + botão "Como chegar"
9. CTA FINAL: Banner com "Pronto para começar?" + botão WhatsApp grande
10. FOOTER: Links + redes sociais + copyright + "Site criado por Clodoaldo Silva"

═══ FUNCIONALIDADES ═══
• Botão flutuante de WhatsApp em todas as páginas (canto inferior direito)
• Formulário de contato que abre WhatsApp com mensagem pré-preenchida
• Scroll suave entre seções (smooth scroll)
• Menu hamburguer animado no mobile
• Botão "voltar ao topo" quando rolar
• Cookie consent banner (LGPD)
• SEO local: Schema.org LocalBusiness + Open Graph + meta tags
• Google Maps embed: ${mapsEmbed || "usar endereço de " + city}
• Sitemap.xml + robots.txt
• 404 page customizada

═══ SEO ═══
• Title: "${lead.name} | ${nicheUpper} em ${city} | Melhor da Região"
• Meta description: "${lead.name} é o melhor ${nicheUpper} de ${city}. ${rating ? `Avaliação ${rating} estrelas no Google. ` : ""}Agende pelo WhatsApp: +${waNum.slice(0,2)} ${waNum.slice(2,4)} ${waNum.slice(4,9)}-${waNum.slice(9)}"
• Schema.org LocalBusiness com: name, address, geo, telephone, openingHours, aggregateRating
• Open Graph: title, description, image (logo ou hero), url, type: website
• Twitter Card: summary_large_image
• Canonical URL
• Alt text em todas as imagens
• Headings hierárquicos (H1 > H2 > H3)

═══ CONTEÚDO SUGERIDO ═══
• Headline: "${nicheHeadline(niche, lead.name, city)}"
• Subheadline: "${nicheSubheadline(niche, city)}"
• CTAs: "Agendar pelo WhatsApp", "Ver serviços", "Como chegar"
• Serviços: ${nicheServices(niche)}
• Depoimentos: criar 3-4 avaliações realistas (5 estrelas) com nomes brasileiros

═══ CONTATO ═══
• WhatsApp: https://wa.me/${waNum}
• Telefone: +${waNum.slice(0,2)} ${waNum.slice(2,4)} ${waNum.slice(4,9)}-${waNum.slice(9)}
• Endereço: ${address || city}
• Horários: Seg-Sex 8h-18h, Sáb 8h-12h (ajustar conforme nicho)

Crie uma aplicação PREMIUM que converta visitantes em clientes. Foque em: velocidade extrema, design impressionante, e facilidade de contato via WhatsApp.`;
}

function platformSpecific(platform: string, niche: string): string {
  const prompts: Record<string, string> = {
    chatgpt: `═══ INSTRUÇÕES ESPECÍFICAS PARA CHATGPT ═══
Gere o código HTML + CSS + JavaScript completo num único arquivo. Use Tailwind CSS via CDN. Inclua todas as seções com conteúdo real e completo. Não use placeholders — preencha tudo com conteúdo realista baseado no nicho ${niche}.`,
    claude: `═══ INSTRUÇÕES ESPECÍFICAS PARA CLAUDE ═══
Gere o código completo HTML + CSS + JavaScript. Use Tailwind CSS via CDN. Claude é excelente em código limpo e semântico — aproveite isso. Inclua comentários explicativos. Gere conteúdo completo, sem placeholders.`,
    v0: `═══ INSTRUÇÕES ESPECÍFICAS PARA v0 ═══
Crie componentes React + Tailwind CSS. v0 é especializado em UI — foque em design premium e componentes interativos. Use shadcn/ui quando possível. Gere todas as seções como componentes separados. Inclua animações com framer-motion.`,
    bolt: `═══ INSTRUÇÕES ESPECÍFICAS PARA BOLT.NEW ═══
Crie uma aplicação Next.js completa com Tailwind CSS. Bolt.new roda o app em tempo real — aproveite pra criar algo funcional. Use componentes React. Inclua todas as funcionalidades interativas (menu mobile, lightbox, formulário, dark mode toggle).`,
    lovable: `═══ INSTRUÇÕES ESPECÍFICAS PARA LOVABLE ═══
Crie uma aplicação React + Tailwind CSS + shadcn/ui. Lovable deploya automaticamente — crie algo production-ready. Use componentes funcionais com hooks. Inclua roteamento se necessário. Foque em design premium e responsividade perfeita.`,
    manus: `═══ INSTRUÇÕES ESPECÍFICAS PARA MANUS AI ═══
Como agente autônomo, crie uma aplicação web completa e deployable. Use a stack que preferir (React/Next.js/Vue). Foque em entregar um produto final funcional, não apenas código. Inclua imagens reais ou geradas. Deploy se possível.`,
    arena: `═══ INSTRUÇÕES ESPECÍFICAS PARA ARENA AI ═══
Gere a melhor versão possível desta aplicação. Use a stack moderna de sua preferência. Foque em design premium, performance e conversão. Inclua todas as seções com conteúdo completo.`,
    chatz: `═══ INSTRUÇÕES ESPECÍFICAS PARA CHATZ.AI ═══
Crie uma aplicação web premium em português brasileiro. Use HTML5 + Tailwind CSS + JavaScript. Foque em design moderno e conversão. Inclua todas as funcionalidades interativas. Conteúdo em pt-BR.`,
    replit: `═══ INSTRUÇÕES ESPECÍFICAS PARA REPLIT ═══
Crie uma aplicação web deployable. Replit pode rodar e fazer deploy — aproveite. Use Node.js + Express + HTML/CSS/JS ou Next.js. Inclua package.json. Crie algo que funcione imediatamente após deploy.`,
  };
  return prompts[platform] || "";
}

function nicheColors(niche: string): string {
  const map: Record<string, string> = {
    barbearia: "preto + dourado + branco (estilo barbershop premium)",
    restaurante: "vermelho escuro + creme + dourado (apetitoso e elegante)",
    pizzaria: "vermelho + branco + verde (italiano premium)",
    hamburgueria: "marrom + laranja + creme (rustic gourmet)",
    academia: "preto + verde neon + cinza (energia e força)",
    "salao de beleza": "rosé gold + branco + preto (elegância feminina)",
    "clinica estetica": "branco + azul claro + dourado (clean e premium)",
    "pet shop": "azul + laranja + branco (amigável e profissional)",
    "consultorio odontologico": "branco + azul + verde água (clean e médico)",
    "loja de roupas": "preto + branco + dourado (moda premium)",
    imobiliaria: "azul marinho + dourado + branco (confiança e luxo)",
    contabilidade: "azul + cinza + branco (profissional e sério)",
    "agencia de marketing": "roxo + preto + ciano (criativo e moderno)",
    farmacia: "verde + branco + cruz vermelha (saúde)",
  };
  return map[niche.toLowerCase()] || "cores modernas e profissionais";
}

function nicheHeadline(niche: string, name: string, city: string): string {
  const map: Record<string, string> = {
    barbearia: `Estilo que define. Navalha que transforma.`,
    restaurante: `Sabores que contam histórias em ${city}`,
    pizzaria: `A melhor pizza de ${city}, feita com amor`,
    hamburgueria: `Hambúrguer artesanal que vai mudar seu padrão`,
    academia: `Transforme seu corpo, transforme sua vida`,
    "salao de beleza": `Realce sua beleza natural em ${city}`,
    "clinica estetica": `Sua melhor versão começa aqui`,
    "pet shop": `O melhor para seu melhor amigo`,
    "consultorio odontologico": `Sorrisos que mudam vidas em ${city}`,
    "loja de roupas": `Moda que expressa quem você é`,
    imobiliaria: `Encontre o lar dos seus sonhos em ${city}`,
  };
  return map[niche.toLowerCase()] || `${name}: excelência em ${niche} em ${city}`;
}

function nicheSubheadline(niche: string, city: string): string {
  const map: Record<string, string> = {
    barbearia: `Cortes modernos, barba na navalha e atendimento premium em ${city}.`,
    restaurante: `Cuisine autêntica com ingredientes frescos e ambiente acolhedor.`,
    pizzaria: `Massa artesanal, ingredientes premium e forno a lenha em ${city}.`,
    hamburgueria: `Carne premium, pão artesanal e ingredientes selecionados.`,
    academia: `Equipamentos modernos, personal trainer e resultados garantidos.`,
    "salao de beleza": `Cortes, coloração, tratamentos e muito mais em ${city}.`,
    "clinica estetica": `Tecnologia avançada e profissionais especializados para você.`,
    "pet shop": `Banho, tosa, ração e acessórios com o melhor preço de ${city}.`,
    "consultorio odontologico": `Tratamentos modernos com tecnologia de ponta em ${city}.`,
    "loja de roupas": `Coleções exclusivas e atendimento personalizado em ${city}.`,
    imobiliaria: `Os melhores imóveis de ${city} com os melhores preços.`,
  };
  return map[niche.toLowerCase()] || `Qualidade e profissionalismo em ${niche} em ${city}.`;
}

function nicheServices(niche: string): string {
  const map: Record<string, string> = {
    barbearia: "Corte masculino, Barba na navalha, Sobrancelha, Pigmentação, Corte + Barba, Plano mensal",
    restaurante: "Almoço executivo, Jantar à la carte, Eventos privativos, Delivery, Cardápio degustação, Happy hour",
    pizzaria: "Pizza individual, Pizza família, Pizza broto, Borda recheada, Combos, Pizza doce",
    hamburgueria: "Smash burger, Cheese bacon, Veggie burger, Combo+fritas+bebida, Milkshake, Onion rings",
    academia: "Musculação, Personal trainer, Aulas coletivas, Avaliação física, Plano trimestral, Plano anual",
    "salao de beleza": "Corte feminino, Escova, Coloração, Progressiva, Manicure, Maquiagem",
    "clinica estetica": "Limpeza de pele, Botox, Preenchimento, Radiofrequência, Drenagem linfática, Pacote mensal",
    "pet shop": "Banho, Tosa, Banho+tosa, Veterinário, Ração premium, Acessórios",
    "consultorio odontologico": "Limpeza, Clareamento, Implante, Ortodontia, Canal, Avaliação gratuita",
    "loja de roupas": "Coleção verão, Coleção inverno, Acessórios, Calçados, Promoção, Personal stylist",
    imobiliaria: "Venda, Locação, Avaliação, Administração, Financiamento, Consultoria",
  };
  return map[niche.toLowerCase()] || "Serviço 1, Serviço 2, Serviço 3, Serviço 4, Pacote premium, Consultoria";
}
