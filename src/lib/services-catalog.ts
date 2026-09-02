// Catálogo de serviços — versão Next.js 16
// Imagens servidas localmente em /assets/ (baixadas do Lovable CDN).

import { ASSETS } from "@/lib/asset-urls";

export type ServiceSlug =
  | "video-dedicado"
  | "mencoes-patrocinadas"
  | "serie-stories"
  | "combo-completo"
  | "roteiro-estrategico"
  | "edicao-viral"
  | "pack-criativos"
  | "auditoria-de-perfil"
  | "ebook-guia-briefing-viral"
  | "ebook-30-ganchos-reels"
  | "ebook-manual-edicao-premium"
  | "ebook-storytelling-magnetico"
  | "ebook-ia-criadores"
  | "ebook-networking-marcas"
  | "pack-prompts-premium"
  | "pack-imagens-premium";

export interface QuestionField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface BonusEbook {
  title: string;
  description: string;
  pdfUrl?: string;
}

export interface Service {
  slug: ServiceSlug;
  kind: "service" | "ebook";
  tier: "featured" | "ghost" | "digital-free" | "digital-paid";
  name: string;
  shortName: string;
  tag: string;
  cover: string;
  priceCents: number;
  priceLabel: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  highlight?: boolean;
  questions: QuestionField[];
  upsell?: ServiceSlug;
  bonusEbooks?: BonusEbook[];
  scarcityLabel?: string;
  pdfUrl?: string;
}

const campaignQuestions: QuestionField[] = [
  { name: "company", label: "Nome da marca ou empresa", type: "text", required: true, placeholder: "Ex: Marca XYZ" },
  { name: "product", label: "Produto, serviço ou campanha", type: "textarea", required: true, placeholder: "Descreva o que será divulgado" },
  { name: "audience", label: "Público-alvo", type: "text", required: true, placeholder: "Ex: Empreendedores 25-45 anos" },
  { name: "tone", label: "Tom de voz desejado", type: "text", required: true, placeholder: "Ex: Premium, direto, aspiracional" },
];

const deliveryQuestion: QuestionField = {
  name: "deadline",
  label: "Prazo desejado para entrega",
  type: "select",
  required: true,
  options: [
    { value: "72h", label: "Até 72 horas" },
    { value: "1week", label: "Em até 1 semana" },
    { value: "2weeks", label: "Em até 2 semanas" },
    { value: "flexible", label: "Flexível" },
  ],
};

