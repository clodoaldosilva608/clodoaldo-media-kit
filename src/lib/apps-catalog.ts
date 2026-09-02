// Catálogo de apps — versão Next.js 16
// Imagens servidas localmente em /assets/ (baixadas do Lovable CDN).

import { ASSETS } from "@/lib/asset-urls";

const PREMIUM_COVERS: Record<string, string> = {
  mirrorme: ASSETS.appsPremiumAiSelfSync,
  "amor-financas": ASSETS.appsPremiumAmorFinancas,
  "centro-sobrevivencia": ASSETS.appsPremiumCentroSobrevivencia,
  cognitiveos: ASSETS.appsPremiumCognitiveos,
  "cosmic-self": ASSETS.appsPremiumCosmicSelf,
  "creators-x-editors": ASSETS.appsPremiumCreatorsXEditors,
  flashctb: ASSETS.appsPremiumFlashctb,
  "auditoria-de-perfil": ASSETS.appsPremiumAuditoriaPerfil,
};

export type AppCategory =
  | "Autoconhecimento & IA"
  | "Educação & Infantil"
  | "Produtividade & Ferramentas"
  | "Saúde & Farmácia"
  | "Finanças & Jurídico"
  | "Comunidade & Social"
  | "E-commerce & Lifestyle"
  | "Educação p/ Concursos";

export type AppStatus = "lancado" | "beta" | "em-desenvolvimento" | "conceito";
export type Monetization = "freemium" | "lifetime" | "b2b" | "bundle" | "gratis";

export interface AppItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: AppCategory;
  status: AppStatus;
  featured?: boolean;
  demoUrl: string;
  coverUrl: string;
  premiumCoverUrl?: string;
  monetization: Monetization;
  priceLabel: string;
  fundingGoalCents: number;
  fundingRaisedCents: number;
  gradient: string;
}

const G: Record<AppCategory, string> = {
  "Autoconhecimento & IA": "from-[#8b5cf6] to-[#4c1d95]",
  "Educação & Infantil": "from-[#f59e0b] to-[#b45309]",
  "Produtividade & Ferramentas": "from-[#3b82f6] to-[#1e3a8a]",
  "Saúde & Farmácia": "from-[#0ea5a5] to-[#065f5f]",
  "Finanças & Jurídico": "from-[#22c55e] to-[#14532d]",
  "Comunidade & Social": "from-[#F5A425] to-[#7c2d12]",
  "E-commerce & Lifestyle": "from-[#FF7A00] to-[#B34A00]",
  "Educação p/ Concursos": "from-[#3b82f6] to-[#facc15]",
};

const raw: Array<
  Omit<AppItem, "fundingGoalCents" | "fundingRaisedCents" | "gradient"> & {
    goal?: number;
    raised?: number;
  }
