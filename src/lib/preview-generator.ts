/**
 * Gerador de preview de site para prospects.
 * Design rico inspirado em deliverybr.lovable.app:
 * - Hero com gradiente + overlay
 * - Cards de categorias
 * - Grid de produtos/destaques ESPECÍFICO POR NICHO
 * - Seção sobre com stats
 * - Galeria
 * - Mapa com Google Maps embed
 * - CTA WhatsApp + Como Chegar
 * - Footer com "Criado por Clodoaldo Silva"
 * - PWA meta tags com logo
 */

export interface PreviewLead {
  name: string;
  niche?: string;
  category?: string;
  formatted_address?: string;
  city?: string;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  lat?: number;
  lng?: number;
}

// =====================================================
// NICHE CONFIG — conteúdo específico por nicho
// =====================================================
interface NicheConfig {
  colors: { primary: string; accent: string; dark: string };
  heroBadge: string;
  heroSubtitle: (city: string) => string;
  searchPlaceholder: string;
  categoryPills: string[];
  sectionTitle: string;
  sectionSub: string;
  features: { emoji: string; tag: string; title: string; desc: string }[];
  aboutText: (name: string, niche: string, city: string, rating?: number | null, total?: number | null) => string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
}

const NICHE_CONFIG: Record<string, NicheConfig> = {
  // === BARBEARIA ===
  barbearia: {
    colors: { primary: "#FFD600", accent: "#263238", dark: "#1a1a1a" },
    heroBadge: "✂️ Barbearia Premium",
    heroSubtitle: (city) => `A melhor barbearia de ${city}`,
    searchPlaceholder: "Buscar cortes, serviços...",
    categoryPills: ["⭐ Cortes", "🧔 Barba", "💈 Pigmentação", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossos Serviços",
    sectionSub: "Cortes e serviços de barbearia premium",
    features: [
      { emoji: "✂️", tag: "Mais pedido", title: "Corte Degradê", desc: "Corte moderno com degradê navalhado, finalização com pomada e estilo exclusivo." },
      { emoji: "🧔", tag: "Premium", title: "Barba Modelada", desc: "Modelagem de barba com toalha quente, óleos essenciais e acabamento de navalha." },
      { emoji: "💈", tag: "Exclusivo", title: "Pigmentação", desc: "Pigmentação de barba e cabelo para disfarçar falhas e dar um visual mais marcante." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em barbearia em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações de clientes satisfeitos, ` : "") +
      `oferecemos cortes modernos, barba modelada e uma experiência masculina completa com ambiente acolhedor e profissionais experientes.`,
    ctaTitle: "Pronto para um novo visual?",
    ctaSubtitle: "Agende seu horário pelo WhatsApp",
    ctaButton: "📅 Agendar Horário",
  },

  // === RESTAURANTE ===
  restaurante: {
    colors: { primary: "#FE7B02", accent: "#FE3F21", dark: "#1b1b1b" },
    heroBadge: "🔥 Em alta · Restaurante",
    heroSubtitle: (city) => `O melhor da culinária em ${city}`,
    searchPlaceholder: "Buscar pratos, bebidas...",
    categoryPills: ["⭐ Destaques", "🔥 Mais pedidos", "🆕 Novidades", "💰 Promoções", "📍 Localização"],
    sectionTitle: "Destaques",
    sectionSub: "Os favoritos dos nossos clientes",
    features: [
      { emoji: "🍽️", tag: "Mais pedido", title: "Especial da Casa", desc: "Nosso prato mais famoso, preparado com ingredientes selecionados e muito amor." },
      { emoji: "🥗", tag: "Saudável", title: "Opção Fitness", desc: "Para quem busca sabor com equilíbrio. Fresco, leve e nutritivo." },
      { emoji: "🥤", tag: "Combo", title: "Bebidas & Sobremesas", desc: "Complete sua experiência com nossa seleção de bebidas e sobremesas." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo ao <strong style="color:#fff">${name}</strong>! Somos referência em gastronomia em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações de clientes satisfeitos, ` : "") +
      `oferecemos qualidade excepcional, atendimento dedicado e uma experiência que vai superar suas expectativas.`,
    ctaTitle: "Pronto para experimentar?",
    ctaSubtitle: "Peça agora mesmo pelo WhatsApp e receba em casa",
    ctaButton: "📱 Fazer Pedido",
  },

  // === PIZZARIA ===
  pizzaria: {
    colors: { primary: "#E65100", accent: "#FF6F00", dark: "#1b1b1b" },
    heroBadge: "🍕 Pizzaria Artesanal",
    heroSubtitle: (city) => `Pizzas artesanais em ${city}`,
    searchPlaceholder: "Buscar sabores de pizza...",
    categoryPills: ["⭐ Tradicionais", "🔥 Especiais", "🆕 Novidades", "🥤 Bebidas", "💰 Combos"],
    sectionTitle: "Nossas Pizzas",
    sectionSub: "Massa artesanal, ingredientes selecionados",
    features: [
      { emoji: "🍕", tag: "Mais pedida", title: "Pizza Margherita", desc: "Molho artesanal, mussarela de búfala, manjericário fresco e azeite extra virgem." },
      { emoji: "🍖", tag: "Especial", title: "Pizza Portuguesa", desc: "Presunto, ovos, cebola, ervilha, azeitona e muita mussarela." },
      { emoji: "🍫", tag: "Doce", title: "Pizza de Chocolate", desc: "Chocolate ao leite derretido com morangos frescos e leite condensado." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em pizzas artesanais em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `nossa massa é preparada fermentation natural por 24h, com ingredientes frescos e muito amor.`,
    ctaTitle: "Pronto para matar a fome?",
    ctaSubtitle: "Peça sua pizza agora pelo WhatsApp",
    ctaButton: "🍕 Pedir Pizza",
  },

  // === HAMBURGUERIA ===
  hamburgueria: {
    colors: { primary: "#FFC107", accent: "#5D4037", dark: "#1b1b1b" },
    heroBadge: "🍔 Hamburgueria Artesanal",
    heroSubtitle: (city) => `Os melhores burgers de ${city}`,
    searchPlaceholder: "Buscar burgers, combos...",
    categoryPills: ["⭐ Burgers", "🔥 Mais pedidos", "🍟 Combos", "🥤 Bebidas", "🆕 Novidades"],
    sectionTitle: "Nossos Burgers",
    sectionSub: "Carne 180g, pão brioche, ingredientes frescos",
    features: [
      { emoji: "🍔", tag: "Mais pedido", title: "Burger Clássico", desc: "180g de blend artesanal, cheddar, bacon caramelizado, picles e molho da casa." },
      { emoji: "🧀", tag: "Premium", title: "Burger Duplo Cheddar", desc: "Duas carnes 180g, cheddar duplo cremoso, cebola caramelizada e bacon." },
      { emoji: "🍟", tag: "Combo", title: "Combo Bacon", desc: "Burger + batata rústica com bacon + bebida gelada. Completo e satisfatório." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em burgers artesanais em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `trabalhamos com carnes selecionadas, pão brioche artesanal e ingredientes frescos todos os dias.`,
    ctaTitle: "Pronto para devorar?",
    ctaSubtitle: "Peça seu burger agora pelo WhatsApp",
    ctaButton: "🍔 Pedir Burger",
  },

  // === CAFETERIA ===
  cafeteria: {
    colors: { primary: "#8D6E63", accent: "#4E342E", dark: "#1b1b1b" },
    heroBadge: "☕ Cafeteria Artesanal",
    heroSubtitle: (city) => `Café especial em ${city}`,
    searchPlaceholder: "Buscar cafés, doces...",
    categoryPills: ["☕ Cafés", "🍰 Doces", "🥐 Salgados", "🆕 Novidades", "💰 Combos"],
    sectionTitle: "Nosso Cardápio",
    sectionSub: "Café especial torrado na hora",
    features: [
      { emoji: "☕", tag: "Mais pedido", title: "Café Espresso", desc: "Grãos selecionados, torra artesanal e extração perfeita. Puro sabor." },
      { emoji: "🍰", tag: "Doce", title: "Pão de Mel", desc: "Massa fofinha com mel, recheio de doce de leite e cobertura de chocolate." },
      { emoji: "🥐", tag: "Salgado", title: "Croissant Artesanal", desc: "Massa folhada crocante com manteiga francesa. Recém-assado todas as manhãs." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em café especial em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `trabalhamos com grãos de origem, torra própria e um ambiente acolhedor para você relaxar.`,
    ctaTitle: "Pronto para um café?",
    ctaSubtitle: "Faça seu pedido pelo WhatsApp",
    ctaButton: "☕ Pedir Agora",
  },

  // === ACADEMIA ===
  academia: {
    colors: { primary: "#00C853", accent: "#1B5E20", dark: "#1b1b1b" },
    heroBadge: "💪 Academia Premium",
    heroSubtitle: (city) => `Sua melhor versão em ${city}`,
    searchPlaceholder: "Buscar planos, modalidades...",
    categoryPills: ["⭐ Planos", "🔥 Musculação", "🤼 Funcional", "🧘 Personal", "💰 Promoções"],
    sectionTitle: "Nossos Planos",
    sectionSub: "Estrutura completa, profissionais qualificados",
    features: [
      { emoji: "💪", tag: "Mais popular", title: "Plano Musculação", desc: "Acesso completo à sala de musculação, avaliação física e acompanhamento." },
      { emoji: "🤼", tag: "Premium", title: "Funcional + Musculação", desc: "Treinos funcionais em grupo + musculação ilimitada. Resultados acelerados." },
      { emoji: "🧘", tag: "Exclusivo", title: "Personal Trainer", desc: "Treino individualizado com personal trainer dedicado ao seu objetivo." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em fitness em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos estrutura moderna, equipamentos de ponta e profissionais qualificados para você alcançar seus objetivos.`,
    ctaTitle: "Pronto para treinar?",
    ctaSubtitle: "Agende sua aula experimental grátis",
    ctaButton: "💪 Aula Grátis",
  },

  // === SALÃO DE BELEZA ===
  "salao de beleza": {
    colors: { primary: "#E91E63", accent: "#880E4F", dark: "#1b1b1b" },
    heroBadge: "💅 Salão de Beleza",
    heroSubtitle: (city) => `Beleza e estética em ${city}`,
    searchPlaceholder: "Buscar serviços, tratamentos...",
    categoryPills: ["💅 Unhas", "💇 Cabelos", "💆 Estética", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossos Serviços",
    sectionSub: "Beleza, estética e bem-estar",
    features: [
      { emoji: "💅", tag: "Mais pedido", title: "Manicure & Pedicure", desc: "Unhas perfeitas com esmaltação, hidratação e acabamento profissional." },
      { emoji: "💇", tag: "Premium", title: "Escova & Corte", desc: "Corte moderno, escova modeladora e tratamento profundo para seus cabelos." },
      { emoji: "💆", tag: "Exclusivo", title: "Limpeza de Pele", desc: "Limpeza profunda, esfoliação e máscara hidratante para uma pele renovada." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo ao <strong style="color:#fff">${name}</strong>! Somos referência em beleza e estética em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos serviços profissionais com produtos premium e uma equipe experiente para realçar sua beleza.`,
    ctaTitle: "Pronta para se cuidar?",
    ctaSubtitle: "Agende seu horário pelo WhatsApp",
    ctaButton: "💅 Agendar",
  },

  // === CLÍNICA ESTÉTICA ===
  "clinica estetica": {
    colors: { primary: "#E91E63", accent: "#880E4F", dark: "#1b1b1b" },
    heroBadge: "✨ Clínica Estética",
    heroSubtitle: (city) => `Estética avançada em ${city}`,
    searchPlaceholder: "Buscar tratamentos...",
    categoryPills: ["✨ Tratamentos", "💉 Botox", "🔬 Laser", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossos Tratamentos",
    sectionSub: "Tecnologia avançada, profissionais qualificados",
    features: [
      { emoji: "💉", tag: "Mais pedido", title: "Botox", desc: "Tratamento de rugas e linhas de expressão com toxina botulínica de qualidade." },
      { emoji: "🔬", tag: "Premium", title: "Laser Depilatório", desc: "Depilação definitiva com laser de última geração. Menos dor, mais resultado." },
      { emoji: "✨", tag: "Exclusivo", title: "Preenchimento", desc: "Preenchimento de ácido hialurônico para lábios, bigode chinês e olheiras." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em estética avançada em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos tratamentos seguros com tecnologia de ponta e profissionais especializados.`,
    ctaTitle: "Pronta para se cuidar?",
    ctaSubtitle: "Agende sua avaliação gratuita",
    ctaButton: "📅 Agendar Avaliação",
  },

  // === FARMÁCIA ===
  farmacia: {
    colors: { primary: "#42A5F5", accent: "#0D47A1", dark: "#1b1b1b" },
    heroBadge: "💊 Farmácia Online",
    heroSubtitle: (city) => `Sua saúde em primeiro lugar em ${city}`,
    searchPlaceholder: "Buscar medicamentos...",
    categoryPills: ["💊 Medicamentos", "🧴 Higiene", "💪 Suplementos", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Categorias",
    sectionSub: "Tudo para sua saúde e bem-estar",
    features: [
      { emoji: "💊", tag: "Mais vendido", title: "Medicamentos", desc: "Medicamentos de marca e genéricos com entrega rápida em toda a região." },
      { emoji: "🧴", tag: "Essencial", title: "Higiene & Beleza", desc: "Produtos de higiene pessoal, cosméticos e cuidados com a pele." },
      { emoji: "💪", tag: "Saúde", title: "Suplementos", desc: "Vitaminas, proteínas e suplementos para complementar sua alimentação." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em farmácia em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos medicamentos, produtos de higiene e entrega rápida com farmacêuticos disponíveis para orientação.`,
    ctaTitle: "Precisa de medicamentos?",
    ctaSubtitle: "Peça pelo WhatsApp com entrega em casa",
    ctaButton: "💊 Pedir Agora",
  },

  // === PET SHOP ===
  "pet shop": {
    colors: { primary: "#66BB6A", accent: "#2E7D32", dark: "#1b1b1b" },
    heroBadge: "🐶 Pet Shop",
    heroSubtitle: (city) => `Tudo para seu pet em ${city}`,
    searchPlaceholder: "Buscar produtos, serviços...",
    categoryPills: ["🐶 Cães", "🐱 Gatos", "🛁 Banho & Tosa", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossos Serviços",
    sectionSub: "Cuidando do seu melhor amigo",
    features: [
      { emoji: "🛁", tag: "Mais pedido", title: "Banho & Tosa", desc: "Banho, tosa higiênica ou completa, corte de unhas e perfumaria." },
      { emoji: "🍖", tag: "Essencial", title: "Ração Premium", desc: "Rações premium e super premium para cães e gatos de todas as idades." },
      { emoji: "🩺", tag: "Saúde", title: "Veterinário", desc: "Consulta veterinária, vacinação e orientação para saúde do seu pet." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo ao <strong style="color:#fff">${name}</strong>! Somos referência em pet shop em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos banho e tosa, ração, acessórios e atendimento veterinário para o seu melhor amigo.`,
    ctaTitle: "Pronto para cuidar do seu pet?",
    ctaSubtitle: "Agende banho ou peça produtos pelo WhatsApp",
    ctaButton: "🐶 Agendar Banho",
  },

  // === ESCRITÓRIO DE ADVOCACIA ===
  "escritorio de advocacia": {
    colors: { primary: "#BFA15A", accent: "#3E2723", dark: "#1a1a1a" },
    heroBadge: "⚖️ Advocacia",
    heroSubtitle: (city) => `Assessoria jurídica em ${city}`,
    searchPlaceholder: "Buscar áreas de atuação...",
    categoryPills: ["⚖️ Áreas", "💼 Consultoria", "📜 Contratos", "🆕 Artigos", "📞 Contato"],
    sectionTitle: "Áreas de Atuação",
    sectionSub: "Experiência jurídica para proteger seus direitos",
    features: [
      { emoji: "⚖️", tag: "Principal", title: "Direito Civil", desc: "Ações familiares, inventários, divórcios, indenizações e questões patrimoniais." },
      { emoji: "💼", tag: "Empresarial", title: "Direito Empresarial", desc: "Assessoria para empresas, contratos, societário e recuperação judicial." },
      { emoji: "🏭", tag: "Trabalhista", title: "Direito do Trabalho", desc: "Atuação para empregados e empregadores, verbas trabalhistas e rescisões." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo ao escritório <strong style="color:#fff">${name}</strong>! Somos referência em advocacia em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `atuamos com excelência técnica, ética e compromisso para defender seus direitos com dedicação total.`,
    ctaTitle: "Precisa de assessoria jurídica?",
    ctaSubtitle: "Agende uma consulta inicial pelo WhatsApp",
    ctaButton: "⚖️ Agendar Consulta",
  },

  // === CONSULTÓRIO ODONTOLÓGICO ===
  "consultorio odontologico": {
    colors: { primary: "#26C6DA", accent: "#006064", dark: "#1b1b1b" },
    heroBadge: "🦷 Odontologia",
    heroSubtitle: (city) => `Sorriso saudável em ${city}`,
    searchPlaceholder: "Buscar tratamentos...",
    categoryPills: ["🦷 Tratamentos", "✨ Estética", "🧒 Infantil", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossos Tratamentos",
    sectionSub: "Tecnologia, conforto e sorrisos incríveis",
    features: [
      { emoji: "🦷", tag: "Mais pedido", title: "Clareamento", desc: "Clareamento dental profissional com tecnologia segura e resultados visíveis." },
      { emoji: "✨", tag: "Estética", title: "Lentes de Contato", desc: "Lentes de contato dentais para um sorriso harmonioso e natural." },
      { emoji: "🛡️", tag: "Prevenção", title: "Limpeza & Prevenção", desc: "Limpeza profissional, raspagem e orientação para saúde bucal completa." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo ao <strong style="color:#fff">${name}</strong>! Somos referência em odontologia em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos tratamentos modernos com tecnologia de ponta e uma equipe experiente para cuidar do seu sorriso.`,
    ctaTitle: "Pronto para um sorriso novo?",
    ctaSubtitle: "Agende sua avaliação pelo WhatsApp",
    ctaButton: "🦷 Agendar Avaliação",
  },

  // === LOJA DE ROUPAS ===
  "loja de roupas": {
    colors: { primary: "#AB47BC", accent: "#4A148C", dark: "#1b1b1b" },
    heroBadge: "👗 Moda & Estilo",
    heroSubtitle: (city) => `Moda feminina e masculina em ${city}`,
    searchPlaceholder: "Buscar roupas, acessórios...",
    categoryPills: ["👗 Feminino", "👔 Masculino", "👜 Acessórios", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossas Coleções",
    sectionSub: "Moda atual, qualidade e estilo",
    features: [
      { emoji: "👗", tag: "Mais vendido", title: "Coleção Feminina", desc: "Vestidos, blusas, calças e conjuntos com design exclusivo e tecidos premium." },
      { emoji: "👔", tag: "Essencial", title: "Coleção Masculina", desc: "Camisas, camisetas, bermudas e acessórios para o homem moderno." },
      { emoji: "👜", tag: "Acessórios", title: "Bolsas & Cintos", desc: "Acessórios que completam seu visual com elegância e sofisticação." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em moda em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos roupas com design exclusivo, qualidade premium e atendimento personalizado para você arrumar.`,
    ctaTitle: "Pronta para renovar o guarda-roupa?",
    ctaSubtitle: "Compre pelo WhatsApp com entrega em casa",
    ctaButton: "👗 Comprar Agora",
  },

  // === PAPELARIA ===
  papelaria: {
    colors: { primary: "#5C6BC0", accent: "#1A237E", dark: "#1b1b1b" },
    heroBadge: "📚 Papelaria",
    heroSubtitle: (city) => `Material escolar e escritório em ${city}`,
    searchPlaceholder: "Buscar produtos...",
    categoryPills: ["📚 Escolar", "💼 Escritório", "🎨 Artes", "🖨️ Impressão", "💰 Promoções"],
    sectionTitle: "Categorias",
    sectionSub: "Tudo para escola, escritório e arte",
    features: [
      { emoji: "📚", tag: "Mais vendido", title: "Material Escolar", desc: "Cadernos, canetas, lápis, mochilas e tudo para o ano letivo." },
      { emoji: "💼", tag: "Escritório", title: "Material de Escritório", desc: "Suprimentos para escritório, papéis, pastas e organização." },
      { emoji: "🖨️", tag: "Serviço", title: "Impressão & Cópias", desc: "Impressões, cópias, plastificação e serviços gráficos personalizados." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em papelaria em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos material escolar, de escritório, serviços de impressão e muito mais com qualidade e preço justo.`,
    ctaTitle: "Precisa de material?",
    ctaSubtitle: "Peça pelo WhatsApp com entrega",
    ctaButton: "📚 Pedir Agora",
  },

  // === ESTÉTICA AUTOMOTIVA ===
  "estetica automotiva": {
    colors: { primary: "#78909C", accent: "#263238", dark: "#1b1b1b" },
    heroBadge: "🚗 Estética Automotiva",
    heroSubtitle: (city) => `Seu carro como novo em ${city}`,
    searchPlaceholder: "Buscar serviços...",
    categoryPills: ["🚗 Higienização", "✨ Polimento", "🛡️ Vitificação", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Nossos Serviços",
    sectionSub: "Cuidando do seu veículo com tecnologia",
    features: [
      { emoji: "🧼", tag: "Mais pedido", title: "Higienização Interna", desc: "Limpeza profunda de bancos, painel, teto e carpete. Interior como novo." },
      { emoji: "✨", tag: "Premium", title: "Polimento Técnico", desc: "Polimento com máquina para remover swirls, riscos e devolver o brilho." },
      { emoji: "🛡️", tag: "Proteção", title: "Vitificação", desc: "Vitrificação da pintura para proteção duradoura e brilho intenso." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em estética automotiva em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos higienização, polimento e proteção automotiva com produtos premium e equipe especializada.`,
    ctaTitle: "Pronto para deixar seu carro como novo?",
    ctaSubtitle: "Agende seu serviço pelo WhatsApp",
    ctaButton: "🚗 Agendar",
  },

  // === IMOBILIÁRIA ===
  imobiliaria: {
    colors: { primary: "#26A69A", accent: "#004D40", dark: "#1b1b1b" },
    heroBadge: "🏠 Imobiliária",
    heroSubtitle: (city) => `Encontre seu imóvel em ${city}`,
    searchPlaceholder: "Buscar imóveis...",
    categoryPills: ["🏠 Venda", "🔑 Aluguel", "🏢 Apartamentos", "🏡 Casas", "💰 Avaliação"],
    sectionTitle: "Imóveis em Destaque",
    sectionSub: "Os melhores imóveis da região",
    features: [
      { emoji: "🏢", tag: "Mais procurado", title: "Apartamentos", desc: "Apartamentos de 1 a 4 quartos em todos os bairros, com financiamento facilitado." },
      { emoji: "🏡", tag: "Família", title: "Casas", desc: "Casas amplas com quintal, garagem e localização privilegiada para sua família." },
      { emoji: "🔑", tag: "Aluguel", title: "Aluguel Rápido", desc: "Imóveis para alugar com contrato ágil e sem burocracia excessiva." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em imóveis em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos os melhores imóveis para venda e locação, com corretores experientes e atendimento personalizado.`,
    ctaTitle: "Procurando imóvel?",
    ctaSubtitle: "Fale com um corretor pelo WhatsApp",
    ctaButton: "🏠 Falar com Corretor",
  },

  // === CONTABILIDADE ===
  contabilidade: {
    colors: { primary: "#42A5F5", accent: "#0D47A1", dark: "#1b1b1b" },
    heroBadge: "📊 Contabilidade",
    heroSubtitle: (city) => `Gestão contábil em ${city}`,
    searchPlaceholder: "Buscar serviços...",
    categoryPills: ["📊 Contábil", "💼 Fiscal", "💰 Folha", "🏢 Abertura", "📞 Consultoria"],
    sectionTitle: "Nossos Serviços",
    sectionSub: "Contabilidade digital, fiscal e trabalhista",
    features: [
      { emoji: "📊", tag: "Principal", title: "Contabilidade Digital", desc: "Escrituração contábil digital, balancetes, DRE e relatórios gerenciais." },
      { emoji: "💼", tag: "Fiscal", title: "Departamento Fiscal", desc: "Apuração de impostos, SPED, emissão de notas fiscais e gestão de tributos." },
      { emoji: "🏢", tag: "Abertura", title: "Abertura de Empresa", desc: "Abertura, alteração e baixa de empresas com toda a parte burocrática resolvida." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em contabilidade em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos serviços contábeis, fiscais e trabalhistas para empresas de todos os portes com tecnologia e expertise.`,
    ctaTitle: "Precisa de contabilidade?",
    ctaSubtitle: "Agende uma consultoria gratuita pelo WhatsApp",
    ctaButton: "📊 Consultoria Grátis",
  },

  // === AGÊNCIA DE MARKETING ===
  "agencia de marketing": {
    colors: { primary: "#7C4DFF", accent: "#311B92", dark: "#1b1b1b" },
    heroBadge: "🚀 Marketing Digital",
    heroSubtitle: (city) => `Marketing digital que converte em ${city}`,
    searchPlaceholder: "Buscar serviços...",
    categoryPills: ["📱 Social Media", "🎯 Tráfego Pago", "🌐 Sites", "📝 Conteúdo", "📞 Consultoria"],
    sectionTitle: "Nossos Serviços",
    sectionSub: "Estratégias digitais que geram resultados",
    features: [
      { emoji: "📱", tag: "Mais pedido", title: "Gestão de Redes Sociais", desc: "Criação de conteúdo, artes e gestão completa de Instagram, Facebook e TikTok." },
      { emoji: "🎯", tag: "Performance", title: "Tráfego Pago", desc: "Campanhas no Google e Meta Ads com otimização para máximo ROI." },
      { emoji: "🌐", tag: "Web", title: "Criação de Sites", desc: "Sites profissionais, landing pages e e-commerce responsivos e otimizados." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em marketing digital em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `criamos estratégias digitais personalizadas para sua empresa crescer online com resultados mensuráveis.`,
    ctaTitle: "Pronto para crescer online?",
    ctaSubtitle: "Agende uma consultoria estratégica gratuita",
    ctaButton: "🚀 Consultoria Grátis",
  },

  // === ESTÚDIO DE PILATES ===
  "estudio de pilates": {
    colors: { primary: "#26C6DA", accent: "#006064", dark: "#1b1b1b" },
    heroBadge: "🧘 Estúdio de Pilates",
    heroSubtitle: (city) => `Pilates e bem-estar em ${city}`,
    searchPlaceholder: "Buscar modalidades...",
    categoryPills: ["🧘 Pilates", "💪 Funcional", "🆕 Novidades", "💰 Promoções", "📍 Localização"],
    sectionTitle: "Nossas Modalidades",
    sectionSub: "Pilates para todos os níveis e objetivos",
    features: [
      { emoji: "🧘", tag: "Mais procurado", title: "Pilates Solo", desc: "Pilates no solo com foco em core, postura e fortalecimento muscular." },
      { emoji: "🛏️", tag: "Premium", title: "Pilates Aparelhos", desc: "Pilates com aparelhos (reformer, cadeira, cadillac) para resultado acelerado." },
      { emoji: "💪", tag: "Complementar", title: "Treinamento Funcional", desc: "Treinos funcionais integrados ao pilates para performance completa." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo ao <strong style="color:#fff">${name}</strong>! Somos referência em pilates em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos aulas de pilates solo e aparelhos com instrutores certificados para sua saúde e bem-estar.`,
    ctaTitle: "Pronta para começar?",
    ctaSubtitle: "Agende sua aula experimental grátis",
    ctaButton: "🧘 Aula Grátis",
  },

  // === LOJA DE CONVENIÊNCIA ===
  "loja de conveniencia": {
    colors: { primary: "#FFA726", accent: "#E65100", dark: "#1b1b1b" },
    heroBadge: "🏪 Loja de Conveniência",
    heroSubtitle: (city) => `Tudo que você precisa em ${city}`,
    searchPlaceholder: "Buscar produtos...",
    categoryPills: ["🏪 Produtos", "🍞 Padaria", "🥤 Bebidas", "🆕 Novidades", "💰 Promoções"],
    sectionTitle: "Categorias",
    sectionSub: "Conveniência 24h com entrega rápida",
    features: [
      { emoji: "🍞", tag: "Fresco", title: "Padaria & Cafés", desc: "Pães, salgados, cafés e lanches frescos todas as manhãs." },
      { emoji: "🥤", tag: "Bebidas", title: "Bebidas Geladas", desc: "Refrigerantes, sucos, cervejas e energéticos sempre gelados." },
      { emoji: "🏪", tag: "Essencial", title: "Cesta Básica", desc: "Produtos de primeira necessidade, higiene e limpeza para o dia a dia." },
    ],
    aboutText: (name, niche, city, rating, total) =>
      `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em conveniência em ${city}. ` +
      (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações, ` : "") +
      `oferecemos produtos essenciais, padaria, bebidas e muito mais com agilidade e atendimento 24h.`,
    ctaTitle: "Precisa de algo agora?",
    ctaSubtitle: "Peça pelo WhatsApp com entrega rápida",
    ctaButton: "🏪 Pedir Agora",
  },
};

// Fallback genérico para nichos não mapeados
const DEFAULT_CONFIG: NicheConfig = {
  colors: { primary: "#10b981", accent: "#059669", dark: "#1b1b1b" },
  heroBadge: "✨ Em alta",
  heroSubtitle: (city) => `Referência em ${city}`,
  searchPlaceholder: "Buscar produtos, serviços...",
  categoryPills: ["⭐ Destaques", "🔥 Mais procurados", "🆕 Novidades", "💰 Promoções", "📍 Localização"],
  sectionTitle: "Nossos Destaques",
  sectionSub: "Os favoritos dos nossos clientes",
  features: [
    { emoji: "⭐", tag: "Mais pedido", title: "Serviço Premium", desc: "Qualidade excepcional com atendimento dedicado e profissionais experientes." },
    { emoji: "🔥", tag: "Popular", title: "Mais Procurado", desc: "O serviço preferido dos nossos clientes, com resultados comprovados." },
    { emoji: "💎", tag: "Exclusivo", title: "Experiência Única", desc: "Atendimento personalizado que vai superar suas expectativas." },
  ],
  aboutText: (name, niche, city, rating, total) =>
    `Bem-vindo à <strong style="color:#fff">${name}</strong>! Somos referência em ${niche} em ${city}. ` +
    (rating ? `Com ${rating} estrelas no Google e ${total || 0} avaliações de clientes satisfeitos, ` : "") +
    `oferecemos qualidade, atendimento dedicado e uma experiência que vai superar suas expectativas.`,
  ctaTitle: "Pronto para começar?",
  ctaSubtitle: "Fale conosco pelo WhatsApp",
  ctaButton: "💬 Falar no WhatsApp",
};

export function generatePreviewHTML(lead: PreviewLead): string {
  // Normaliza o número de WhatsApp
  const waRaw = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
  const wa = waRaw.startsWith("55") ? waRaw : (waRaw.length === 10 || waRaw.length === 11 ? "55" + waRaw : waRaw);

  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + (lead.formatted_address || lead.city || ""))}`;
  const embed = `https://www.google.com/maps?q=${lead.lat || 0},${lead.lng || 0}&z=16&output=embed`;
  const n = lead.niche || lead.category || "estabelecimento";
  const city = lead.city || "";

  // Busca configuração do nicho (case-insensitive)
  const nicheKey = (n || "").toLowerCase().trim();
  const cfg = NICHE_CONFIG[nicheKey] || DEFAULT_CONFIG;
  const c = cfg.colors;

  // Constrói as features cards
  const featuresHtml = cfg.features.map(f => `
    <div class="feature-card">
      <div class="feature-img">${f.emoji}</div>
      <div class="feature-body">
        <span class="feature-tag">${f.tag}</span>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>
    </div>`).join("");

  // Constrói as pills de categoria
  const pillsHtml = cfg.categoryPills.map((p, i) =>
    `<div class="cat-pill ${i === 0 ? "active" : ""}">${p}</div>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${lead.name} | ${n} em ${city}</title>
<meta name="description" content="${lead.name} — ${n} em ${city}.${lead.rating ? ' ' + lead.rating + ' estrelas no Google.' : ''}">
<!-- PWA -->
<meta name="theme-color" content="${c.dark}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${lead.name}">
<link rel="icon" href="https://clodoaldo.vercel.app/assets/clodoaldo-logo.png">
<link rel="apple-touch-icon" href="https://clodoaldo.vercel.app/assets/clodoaldo-logo.png">
<!-- Open Graph -->
<meta property="og:title" content="${lead.name} | ${n} em ${city}">
<meta property="og:description" content="${lead.rating ? lead.rating + ' estrelas no Google.' : ''}">
<meta property="og:image" content="https://clodoaldo.vercel.app/assets/clodoaldo-logo.png">
<meta property="og:type" content="website">
<style>
:root{--primary:${c.primary};--accent:${c.accent};--dark:${c.dark};--gold:#FFD700}
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,system-ui,sans-serif}
body{background:${c.dark};color:#fff;overflow-x:hidden}

/* NAVBAR */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(${parseInt(c.dark.slice(1,3),16)},${parseInt(c.dark.slice(3,5),16)},${parseInt(c.dark.slice(5,7),16)},0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
.nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:64px}
.nav-logo{font-size:1.3rem;font-weight:800;letter-spacing:-0.5px;color:#fff;text-decoration:none}
.nav-logo span{color:var(--primary)}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-links a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s}
.nav-links a:hover{color:#fff}
.nav-cta{display:inline-flex;align-items:center;gap:6px;background:var(--primary);color:#fff;padding:8px 18px;border-radius:10px;font-size:.85rem;font-weight:700;text-decoration:none;transition:all .2s}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px var(--primary)44}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:80px 20px 60px;text-align:center}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at top,${c.primary}22 0%,transparent 60%),radial-gradient(ellipse at bottom,${c.accent}11 0%,transparent 50%),${c.dark};z-index:0}
.hero-content{position:relative;z-index:1;max-width:700px}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.12);padding:6px 16px;border-radius:30px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:var(--primary);margin-bottom:24px}
.hero h1{font-size:3rem;font-weight:900;letter-spacing:-1.5px;line-height:1;margin-bottom:12px;text-shadow:0 4px 30px rgba(0,0,0,0.5)}
.hero .sub{font-size:1.1rem;color:rgba(255,255,255,0.7);margin-bottom:28px;font-weight:400}
.hero .rating{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:10px 24px;border-radius:40px;margin-bottom:32px;font-size:1rem;font-weight:600}
.hero .rating .stars{color:var(--gold)}
.hero-buttons{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.btn-primary{display:inline-flex;align-items:center;gap:8px;padding:16px 40px;border-radius:14px;background:var(--primary);color:#fff;text-decoration:none;font-weight:800;font-size:1.05rem;box-shadow:0 10px 40px var(--primary)55;transition:all .25s;border:none;cursor:pointer}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 50px var(--primary)77}
.btn-outline{display:inline-flex;align-items:center;gap:8px;padding:16px 32px;border-radius:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;text-decoration:none;font-weight:600;font-size:1rem;transition:all .25s}
.btn-outline:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.3)}

/* SEARCH BAR */
.search-bar{max-width:500px;margin:0 auto 40px;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:12px 18px}
.search-bar input{flex:1;background:transparent;border:none;color:#fff;font-size:.95rem;outline:none}
.search-bar input::placeholder{color:rgba(255,255,255,0.4)}
.search-bar svg{color:rgba(255,255,255,0.4);flex-shrink:0}

/* CATEGORIES */
.categories{padding:20px;max-width:1200px;margin:0 auto}
.cat-pills{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cat-pill{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:40px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.cat-pill:hover,.cat-pill.active{background:var(--primary);border-color:var(--primary);color:#fff}

/* SECTION */
.section{max-width:1200px;margin:0 auto;padding:60px 20px}
.section-title{font-size:1.8rem;font-weight:800;margin-bottom:8px;letter-spacing:-0.5px}
.section-sub{color:rgba(255,255,255,0.5);font-size:.95rem;margin-bottom:32px}

/* FEATURE CARDS */
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.feature-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;overflow:hidden;transition:all .3s}
.feature-card:hover{border-color:var(--primary)44;transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.3)}
.feature-img{height:200px;background:linear-gradient(135deg,var(--primary)22,var(--accent)11);display:flex;align-items:center;justify-content:center;font-size:3rem}
.feature-body{padding:20px}
.feature-body h3{font-size:1.1rem;font-weight:700;margin-bottom:6px}
.feature-body p{color:rgba(255,255,255,0.5);font-size:.85rem;line-height:1.5}
.feature-tag{display:inline-block;background:var(--primary)22;color:var(--primary);padding:4px 12px;border-radius:20px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;text-align:center}
.stat{padding:30px 20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px}
.stat .num{font-size:2.5rem;font-weight:900;color:var(--primary);line-height:1}
.stat .label{font-size:.85rem;color:rgba(255,255,255,0.5);margin-top:8px;text-transform:uppercase;letter-spacing:1px}

/* MAP */
.map-container{border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);margin-top:20px}
.map-container iframe{width:100%;height:380px;border:0;display:block}
.map-info{padding:20px;background:rgba(255,255,255,0.03)}
.map-info p{color:rgba(255,255,255,0.6);font-size:.9rem;margin-bottom:4px}

/* CTA SECTION */
.cta-section{text-align:center;padding:80px 20px;background:linear-gradient(135deg,var(--primary)11,var(--accent)06)}
.cta-section h2{font-size:2.2rem;font-weight:900;margin-bottom:12px}
.cta-section p{color:rgba(255,255,255,0.6);font-size:1.1rem;margin-bottom:32px}

/* FOOTER */
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,0.06);padding:40px 20px;text-align:center}
footer .brand{font-size:1.2rem;font-weight:800;margin-bottom:8px}
footer .brand span{color:var(--primary)}
footer p{color:rgba(255,255,255,0.4);font-size:.85rem;margin-bottom:4px}
footer .credit{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)}
footer .credit a{color:var(--primary);text-decoration:none;font-weight:600}
footer .social{display:flex;gap:12px;justify-content:center;margin-top:16px}
footer .social a{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);text-decoration:none;font-size:1.2rem;transition:all .2s}
footer .social a:hover{background:var(--primary);color:#fff;border-color:var(--primary)}

@media(max-width:600px){
  .hero h1{font-size:2rem}
  .nav-links{display:none}
  .section-title{font-size:1.4rem}
  .btn-primary{padding:14px 30px;font-size:.95rem}
}
</style>
</head>
<body>

<!-- NAVBAR -->
<nav class="nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ") || ""}</span></a>
    <div class="nav-links">
      <a href="#inicio">Início</a>
      <a href="#sobre">Sobre</a>
      <a href="#destaques">${cfg.sectionTitle}</a>
      <a href="#contato">Contato</a>
      ${wa ? `<a href="https://wa.me/${wa}" class="nav-cta" target="_blank">📱 WhatsApp</a>` : ""}
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero" id="inicio">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-badge">${cfg.heroBadge}</div>
    <h1>${lead.name}</h1>
    <p class="sub">${cfg.heroSubtitle(city)}</p>
    ${lead.rating ? `<div class="rating"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total || 0} avaliações no Google</div>` : ""}
    <div class="hero-buttons">
      ${wa ? `<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>` : ""}
      <a href="${maps}" class="btn-outline" target="_blank">🗺️ Como Chegar</a>
    </div>
    <div style="margin-top:30px;max-width:500px;margin-left:auto;margin-right:auto">
      <div class="search-bar">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="${cfg.searchPlaceholder}" readonly>
      </div>
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<div class="categories">
  <div class="cat-pills">
    ${pillsHtml}
  </div>
</div>

<!-- DESTAQUES -->
<section class="section" id="destaques">
  <h2 class="section-title">${cfg.sectionTitle}</h2>
  <p class="section-sub">${cfg.sectionSub}</p>
  <div class="feature-grid">
    ${featuresHtml}
  </div>
</section>

<!-- SOBRE -->
<section class="section" id="sobre" style="background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04)">
  <h2 class="section-title">Sobre Nós</h2>
  <p class="section-sub">Conheça nossa história</p>
  <div style="max-width:700px;margin:0 auto;line-height:1.8;color:rgba(255,255,255,0.7);font-size:1.05rem;text-align:center">
    <p>${cfg.aboutText(lead.name, n, city, lead.rating, lead.user_ratings_total)}</p>
  </div>
  <div class="stats" style="margin-top:40px">
    ${lead.rating ? `<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação Google</div></div>` : ""}
    ${lead.user_ratings_total ? `<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes satisfeitos</div></div>` : ""}
    <div class="stat"><div class="num">100%</div><div class="label">Qualidade garantida</div></div>
    <div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div>
  </div>
</section>

<!-- MAPA -->
<section class="section" id="contato">
  <h2 class="section-title">Como Chegar</h2>
  <p class="section-sub">Venha nos visitar</p>
  <div class="map-container">
    <iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    <div class="map-info">
      <p>📍 ${lead.formatted_address || city || ""}</p>
      ${lead.phone ? `<p>📞 ${lead.phone}</p>` : ""}
    </div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:24px">
    <a href="${maps}" class="btn-outline" target="_blank">🗺️ Abrir no Maps</a>
    ${wa ? `<a href="tel:${wa}" class="btn-outline">📞 Ligar agora</a>` : ""}
    ${wa ? `<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">💬 WhatsApp</a>` : ""}
  </div>
</section>

<!-- CTA FINAL -->
<section class="cta-section">
  <h2>${cfg.ctaTitle}</h2>
  <p>${cfg.ctaSubtitle}</p>
  ${wa ? `<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>` : `<a href="${maps}" class="btn-primary" target="_blank">🗺️ Visitar</a>`}
</section>

<!-- FOOTER -->
<footer>
  <div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ") || ""}</span></div>
  <p>${lead.formatted_address || city || ""}</p>
  ${lead.phone ? `<p>${lead.phone}</p>` : ""}
  <div class="social">
    ${lead.instagram ? `<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>` : ""}
    ${lead.facebook ? `<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>` : ""}
    ${wa ? `<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>` : ""}
  </div>
  <div class="credit">
    <p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p>
    <p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p>
  </div>
</footer>

</body>
</html>`;
}
