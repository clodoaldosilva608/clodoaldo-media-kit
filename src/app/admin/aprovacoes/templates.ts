/**
 * Templates de projeto para o Portal de Aprovação.
 * Acelera a criação pré-preenchendo campos comuns.
 */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  /** Campos que serão pré-preenchidos ao escolher o template */
  fields: {
    project_title?: string;
    project_type?: "website" | "landing_page" | "art_social" | "menu_digital" | "ecosystem" | "other";
    notes_for_client?: string;
    project_scope?: string;
    out_of_scope_examples?: string;
    max_revisions?: number;
  };
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "blank",
    name: "Em branco",
    description: "Comece do zero, sem pré-preenchimento",
    icon: "📄",
    fields: {},
  },
  {
    id: "website_institucional",
    name: "Site institucional",
    description: "Site corporativo completo com várias páginas",
    icon: "🌐",
    fields: {
      project_type: "website",
      project_title: "Site institucional",
      notes_for_client: `Olá! Seu site institucional está pronto para revisão. Navegue por todas as páginas (Home, Sobre, Serviços, Contato) e verifique se todas as informações estão corretas.

Itens para conferir:
✅ Textos e revisão ortográfica
✅ Imagens e cores
✅ Botões de WhatsApp/contato
✅ Versão mobile (acesse pelo celular)
✅ Versão desktop

Quando estiver 100% satisfeito, clique em "Aprovar projeto". Para ajustes, use "Pedir alteração".`,
      project_scope: `Site institucional profissional:
✅ Home / Capa
✅ Página Sobre / Quem somos
✅ Página de Serviços
✅ Página de Contato com formulário + WhatsApp
✅ Design responsivo (mobile + desktop)
✅ SEO básico (meta tags, sitemap)
✅ Integração com Google Meu Negócio
✅ Botão flutuante de WhatsApp
✅ 3 rodadas de revisão inclusas`,
      out_of_scope_examples: `Itens fora do escopo (podem ter custo adicional):
➕ Página adicional (R$ 197 cada)
➕ Sistema de agendamento online
➕ Sistema de login de usuários
➕ Integração com pagamento
➕ Blog com sistema de posts
➕ Loja virtual / e-commerce
➕ Alteração completa de design após aprovação`,
      max_revisions: 3,
    },
  },
  {
    id: "landing_page",
    name: "Landing page de campanha",
    description: "Página única focada em conversão (campanha, lançamento)",
    icon: "🚀",
    fields: {
      project_type: "landing_page",
      project_title: "Landing page de campanha",
      notes_for_client: `Olá! Sua landing page está pronta para revisão. Verifique:

✅ Headline (título principal)
✅ Subtítulo e proposta de valor
✅ Botões de CTA (chamada para ação)
✅ Formulário de captura
✅ Prova social (depoimentos, números)
✅ Versão mobile (a maioria dos acessos virá do celular)

Landings pages são otimizadas para conversão. Cada elemento foi pensado para levar o visitante à ação. Me diga se algo precisa ser ajustado!`,
      project_scope: `Landing page de alta conversão:
✅ 1 página única com seções estratégicas
✅ Hero impactante (título + CTA)
✅ Seção de benefícios
✅ Prova social (depoimentos/numbers)
✅ Formulário de captura integrado
✅ Botão de WhatsApp flutuante
✅ Pixel de rastreamento (Meta/Google)
✅ Design 100% responsivo
✅ Otimizada para velocidade (Core Web Vitals)
✅ 3 rodadas de revisão inclusas`,
      out_of_scope_examples: `Fora do escopo:
➕ Página adicional (R$ 197 cada)
➕ Integração com CRM
➕ A/B testing de variantes
➕ Configuração avançada de tráfego pago
➕ Vídeo de VSL (vendas)`,
      max_revisions: 3,
    },
  },
  {
    id: "menu_digital",
    name: "Cardápio digital com QR Code",
    description: "Cardápio acessível por QR Code, sem app",
    icon: "🍽️",
    fields: {
      project_type: "menu_digital",
      project_title: "Cardápio digital com QR Code",
      notes_for_client: `Olá! Seu cardápio digital está pronto! 🎉

Para testar:
✅ Acesse o link em qualquer celular
✅ Navegue pelas categorias (entradas, principais, sobremesas, bebidas)
✅ Verifique se os preços estão corretos
✅ Confira as fotos dos pratos (se houver)
✅ Teste o botão "Fazer pedido" (chama WhatsApp)

Vou gerar o QR Code personalizado para impressão após sua aprovação. Basta colar em mesas, balcão ou cardápio físico.`,
      project_scope: `Cardápio digital premium:
✅ Página única com categorias organizadas
✅ Fotos dos pratos (até 30 itens)
✅ Descrição + preço de cada item
✅ Botão "Fazer pedido" → WhatsApp
✅ Acesso via QR Code (imprimível)
✅ 100% responsivo (mobile-first)
✅ SEO local (aparece no Google)
✅ Atualização de preços/pratos inclusa por 30 dias
✅ 3 rodadas de revisão inclusas`,
      out_of_scope_examples: `Fora do escopo:
➕ Sistema de pagamento online
➕ Sistema de pedidos com carrinho
➕ Login de clientes / programa de fidelidade
➕ Integração com iFood/Rappi
➕ Foto profissional de pratos (R$ 30/foto)
➕ Cardápio físico impresso`,
      max_revisions: 3,
    },
  },
  {
    id: "art_social",
    name: "Artes para redes sociais",
    description: "Pack de artes para Instagram/facebook",
    icon: "🎨",
    fields: {
      project_type: "art_social",
      project_title: "Pack de artes para redes sociais",
      notes_for_client: `Olá! Suas artes estão prontas para revisão. 📱

Para revisar:
✅ Visualize cada arte na galeria
✅ Confira textos e ortografia
✅ Verifique se as cores combinam com a marca
✅ Teste como ficam no Instagram (formato quadrado 1080x1080)
✅ Confira os destaques de stories (formato 1080x1920)

Clique em qualquer imagem para marcar um ponto específico e deixar um comentário (estilo Markup.io).`,
      project_scope: `Pack de artes para redes sociais:
✅ 12 artes para feed (formato 1080x1080)
✅ 6 destaques para stories (formato 1080x1920)
✅ Identidade visual coerente com a marca
✅ Textos persuasivos em cada arte
✅ Formatos otimizados para Instagram e Facebook
✅ Arquivos PNG em alta resolução
✅ Direitos de uso comercial
✅ 3 rodadas de revisão inclusas`,
      out_of_scope_examples: `Fora do escopo:
➕ Arte avulpa adicional (R$ 25/unidade)
➕ Reels / vídeo animado (R$ 197/reel)
➕ Calendário editorial completo
➕ Gestão de postagem (R$ 297/mês)
➕ Logo / redesign de identidade visual`,
      max_revisions: 3,
    },
  },
  {
    id: "redesign",
    name: "Redesign de site existente",
    description: "Renovação de site que já existe",
    icon: "🔄",
    fields: {
      project_type: "website",
      project_title: "Redesign de site",
      notes_for_client: `Olá! O redesign do seu site está pronto. 🔍

Compare com o site antigo e verifique as melhorias:
✅ Velocidade de carregamento (bem mais rápido)
✅ Design moderno e responsivo
✅ SEO otimizado (vai aparecer melhor no Google)
✅ Botões de WhatsApp em todas as páginas
✅ Versão mobile muito melhor que a anterior

Mantenha o site antigo ativo até aprovar este novo. Depois da aprovação, fazemos a troca sem downtime.`,
      project_scope: `Redesign completo do site:
✅ Análise do site atual (pontos fracos)
✅ Nova identidade visual (cores, tipografia)
✅ Reescrita de textos persuasivos
✅ Otimização para mobile (Core Web Vitals)
✅ SEO técnico (sitemap, meta tags, schema)
✅ Migração de conteúdo do site antigo
✅ Redirecionamentos 301 (não perder SEO)
✅ Integração com WhatsApp
✅ 3 rodadas de revisão inclusas`,
      out_of_scope_examples: `Fora do escopo:
➕ Página adicional (R$ 197)
➕ Manutenção mensal recorrente (R$ 97/mês)
➕ Migração de domínio (R$ 147)
➕ Sistema de login/admin
➕ E-commerce`,
      max_revisions: 3,
    },
  },
  {
    id: "ecossistema",
    name: "Ecossistema de produtos",
    description: "Landing para app ou produto digital",
    icon: "🧩",
    fields: {
      project_type: "ecosystem",
      project_title: "Landing para ecossistema de produtos",
      notes_for_client: `Olá! A landing do seu ecossistema está pronta para revisão. 🧩

Verifique:
✅ Apresentação clara do produto principal
✅ Integração visual com produtos secundários
✅ Botões de CTA (download / cadastro / compra)
✅ Versão mobile
✅ Velocidade de carregamento

Esta página é a "vitrine" do seu ecossistema. Cada clique deve levar o usuário a um produto específico.`,
      project_scope: `Landing para ecossistema:
✅ Hero com proposta de valor clara
✅ Grid de produtos/serviços
✅ Cards individuais para cada produto
✅ CTAs estratégicos (download / compra / cadastro)
✅ Seção de prova social (números + depoimentos)
✅ FAQ com perguntas comuns
✅ Design responsivo
✅ SEO otimizado
✅ 3 rodadas de revisão inclusas`,
      out_of_scope_examples: `Fora do escopo:
➕ Página dedicada por produto (R$ 197 cada)
➕ Documentação técnica
➕ Blog
➕ Sistema de afiliados
➕ Dashboard do usuário`,
      max_revisions: 3,
    },
  },
];