export const SERVICES: Record<ServiceSlug, Service> = {
  "video-dedicado": {
    slug: "video-dedicado",
    kind: "service",
    tier: "featured",
    name: "Vídeo Dedicado (TikTok / Reels)",
    shortName: "Vídeo Dedicado",
    tag: "TikTok / Reels",
    cover: ASSETS.servicoVideoDedicado,
    priceCents: 150000,
    priceLabel: "R$ 1.500",
    description:
      "Vídeo 100% dedicado à sua marca, com roteiro estratégico, edição premium e CTA para conversão.",
    bullets: [
      "Roteiro estratégico focado em conversão",
      "Edição premium com narrativa comercial",
      "Publicação em TikTok e Reels",
      "Call-to-action otimizado para vendas",
    ],
    ctaLabel: "Começar Minha Campanha",
    questions: [
      ...campaignQuestions,
      deliveryQuestion,
      {
        name: "objective",
        label: "Qual o objetivo da campanha?",
        type: "select",
        required: true,
        options: [
          { value: "awareness", label: "Reconhecimento de marca" },
          { value: "sales", label: "Vendas / conversão" },
          { value: "launch", label: "Lançamento" },
          { value: "leads", label: "Geração de leads" },
        ],
      },
      {
        name: "references",
        label: "Referências visuais ou sonoras",
        type: "textarea",
        placeholder: "Links, perfis ou exemplos que combinem com a campanha",
      },
    ],
    upsell: "serie-stories",
    bonusEbooks: [
      {
        title: "Como Escalar sua Marca com Tráfego Pago",
        description: "Bônus liberado automaticamente com a contratação deste formato.",
      },
    ],
    scarcityLabel: "Restam apenas 3 vagas para este formato neste mês.",
  },
  "mencoes-patrocinadas": {
    slug: "mencoes-patrocinadas",
    kind: "service",
    tier: "featured",
    name: "Menções Patrocinadas",
    shortName: "Menção Patrocinada",
    tag: "Integração orgânica",
    cover: ASSETS.servicoMencoesPatrocinadas,
    priceCents: 70000,
    priceLabel: "R$ 700",
    description:
      "Integração natural da marca em conteúdos de rotina, lifestyle e negócios, com conexão autêntica.",
    bullets: [
      "Inserção natural na narrativa",
      "Conexão com audiência aquecida",
      "Tom autêntico e estratégico",
      "Formato ideal para awareness e tráfego",
    ],
    ctaLabel: "Garantir Minha Vaga",
    questions: [
      ...campaignQuestions,
      deliveryQuestion,
      {
        name: "message",
        label: "Mensagem principal a ser transmitida",
        type: "textarea",
        required: true,
        placeholder: "O que a audiência precisa lembrar da sua marca?",
      },
    ],
    upsell: "video-dedicado",
    scarcityLabel: "Disponibilidade limitada para integrações desta semana.",
  },
  "serie-stories": {
    slug: "serie-stories",
    kind: "service",
    tier: "featured",
    name: "Série de Stories",
    shortName: "Série de Stories",
    tag: "Sequência interativa",
    cover: ASSETS.servicoSerieStories,
    priceCents: 120000,
    priceLabel: "R$ 1.200",
    description:
      "Sequência de 3 a 5 stories com enquetes, caixas de perguntas e links diretos para conversão.",
    bullets: [
      "3 a 5 stories estratégicos",
      "Enquetes e interações de alto CTR",
      "Stickers e links com foco em ação",
      "Ideal para aquecer lançamentos",
    ],
    ctaLabel: "Quero Mais Alcance",
    questions: [
      ...campaignQuestions,
      deliveryQuestion,
      {
        name: "theme",
        label: "Tema central da sequência",
        type: "text",
        required: true,
        placeholder: "Ex: lançamento, bastidores, oferta limitada",
      },
      {
        name: "storiesCount",
        label: "Quantidade de stories desejada",
        type: "select",
        required: true,
        options: [
          { value: "3", label: "3 stories" },
          { value: "4", label: "4 stories" },
          { value: "5", label: "5 stories" },
        ],
      },
    ],
    upsell: "combo-completo",
    scarcityLabel: "Agenda desta semana quase preenchida para stories patrocinados.",
  },
  "combo-completo": {
    slug: "combo-completo",
    kind: "service",
    tier: "featured",
    name: "Combo Completo",
    shortName: "Combo Completo",
    tag: "Pacote 360°",
    cover: ASSETS.servicoComboCompleto,
    priceCents: 250000,
    priceLabel: "R$ 2.500",
    description:
      "Solução 360° com vídeo dedicado, stories e menção. Máximo impacto para campanhas que precisam vender e posicionar.",
    bullets: [
      "1 vídeo dedicado",
      "3 stories interativos",
      "1 menção patrocinada complementar",
      "Cobertura completa do funil da campanha",
    ],
    ctaLabel: "Quero Escalar Minha Marca",
    highlight: true,
    questions: [
      ...campaignQuestions,
      deliveryQuestion,
      {
        name: "objective",
        label: "Objetivo principal da campanha",
        type: "select",
        required: true,
        options: [
          { value: "launch", label: "Lançamento" },
          { value: "awareness", label: "Reconhecimento" },
          { value: "sales", label: "Vendas" },
          { value: "rebrand", label: "Reposicionamento" },
        ],
      },
      {
        name: "cta",
        label: "CTA principal da campanha",
        type: "text",
        required: true,
        placeholder: "Ex: Use o cupom CS10 hoje",
      },
    ],
    bonusEbooks: [
      {
        title: "Estratégias Avançadas de Conteúdo para 2026",
        description: "Bônus premium liberado automaticamente para potencializar a campanha.",
      },
    ],
    scarcityLabel: "Restam apenas 2 vagas premium disponíveis neste mês.",
  },
  "roteiro-estrategico": {
    slug: "roteiro-estrategico",
    kind: "service",
    tier: "ghost",
    name: "Roteiro Estratégico",
    shortName: "Roteiro Estratégico",
    tag: "Ghost Service",
    cover: ASSETS.servicoRoteiroEstrategico,
    priceCents: 14700,
    priceLabel: "R$ 147",
    description:
      "Criação de 3 roteiros técnicos e persuasivos, com ganchos, desenvolvimento e CTA para o cliente gravar seu próprio conteúdo.",
    bullets: [
      "3 roteiros orientados por tendência",
      "Ganchos, desenvolvimento e CTA",
      "Pensado para reels e vídeos curtos",
      "Ideal para quem quer velocidade e direção",
    ],
    ctaLabel: "Quero Roteiros Virais",
    questions: [
      { name: "niche", label: "Qual é o seu nicho?", type: "text", required: true, placeholder: "Ex: estética, finanças, moda, saúde" },
      { name: "goal", label: "Qual o objetivo dos roteiros?", type: "textarea", required: true, placeholder: "Ex: gerar autoridade, vender, captar leads" },
      { name: "audience", label: "Público-alvo", type: "text", required: true, placeholder: "Quem você quer atingir?" },
      { name: "references", label: "Referências ou concorrentes", type: "textarea", placeholder: "Perfis, criadores ou estilos que você admira" },
    ],
    upsell: "edicao-viral",
    scarcityLabel: "Oferta de entrada com disponibilidade reduzida nesta semana.",
    pdfUrl: ASSETS.roteiroEstrategicoPdf,
  },
  "edicao-viral": {
    slug: "edicao-viral",
    kind: "service",
    tier: "ghost",
    name: "Edição Viral",
    shortName: "Edição Viral",
    tag: "Ghost Service",
    cover: ASSETS.servicoEdicaoViral,
    priceCents: 29700,
    priceLabel: "R$ 297",
    description:
      "Edição premium para vídeos brutos enviados pelo cliente, com cortes dinâmicos, trilha e efeitos visuais que aumentam retenção.",
    bullets: [
      "Cortes e ritmo para retenção",
      "Legenda estratégica e reforços visuais",
      "Acabamento premium para celular",
      "Pensado para vídeos com potencial de viralização",
    ],
    ctaLabel: "Quero Edição Profissional",
    questions: [
      { name: "video_type", label: "Tipo de vídeo enviado", type: "text", required: true, placeholder: "Ex: depoimento, tutorial, venda direta" },
      { name: "goal", label: "Objetivo da edição", type: "text", required: true, placeholder: "Ex: mais retenção, mais cliques, mais autoridade" },
      { name: "references", label: "Referências visuais ou sonoras", type: "textarea", placeholder: "Se tiver links ou exemplos, envie aqui" },
      { name: "deadline", label: "Prazo desejado", type: "select", required: true, options: deliveryQuestion.options },
    ],
    upsell: "ebook-manual-edicao-premium",
    scarcityLabel: "Lote promocional para edições avulsas disponível por tempo limitado.",
    pdfUrl: ASSETS.edicaoViralPdf,
  },
  "pack-criativos": {
    slug: "pack-criativos",
    kind: "service",
    tier: "ghost",
    name: "Pack de Criativos",
    shortName: "Pack de Criativos",
    tag: "Ghost Service",
    cover: ASSETS.servicoPackCriativos,
    priceCents: 7700,
    priceLabel: "R$ 77",
    description:
      "Conjunto de templates editáveis no Canva para posts, stories e capas de vídeos com estética premium e autoridade visual.",
    bullets: [
      "Templates profissionais editáveis",
      "Prontos para posts, stories e capas",
      "Visual alinhado com posicionamento premium",
      "Entrega rápida para campanhas próprias",
    ],
    ctaLabel: "Quero Meus Criativos",
    questions: [
      { name: "brand_style", label: "Cores e estilo da sua marca", type: "text", required: true, placeholder: "Ex: preto, dourado, sofisticado, minimalista" },
      {
        name: "art_type",
        label: "Tipo de arte que mais precisa",
        type: "select",
        required: true,
        options: [
          { value: "thumb", label: "Capas / thumbnails" },
          { value: "post", label: "Posts estáticos" },
          { value: "stories", label: "Stories" },
          { value: "mix", label: "Mix dos formatos" },
        ],
      },
      { name: "messages", label: "Textos ou mensagens-chave", type: "textarea", placeholder: "Ofertas, slogans ou dores que devem aparecer" },
    ],
    scarcityLabel: "Pacote com valor especial para esta semana.",
    pdfUrl: ASSETS.packCriativosPdf,
  },
  "auditoria-de-perfil": {
    slug: "auditoria-de-perfil",
    kind: "service",
    tier: "ghost",
    name: "Auditoria de Perfil",
    shortName: "Auditoria de Perfil",
    tag: "Ghost Service",
    cover: ASSETS.servicoAuditoriaPerfil,
    priceCents: 34700,
    priceLabel: "R$ 347",
    description:
      "Análise detalhada do perfil do cliente com diagnóstico, insights estratégicos e recomendações personalizadas para crescimento.",
    bullets: [
      "Análise de bio, destaques e posicionamento",
      "Leitura dos últimos conteúdos e consistência",
      "Diagnóstico de autoridade, conversão e clareza",
      "Plano prático de melhoria",
    ],
    ctaLabel: "Auditar Meu Perfil",
    questions: [
      { name: "profile_link", label: "Link do perfil Instagram ou TikTok", type: "text", required: true, placeholder: "https://instagram.com/seuperfil" },
      { name: "main_goal", label: "Principal meta com o perfil", type: "text", required: true, placeholder: "Ex: vender mais, crescer seguidores, reposicionar" },
      { name: "biggest_block", label: "Qual é hoje o maior bloqueio do perfil?", type: "textarea", placeholder: "Conte o que sente que trava seus resultados" },
    ],
    upsell: "pack-criativos",
    scarcityLabel: "Auditorias completas liberadas em poucas vagas por semana.",
  },
  "ebook-guia-briefing-viral": {
    slug: "ebook-guia-briefing-viral",
    kind: "ebook",
    tier: "digital-free",
    name: "O Guia do Briefing Viral",
    shortName: "Guia do Briefing Viral",
    tag: "Lead Magnet",
    cover: ASSETS.ebookGuiaBriefingViral,
    priceCents: 0,
    priceLabel: "Gratuito",
    description:
      "Guia rápido para criar briefings mais claros, estratégicos e prontos para gerar campanhas que performam melhor.",
    bullets: [
      "Estrutura de briefing pronta para usar",
      "Perguntas que evitam retrabalho",
      "Mais clareza para campanhas e conteúdos",
      "Ideal para quem quer começar com estratégia",
    ],
    ctaLabel: "Baixar Grátis",
    questions: [],
    pdfUrl: ASSETS.guiaBriefingViralPdf,
  },
  "ebook-30-ganchos-reels": {
    slug: "ebook-30-ganchos-reels",
    kind: "ebook",
    tier: "digital-paid",
    name: "30 Ganchos para Reels",
    shortName: "30 Ganchos para Reels",
    tag: "Tripwire",
    cover: ASSETS.ebook30GanchosReels,
    priceCents: 2990,
    priceLabel: "R$ 29,90",
    description:
      "Coleção prática de ganchos para vídeos curtos pensados para captar atenção mais rápido e aumentar retenção.",
    bullets: [
      "30 aberturas prontas para adaptar",
      "Foco em retenção e cliques",
      "Ideal para creators e marcas",
      "Produto digital de compra rápida",
    ],
    ctaLabel: "Comprar Agora",
    questions: [
      { name: "instagram", label: "Seu @ do Instagram (opcional)", type: "text", placeholder: "Para personalizarmos comunicações futuras" },
    ],
    scarcityLabel: "Oferta especial de entrada disponível hoje.",
    pdfUrl: ASSETS.ebook30GanchosReelsPdf,
  },
  "ebook-manual-edicao-premium": {
    slug: "ebook-manual-edicao-premium",
    kind: "ebook",
    tier: "digital-paid",
    name: "Manual da Edição Premium",
    shortName: "Manual da Edição Premium",
    tag: "Tripwire",
    cover: ASSETS.ebookManualEdicaoPremium,
    priceCents: 1990,
    priceLabel: "R$ 19,90",
    description:
      "Manual com fundamentos e técnicas práticas para elevar a qualidade das suas edições no celular e vender melhor com vídeo.",
    bullets: [
      "Fluxo visual para edições mais premium",
      "Mais impacto com poucos recursos",
      "Checklist prático para vídeos curtos",
      "Perfeito como primeiro produto digital",
    ],
    ctaLabel: "Comprar Agora",
    questions: [
      {
        name: "experience",
        label: "Nível de experiência com edição",
        type: "select",
        required: true,
        options: [
          { value: "iniciante", label: "Iniciante" },
          { value: "intermediario", label: "Intermediário" },
          { value: "avancado", label: "Avançado" },
        ],
      },
    ],
    upsell: "ebook-30-ganchos-reels",
    scarcityLabel: "Produto digital com condição promocional por tempo limitado.",
    pdfUrl: ASSETS.manualEdicaoPremiumPdf,
  },
  "ebook-storytelling-magnetico": {
    slug: "ebook-storytelling-magnetico",
    kind: "ebook",
    tier: "digital-paid",
    name: "Storytelling Magnético",
    shortName: "Storytelling Magnético",
    tag: "E-book Premium",
    cover: ASSETS.ebookStorytellingMagnetico,
    priceCents: 1990,
    priceLabel: "R$ 19,90",
    description:
      "A arte de contar histórias que atraem, conectam e deixam legado. Frameworks e gatilhos para transformar palavras em conexão real.",
    bullets: [
      "Estrutura de narrativa em 3 atos aplicada a Reels",
      "Ganchos emocionais que aumentam retenção",
      "Modelos prontos para posts e stories",
      "Ideal para creators, autoridades e marcas",
    ],
    ctaLabel: "Comprar Agora",
    questions: [],
    upsell: "ebook-ia-criadores",
    scarcityLabel: "Lançamento com preço especial nesta semana.",
    pdfUrl: ASSETS.storytellingMagneticoPdf,
  },
  "ebook-ia-criadores": {
    slug: "ebook-ia-criadores",
    kind: "ebook",
    tier: "digital-paid",
    name: "IA para Criadores de Conteúdo",
    shortName: "IA para Criadores",
    tag: "E-book Premium",
    cover: ASSETS.ebookIaCriadores,
    priceCents: 2490,
    priceLabel: "R$ 24,90",
    description:
      "Ferramentas, estratégias e automações para criar mais, melhor e com inteligência. O futuro é o seu conteúdo — com IA como aliada.",
    bullets: [
      "Stack de ferramentas de IA para creators",
      "Prompts prontos para roteiro, edição e legenda",
      "Fluxo de produção em escala com automação",
      "Aplicação prática em Reels, TikTok e YouTube",
    ],
    ctaLabel: "Comprar Agora",
    questions: [],
    upsell: "pack-prompts-premium",
    scarcityLabel: "Bônus de prompts liberado por tempo limitado.",
    pdfUrl: ASSETS.iaParaCriadoresPdf,
  },
  "ebook-networking-marcas": {
    slug: "ebook-networking-marcas",
    kind: "ebook",
    tier: "digital-free",
    name: "Guia de Networking com Marcas",
    shortName: "Networking com Marcas",
    tag: "Lead Magnet",
    cover: ASSETS.ebookNetworkingMarcas,
    priceCents: 0,
    priceLabel: "Gratuito",
    description:
      "Estratégias para construir conexões reais com marcas, gerar oportunidades de valor e transformar relacionamento em parceria comercial.",
    bullets: [
      "Como abordar marcas de forma profissional",
      "Templates de proposta e follow-up",
      "Erros comuns que travam parcerias",
      "Posicionamento que atrai marcas certas",
    ],
    ctaLabel: "Baixar Grátis",
    questions: [],
    pdfUrl: ASSETS.networkingComMarcasPdf,
  },
  "pack-prompts-premium": {
    slug: "pack-prompts-premium",
    kind: "ebook",
    tier: "digital-paid",
    name: "Pack de Prompts Premium",
    shortName: "Pack de Prompts Premium",
    tag: "Recurso Digital",
    cover: ASSETS.ebookPackPrompts,
    priceCents: 2700,
    priceLabel: "R$ 27,00",
    description:
      "Coleção exclusiva de prompts probados, otimizados e prontos para usar em ChatGPT, Gemini e Claude — para creators e negócios.",
    bullets: [
      "Prompts de roteiro, copy, edição e estratégia",
      "Modelos para redes sociais, e-mail e vendas",
      "Categorias organizadas por objetivo",
      "Compatível com ChatGPT, Gemini e Claude",
    ],
    ctaLabel: "Comprar Agora",
    questions: [],
    upsell: "ebook-ia-criadores",
    scarcityLabel: "Coleção com condição promocional por tempo limitado.",
    pdfUrl: ASSETS.packPromptsPremiumPdf,
  },
  "pack-imagens-premium": {
    slug: "pack-imagens-premium",
    kind: "ebook",
    tier: "digital-paid",
    name: "Pack de Imagens Premium",
    shortName: "Pack de Imagens Premium",
    tag: "Recurso Digital",
    cover: ASSETS.ebookPackImagens,
    priceCents: 2700,
    priceLabel: "R$ 27,00",
    description:
      "Coleção selecionada de planos de fundo e texturas premium (dourado, preto, mármore) para elevar o nível dos seus conteúdos.",
    bullets: [
      "Backgrounds premium para posts e stories",
      "Texturas e elementos visuais editáveis",
      "Uso pessoal e comercial liberado",
      "Formato ZIP com WebP otimizado",
    ],
    ctaLabel: "Comprar Agora",
    questions: [],
    pdfUrl: "/api/public/downloads/pack-imagens-premium.zip",
  },
};