> = [
  // ─── Autoconhecimento & IA ───────────────────────────────────────────
  { slug: "soulmap", name: "SOULMAP", tagline: "Sua jornada de paz interior", description: "Mapa interativo de autoconhecimento com meditação guiada, jornada emocional e reflexão diária.", category: "Autoconhecimento & IA", status: "lancado", featured: true, demoUrl: "https://inner-world-atlas.lovable.app/", coverUrl: ASSETS.appsSoulmap, monetization: "freemium", priceLabel: "Grátis · Pro R$ 19,90/mês" },
  { slug: "microhabit", name: "MicroHabit", tagline: "Micro-hábitos, macro-transformação", description: "Rastreie hábitos diários com progresso visual, streaks e ciência do comportamento.", category: "Autoconhecimento & IA", status: "lancado", demoUrl: "https://microhabt.lovable.app/", coverUrl: ASSETS.appsMicrohabit, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },
  { slug: "mysticmind", name: "MysticMind", tagline: "Interprete seus sonhos com IA", description: "Diário de sonhos com interpretação por IA, padrões do subconsciente e insights emocionais.", category: "Autoconhecimento & IA", status: "lancado", demoUrl: "https://sonhosapp.lovable.app/", coverUrl: ASSETS.appsMysticmind, monetization: "freemium", priceLabel: "Grátis · Pro R$ 14,90/mês" },
  { slug: "timeboxmind", name: "TimeBoxMind", tagline: "Blocos de foco mental", description: "Time-boxing com foco profundo, revisão de energia mental e alinhamento com objetivos.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://time-box-mind.lovable.app/", coverUrl: ASSETS.appsTimeboxmind, monetization: "freemium", priceLabel: "Grátis · Pro R$ 12,90/mês" },
  { slug: "mindforge", name: "MindForge", tagline: "Espelho mental de IA", description: "Reflita conversas com uma IA que espelha seu discurso e revela padrões cognitivos.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://mindforge-self-mirror.lovable.app/", coverUrl: ASSETS.appsMindforge, monetization: "freemium", priceLabel: "Pro R$ 19,90/mês" },
  { slug: "cognitiveos", name: "CognitiveOS", tagline: "SO cognitivo pessoal", description: "Painel unificado de mente: notas, tarefas, emoções e reflexões conectados por IA.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://cognitiveo.lovable.app/", coverUrl: ASSETS.appsCognitiveos, monetization: "freemium", priceLabel: "Pro R$ 24,90/mês" },
  { slug: "neurosynq", name: "NEUROSYNQ", tagline: "Sincronia neural com IA", description: "Sessões guiadas de foco, memória e criatividade com feedback adaptativo.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://neurosinq.lovable.app/", coverUrl: ASSETS.appsNeurosynq, monetization: "freemium", priceLabel: "Pro R$ 19,90/mês" },
  { slug: "timecapsule", name: "TimeCapsule AI", tagline: "Cápsulas do tempo com IA", description: "Escreva para seu 'eu futuro' com IA e receba mensagens em datas programadas.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://memory-keepers-engine.lovable.app/", coverUrl: ASSETS.appsTimecapsule, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },
  { slug: "mindcall", name: "MindCall", tagline: "Chamadas do seu futuro", description: "Simula conversas com versões futuras de você e projeta cenários de decisão.", category: "Autoconhecimento & IA", status: "em-desenvolvimento", demoUrl: "https://echo-my-future.lovable.app/", coverUrl: ASSETS.appsMindcall, monetization: "freemium", priceLabel: "Pro R$ 14,90/mês" },
  { slug: "dreamswap", name: "DreamSwap", tagline: "Compartilhe seus sonhos", description: "Rede anônima para trocar sonhos e receber interpretações da comunidade.", category: "Autoconhecimento & IA", status: "em-desenvolvimento", demoUrl: "https://dreamweave-ai-19.lovable.app/", coverUrl: ASSETS.appsDreamswap, monetization: "freemium", priceLabel: "Grátis" },
  { slug: "voicepaper", name: "VoicePaper", tagline: "Sua voz vira artigo", description: "Grave áudio e a IA transcreve, organiza e transforma em um artigo publicável.", category: "Autoconhecimento & IA", status: "lancado", demoUrl: "https://voice-brain-organizer.lovable.app/", coverUrl: ASSETS.appsVoicepaper, monetization: "freemium", priceLabel: "Grátis · Pro R$ 19,90/mês" },
  { slug: "shelflife", name: "ShelfLife", tagline: "Vida útil das suas ideias", description: "Cataloga ideias com prazo de validade, gatilhos e revisão espaçada.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://temporal-embrace.lovable.app/", coverUrl: ASSETS.appsShelflife, monetization: "freemium", priceLabel: "Pro R$ 9,90/mês" },
  { slug: "emolog", name: "EMOLOG", tagline: "Diário emocional inteligente", description: "Registro emocional com padrões, gatilhos e sugestões personalizadas de autocuidado.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://promise-pledge.lovable.app/", coverUrl: ASSETS.appsEmolog, monetization: "freemium", priceLabel: "Grátis · Pro R$ 12,90/mês" },
  { slug: "vita", name: "VITA", tagline: "Escaneia sua rotina", description: "Fotografe sua rotina e a IA revela padrões de saúde, energia e produtividade.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://wise-scan-ai.lovable.app/", coverUrl: ASSETS.appsVita, monetization: "freemium", priceLabel: "Pro R$ 19,90/mês" },
  { slug: "lifesynth", name: "LifeSynth", tagline: "Sintetize sua história", description: "Transforma suas memórias em capítulos de vida com IA narrativa.", category: "Autoconhecimento & IA", status: "em-desenvolvimento", demoUrl: "https://life-story-synth.lovable.app/", coverUrl: ASSETS.appsLifesynth, monetization: "lifetime", priceLabel: "R$ 47 acesso vitalício" },
  { slug: "synapse-infinita", name: "SYNAPSE INFINITA", tagline: "Rede de ideias infinita", description: "Um grafo de conexões entre suas notas, sonhos e reflexões, expandido por IA.", category: "Autoconhecimento & IA", status: "conceito", demoUrl: "https://synapsis-omnibus.lovable.app/", coverUrl: ASSETS.appsSynapseInfinita, monetization: "freemium", priceLabel: "Pro R$ 24,90/mês" },
  { slug: "cosmic-self", name: "Cosmic Self", tagline: "Seu eu cósmico", description: "Mapa de identidade multidimensional com arquétipos, valores e propósito.", category: "Autoconhecimento & IA", status: "conceito", demoUrl: "https://cosmic-self-continuum.lovable.app/", coverUrl: ASSETS.appsCosmicSelf, monetization: "freemium", priceLabel: "Pro R$ 19,90/mês" },
  { slug: "zero-squared", name: "Zero²", tagline: "Reset radical", description: "Guia estruturado de 30 dias para reiniciar hábitos, mindset e prioridades.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://zero-squared-reset.lovable.app/", coverUrl: ASSETS.appsZeroSquared, monetization: "lifetime", priceLabel: "R$ 97 acesso vitalício" },
  { slug: "ego-drop", name: "EGO DROP", tagline: "Solte o ego", description: "Práticas guiadas para reduzir reatividade e cultivar presença.", category: "Autoconhecimento & IA", status: "conceito", demoUrl: "https://inner-self-lens.lovable.app/", coverUrl: ASSETS.appsEgoDrop, monetization: "freemium", priceLabel: "Grátis · Pro R$ 14,90/mês" },
  { slug: "mirrorme", name: "MirrorMe", tagline: "IA que aprende com você", description: "Assistente pessoal que aprende seu estilo de comunicação e valores.", category: "Autoconhecimento & IA", status: "beta", demoUrl: "https://ai-self-sync.lovable.app/", coverUrl: ASSETS.appsMirrorme, monetization: "freemium", priceLabel: "Pro R$ 29,90/mês" },
  { slug: "soul-stream", name: "Soul Stream", tagline: "Fluxo da alma", description: "Playlists, textos e imagens curadas em tempo real ao seu estado emocional.", category: "Autoconhecimento & IA", status: "conceito", demoUrl: "https://soul-stream-world.lovable.app/", coverUrl: ASSETS.appsSoulStream, monetization: "freemium", priceLabel: "Grátis" },

  // ─── Educação & Infantil ─────────────────────────────────────────────
  { slug: "dinoworld", name: "DinoWorld Explorer", tagline: "Aventura educativa com dinossauros", description: "Aventura interativa para crianças curiosas explorarem dinossauros com fatos, jogos e conquistas.", category: "Educação & Infantil", status: "lancado", featured: true, demoUrl: "https://dinossauroplay.lovable.app/", coverUrl: ASSETS.appsDinoworld, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },
  { slug: "edukids", name: "EduKids", tagline: "Aprender brincando", description: "Plataforma lúdica com atividades educativas para crianças de 4 a 10 anos.", category: "Educação & Infantil", status: "lancado", demoUrl: "https://edukidss.lovable.app/", coverUrl: ASSETS.appsEdukids, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },
  { slug: "edukids-pro", name: "EduKids Pro", tagline: "Versão premium para escolas", description: "Painel para professores, relatórios de progresso e conteúdos exclusivos.", category: "Educação & Infantil", status: "beta", demoUrl: "https://edukidspro.lovable.app/", coverUrl: ASSETS.appsEdukidsPro, monetization: "b2b", priceLabel: "A partir de R$ 97/mês" },
  { slug: "storyverse-kids", name: "Storyverse Kids", tagline: "Histórias infantis com IA", description: "Cria histórias personalizadas com o nome da criança e temas educativos.", category: "Educação & Infantil", status: "lancado", demoUrl: "https://storyverse-kids-hero.lovable.app/", coverUrl: ASSETS.appsStoryverseKids, monetization: "freemium", priceLabel: "Grátis · Pro R$ 14,90/mês" },
  { slug: "kidplay", name: "KidPlay", tagline: "Jogos educativos seguros", description: "Coleção de mini-jogos educativos sem anúncios e com controle parental.", category: "Educação & Infantil", status: "lancado", demoUrl: "https://kidplay.lovable.app/", coverUrl: ASSETS.appsKidplay, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },
  { slug: "strategy-game-lab", name: "Strategy Game Lab", tagline: "Laboratório de estratégia", description: "Simulações lógicas para treinar pensamento estratégico e tomada de decisão.", category: "Educação & Infantil", status: "beta", demoUrl: "https://logic-arena-lab.lovable.app/", coverUrl: ASSETS.appsStrategyGameLab, monetization: "freemium", priceLabel: "Grátis · Pro R$ 14,90/mês" },
  { slug: "cooperate-or-conquer", name: "Cooperate or Conquer", tagline: "Cooperar ou vencer?", description: "Jogo de teoria dos jogos aplicada — cooperação, competição e dilemas éticos.", category: "Educação & Infantil", status: "beta", demoUrl: "https://cooperate-or-conquer.lovable.app/", coverUrl: ASSETS.appsCooperateOrConquer, monetization: "lifetime", priceLabel: "R$ 27 acesso vitalício" },
  { slug: "teoria-jogos", name: "Teoria dos Jogos", tagline: "Aprenda por simulações", description: "Curso interativo com dilema do prisioneiro, equilíbrio de Nash e mais, gamificado.", category: "Educação & Infantil", status: "lancado", demoUrl: "https://teoriadosjogos.lovable.app/", coverUrl: ASSETS.appsTeoriaJogos, monetization: "lifetime", priceLabel: "R$ 47 acesso vitalício" },

  // ─── Produtividade & Ferramentas ─────────────────────────────────────
  { slug: "etiquetapro", name: "EtiquetaPro", tagline: "Etiquetas em segundos", description: "Gera etiquetas profissionais com IA — produtos, remetentes e códigos, em lote.", category: "Produtividade & Ferramentas", status: "lancado", featured: true, demoUrl: "https://etiquetafacill.lovable.app/", coverUrl: ASSETS.appsEtiquetapro, monetization: "lifetime", priceLabel: "R$ 47 acesso vitalício" },
  { slug: "notebookflow", name: "NotebookFlow", tagline: "Cadernos vivos com IA", description: "Um Notion + IA para conectar notas, tarefas e insights em um fluxo contínuo.", category: "Produtividade & Ferramentas", status: "lancado", demoUrl: "https://notebookflow.lovable.app/", coverUrl: ASSETS.appsNotebookflow, monetization: "freemium", priceLabel: "Grátis · Pro R$ 19,90/mês" },
  { slug: "doculens", name: "DocuLens", tagline: "Documentos sem enrolação", description: "Digitalize, resuma e assine documentos com validade jurídica.", category: "Produtividade & Ferramentas", status: "lancado", demoUrl: "https://docseguro.lovable.app/", coverUrl: ASSETS.appsDoculens, monetization: "lifetime", priceLabel: "R$ 67 acesso vitalício" },
  { slug: "metaworkshop", name: "MetaWorkshop", tagline: "Oficinas metavirtuais", description: "Ambiente colaborativo para workshops guiados com salas, quadros e templates.", category: "Produtividade & Ferramentas", status: "beta", demoUrl: "https://factory-workshop-magic.lovable.app/", coverUrl: ASSETS.appsMetaworkshop, monetization: "b2b", priceLabel: "A partir de R$ 197/mês" },
  { slug: "feedlytics", name: "Feedlytics", tagline: "Analytics para creators", description: "Dashboard unificado de métricas de Instagram, TikTok e YouTube com relatórios de marca.", category: "Produtividade & Ferramentas", status: "lancado", demoUrl: "https://feedlyticss.lovable.app/", coverUrl: ASSETS.appsFeedlytics, monetization: "freemium", priceLabel: "Grátis · Pro R$ 29,90/mês" },
  { slug: "joblens", name: "JobLens", tagline: "Vagas certas para você", description: "IA analisa seu currículo e recomenda vagas alinhadas ao seu perfil e valores.", category: "Produtividade & Ferramentas", status: "beta", demoUrl: "https://job-lens-ai-26.lovable.app/", coverUrl: ASSETS.appsJoblens, monetization: "freemium", priceLabel: "Grátis · Pro R$ 19,90/mês" },

  // ─── Saúde & Farmácia ────────────────────────────────────────────────
  { slug: "pds", name: "PDS — Pharma Dispense System", tagline: "Sistema de dispensação farmacêutica", description: "Dashboard clínico com receitas, dispensação, estoque e alertas — pronto para farmácias.", category: "Saúde & Farmácia", status: "lancado", featured: true, demoUrl: "https://dispenser.lovable.app/", coverUrl: ASSETS.appsPds, monetization: "b2b", priceLabel: "A partir de R$ 297/mês" },
  { slug: "pharmadispense", name: "PharmaDispense", tagline: "Dispensação inteligente", description: "Automatiza dispensação de medicamentos com validação e histórico do paciente.", category: "Saúde & Farmácia", status: "beta", demoUrl: "https://pharmadispense.lovable.app/", coverUrl: ASSETS.appsPharmadispense, monetization: "b2b", priceLabel: "A partir de R$ 197/mês" },
  { slug: "farmaapp", name: "FarmaApp", tagline: "Farmácia no seu bolso", description: "Consulta de medicamentos, alertas de interação e lembretes de dose para pacientes.", category: "Saúde & Farmácia", status: "beta", demoUrl: "https://farmaapp.lovable.app/", coverUrl: ASSETS.appsFarmaapp, monetization: "freemium", priceLabel: "Grátis · Pro R$ 14,90/mês" },

  // ─── Finanças & Jurídico ─────────────────────────────────────────────
  { slug: "calc-trabalhista", name: "Calculadora Trabalhista Brasil", tagline: "Rescisão sem susto", description: "Calcula rescisão, férias, 13º e verbas trabalhistas com base na CLT vigente.", category: "Finanças & Jurídico", status: "lancado", featured: true, demoUrl: "https://rescisaotrabalhista.lovable.app/", coverUrl: ASSETS.appsCalcTrabalhista, monetization: "lifetime", priceLabel: "R$ 47 acesso vitalício" },
  { slug: "amor-financas", name: "Amor & Finanças Juntos", tagline: "Finanças a dois", description: "Gestão financeira compartilhada para casais — metas, contas e conversas guiadas.", category: "Finanças & Jurídico", status: "lancado", demoUrl: "https://amorefinancas.lovable.app/", coverUrl: ASSETS.appsAmorFinancas, monetization: "freemium", priceLabel: "Grátis · Pro R$ 19,90/mês" },
  { slug: "freelance-free", name: "FreelanceFree", tagline: "Freelas sem imposto surpresa", description: "Simulador de MEI, DAS, DAS-MEI e fluxo de caixa para freelancers.", category: "Finanças & Jurídico", status: "lancado", demoUrl: "https://freelancee.lovable.app/", coverUrl: ASSETS.appsFreelanceFree, monetization: "lifetime", priceLabel: "R$ 67 acesso vitalício" },
  { slug: "pix-secret-perks", name: "Pix Secret Perks", tagline: "Segredos do Pix", description: "Descobrir cashbacks, benefícios ocultos e otimizações do Pix por instituição.", category: "Finanças & Jurídico", status: "beta", demoUrl: "https://pix-secret-perks.lovable.app/", coverUrl: ASSETS.appsPixSecretPerks, monetization: "freemium", priceLabel: "Grátis" },

  // ─── Comunidade & Social ─────────────────────────────────────────────
  { slug: "catholic-hub", name: "Catholic Hub — Versículo do Dia", tagline: "Fé, comunidade e crescimento", description: "Companheiro diário para vida católica: versículo, orações, devoções e comunidade.", category: "Comunidade & Social", status: "lancado", featured: true, demoUrl: "https://versiculododiaa.lovable.app/", coverUrl: ASSETS.appsCatholicHub, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },
  { slug: "vozes-unidas", name: "Vozes Unidas", tagline: "Vozes que transformam", description: "Plataforma para petições, campanhas e engajamento cívico local.", category: "Comunidade & Social", status: "beta", demoUrl: "https://vozes-unidas.lovable.app/", coverUrl: ASSETS.appsVozesUnidas, monetization: "gratis", priceLabel: "Gratuito" },
  { slug: "fluxo-olinda", name: "Fluxo Olinda", tagline: "Agenda cultural de Olinda", description: "Guia da vida cultural e turística de Olinda com eventos, roteiros e mapa.", category: "Comunidade & Social", status: "beta", demoUrl: "https://fluxolinda.lovable.app/", coverUrl: ASSETS.appsFluxoOlinda, monetization: "gratis", priceLabel: "Gratuito" },
  { slug: "fnledh", name: "FNLEDH — Direitos Humanos", tagline: "Direitos humanos, dignidade, justiça", description: "Fórum de direitos humanos com denúncias, apoio jurídico, campanhas e educação.", category: "Comunidade & Social", status: "lancado", demoUrl: "https://fnledh.lovable.app/", coverUrl: ASSETS.appsFnledh, monetization: "gratis", priceLabel: "Gratuito" },

  // ─── E-commerce & Lifestyle ──────────────────────────────────────────
  { slug: "ofertaprime", name: "OfertaPrime", tagline: "As melhores ofertas selecionadas", description: "Curadoria diária de ofertas premium — eletrônicos, moda, casa e mais.", category: "E-commerce & Lifestyle", status: "lancado", featured: true, demoUrl: "https://ofertajaa.lovable.app/", coverUrl: ASSETS.appsOfertaprime, monetization: "freemium", priceLabel: "Grátis · Pro R$ 14,90/mês" },
  { slug: "creators-x-editors", name: "Creators x Editors", tagline: "O editor certo para você", description: "Marketplace que conecta criadores a editores de vídeo verificados.", category: "E-commerce & Lifestyle", status: "lancado", demoUrl: "https://creatorsxeditors.lovable.app/", coverUrl: ASSETS.appsCreatorsXEditors, monetization: "bundle", priceLabel: "Comissão por projeto" },
  { slug: "centro-sobrevivencia", name: "Centro de Sobrevivência", tagline: "Bushcraft e vida offgrid", description: "Guias, checklists e comunidade para bushcraft, camping e sobrevivência urbana.", category: "E-commerce & Lifestyle", status: "beta", demoUrl: "https://centrodesobrevivencia.lovable.app/", coverUrl: ASSETS.appsCentroSobrevivencia, monetization: "freemium", priceLabel: "Grátis · Pro R$ 19,90/mês" },
  { slug: "fresh-mind-keeper", name: "Fresh Mind Keeper", tagline: "Mente fresca todo dia", description: "Rotina diária de pausas, respiração e mini-meditações para dias de alta demanda.", category: "E-commerce & Lifestyle", status: "beta", demoUrl: "https://fresh-mind-keeper.lovable.app/", coverUrl: ASSETS.appsFreshMindKeeper, monetization: "freemium", priceLabel: "Grátis · Pro R$ 9,90/mês" },

  // ─── Educação p/ Concursos ──────────────────────────────────────────
  { slug: "flashctb", name: "FlashCTB", tagline: "CTB na ponta da língua", description: "Flashcards inteligentes com Código de Trânsito Brasileiro — memorização espaçada.", category: "Educação p/ Concursos", status: "lancado", featured: true, demoUrl: "https://ctb-flash-master.lovable.app/", coverUrl: ASSETS.appsFlashctb, monetization: "lifetime", priceLabel: "R$ 47 acesso vitalício" },
];