export const PARTNERSHIP_SERVICES: Service[] = [
  SERVICES["video-dedicado"],
  SERVICES["mencoes-patrocinadas"],
  SERVICES["serie-stories"],
  SERVICES["combo-completo"],
];

export const GHOST_SERVICES: Service[] = [
  SERVICES["roteiro-estrategico"],
  SERVICES["edicao-viral"],
  SERVICES["pack-criativos"],
  SERVICES["auditoria-de-perfil"],
];

export const FREE_EBOOKS: Service[] = [
  SERVICES["ebook-guia-briefing-viral"],
  SERVICES["ebook-networking-marcas"],
];

export const PAID_EBOOKS: Service[] = [
  SERVICES["ebook-storytelling-magnetico"],
  SERVICES["ebook-ia-criadores"],
  SERVICES["ebook-manual-edicao-premium"],
  SERVICES["ebook-30-ganchos-reels"],
  SERVICES["pack-prompts-premium"],
  SERVICES["pack-imagens-premium"],
];

export const CHECKOUT_ITEMS: Service[] = [
  ...PARTNERSHIP_SERVICES,
  ...GHOST_SERVICES,
  ...PAID_EBOOKS,
];

export const SERVICE_LIST: Service[] = [...PARTNERSHIP_SERVICES, ...GHOST_SERVICES];

export function getService(slug: string): Service | null {
  return (SERVICES as Record<string, Service>)[slug] ?? null;
}

export const QUEUED_SERVICE_SLUGS = [
  "video-dedicado",
  "mencoes-patrocinadas",
  "serie-stories",
  "roteiro-estrategico",
  "edicao-viral",
  "pack-criativos",
  "auditoria-de-perfil",
] as const;

export function requiresQueue(slug: string): boolean {
  return (QUEUED_SERVICE_SLUGS as readonly string[]).includes(slug);
}