export const APPS: AppItem[] = raw.map((a) => ({
  slug: a.slug,
  name: a.name,
  tagline: a.tagline,
  description: a.description,
  category: a.category,
  status: a.status,
  featured: a.featured,
  demoUrl: a.demoUrl,
  coverUrl: a.coverUrl,
  premiumCoverUrl: PREMIUM_COVERS[a.slug],
  monetization: a.monetization,
  priceLabel: a.priceLabel,
  gradient: G[a.category],
  fundingGoalCents: a.goal ?? 500000,
  fundingRaisedCents: a.raised ?? 0,
}));

export const APP_CATEGORIES: AppCategory[] = [
  "Autoconhecimento & IA",
  "Educação & Infantil",
  "Produtividade & Ferramentas",
  "Saúde & Farmácia",
  "Finanças & Jurídico",
  "Comunidade & Social",
  "E-commerce & Lifestyle",
  "Educação p/ Concursos",
];

export const STATUS_LABEL: Record<AppStatus, string> = {
  lancado: "Lançado",
  beta: "Beta",
  "em-desenvolvimento": "Em desenvolvimento",
  conceito: "Conceito",
};

export const MONETIZATION_LABEL: Record<Monetization, string> = {
  freemium: "Freemium",
  lifetime: "Acesso vitalício",
  b2b: "B2B / SaaS",
  bundle: "Bundle / Marketplace",
  gratis: "Gratuito",
};

export function getApp(slug: string): AppItem | null {
  return APPS.find((a) => a.slug === slug) ?? null;
}

export type FundingTierId = "apoiador" | "colaborador" | "co-criador" | "visionario";

export interface FundingTier {
  id: FundingTierId;
  label: string;
  minCents: number;
  maxCents: number | null;
  defaultCents: number;
  priceLabel: string;
  headline: string;
  perks: string[];
}

export const FUNDING_TIERS: readonly FundingTier[] = [
  {
    id: "apoiador",
    label: "Apoiador",
    minCents: 2500,
    maxCents: 5000,
    defaultCents: 2500,
    priceLabel: "R$ 25 – R$ 50",
    headline: "Seu nome no Roll dos Criadores Parceiros",
    perks: [
      "Nome no Roll dos Criadores Parceiros (seção Apoiadores)",
      "Acesso antecipado a versões beta do app",
      "Newsletter exclusiva com atualizações de desenvolvimento",
    ],
  },
  {
    id: "colaborador",
    label: "Colaborador",
    minCents: 5100,
    maxCents: 15000,
    defaultCents: 10000,
    priceLabel: "R$ 51 – R$ 150",
    headline: "Roll + acesso vitalício Pro do app",
    perks: [
      "Todos os benefícios do nível Apoiador",
      "Nome com destaque na seção Colaboradores",
      "Acesso vitalício à versão Pro deste app",
      "Sessão de feedback exclusiva com o desenvolvedor",
    ],
  },
  {
    id: "co-criador",
    label: "Co-Criador",
    minCents: 15100,
    maxCents: 30000,
    defaultCents: 20000,
    priceLabel: "R$ 151 – R$ 300",
    headline: "Bundle vitalício + menção pública",
    perks: [
      "Todos os benefícios do nível Colaborador",
      "Destaque premium na seção Co-Criadores (foto/link opcional)",
      "Acesso vitalício a um bundle temático de apps",
      "Menção em vídeo de lançamento ou post oficial",
    ],
  },
  {
    id: "visionario",
    label: "Visionário",
    minCents: 30100,
    maxCents: null,
    defaultCents: 50000,
    priceLabel: "R$ 301+",
    headline: "Mentoria 1:1 + influência no roadmap",
    perks: [
      "Todos os benefícios do nível Co-Criador",
      "Destaque premium na seção Visionários",
      "Sessão de mentoria/consultoria de 1 hora",
      "Oportunidade de sugerir uma funcionalidade ou melhoria",
    ],
  },
];

export function getFundingTier(id: string): FundingTier | null {
  return FUNDING_TIERS.find((t) => t.id === id) ?? null;
}
