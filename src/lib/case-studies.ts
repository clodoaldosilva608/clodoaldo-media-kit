/**
 * Cases estruturados — modelo fixo da auditoria seção 5.1.
 * NÃO inventar cases. Só adicionar case real com autorização.
 *
 * Os 3 cases abaixo são da OPERAÇÃO PRÓPRIA do Clodoaldo (autoria e
 * autorização do proprietário, 16/09/2026): todos os números são
 * verificáveis em produção — painel /admin, catálogo /apps e /produtos.
 * Nenhuma métrica de cliente externo foi inventada ou estimada.
 */

export type CaseCategory = "posicionamento" | "conteudo" | "conversao" | "produto-digital" | "desenvolvimento";

export interface CaseStudy {
  id: string;
  title: string;
  category: CaseCategory;
  anonymized: boolean;
  clientCategory: string;
  context: string;
  problem: string;
  strategy: string;
  execution: string;
  period: string;
  baseMetric: string;
  result: string;
  evidence?: string;
  authorized: boolean;
  publishedAt: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "meucorre-prospeccao-ia",
    title: "MeuCorre — máquina de prospecção com IA no funil",
    category: "desenvolvimento",
    anonymized: false,
    clientCategory: "Operação própria (prospecção B2B de comércios locais)",
    context:
      "Prospecção de comércios locais (cafeterias, restaurantes, barbearias) para venda de presença digital, feita sem sistema: cada envio e resposta vivia no WhatsApp pessoal.",
    problem:
      "Sem rastreio de envios nem histórico de respostas, o follow-up morria no esquecimento e era impossível saber qual nicho, cidade ou horário de envio convertia mais.",
    strategy:
      "Construir sistema próprio de ponta a ponta: catálogo de prospects, envio trackado por variante de roteiro, CRM com BANT e camada de IA por cima dos dados (insights semanais, predição de fechamento e assistente de funil).",
    execution:
      "Plataforma em produção (Next.js + Postgres): CRM kanban com eventos por lead, automações de follow-up e recuperação, relatório semanal no Telegram, insights comparativos por nicho/cidade/horário/variante e predição de fechamento por coorte de leads semelhantes.",
    period: "Ago–Set/2026 — em operação contínua",
    baseMetric: "Dados ao vivo do próprio painel (semana de 08 a 15/set/2026)",
    result:
      "485 leads catalogados e prospectados, 29% de reply rate na semana (7 envios → 2 respostas) e 33% de resposta no nicho campeão (restaurante).",
    evidence: "Painel /admin/insights em produção — métricas atualizando ao vivo",
    authorized: true,
    publishedAt: "2026-09-16",
  },
  {
    id: "linha-produtos-kiwify",
    title: "Linha própria de produtos digitais com venda automatizada",
    category: "produto-digital",
    anonymized: false,
    clientCategory: "Produtos próprios (info-produtos para criadores de conteúdo)",
    context:
      "Criador com 9 produtos digitais lançados desde 2016, precisando de uma esteira de venda e entrega que não dependesse de trabalho manual a cada pedido.",
    problem:
      "Vender e entregar produto digital manualmente consome horas, quebra a experiência de compra e não escala com volume de campanhas.",
    strategy:
      "Linha de produtos com checkout integrado (Kiwify), webhooks de pedido em tempo real caindo no painel próprio, entrega automática e rastreio de afiliados de ponta a ponta.",
    execution:
      "5 produtos publicados com checkout e webhook integrados ao painel — 30 Ganchos de Reels, Manual de Edição Premium, Pack Prompts Premium, Storytelling Magnético e IA para Criadores — com pedido, entrega e notificação em um fluxo só.",
    period: "Desde 2016 · esteira atual em operação desde 2026",
    baseMetric: "Catálogo oficial público (/produtos)",
    result:
      "5 produtos à venda com checkout, entrega e notificação Telegram 100% automatizados — cada pedido cai no painel sem intervenção manual.",
    evidence: "/produtos — catálogo oficial com checkout ativo",
    authorized: true,
    publishedAt: "2026-09-16",
  },
  {
    id: "ecossistema-51-apps",
    title: "Ecossistema de apps — 51 produtos, 22 no ar",
    category: "desenvolvimento",
    anonymized: false,
    clientCategory: "Produtos próprios (apps e micro-SaaS)",
    context:
      "Portfólio de aplicativos construídos ao longo de 10 anos de desenvolvimento, indo de autoconhecimento com IA a saúde farmacêutica, sem uma vitrine unificada.",
    problem:
      "Apps dispersos, sem status público de maturidade e sem caminho claro de apoio ou financiamento para o que ainda está em construção.",
    strategy:
      "Catálogo público unificado com status honesto por app (lançado, beta, em desenvolvimento, conceito), vitrine de capas premium, programa de criadores parceiros e página de apoio por app.",
    execution:
      "Portal /apps com filtros por categoria e status, busca, carrossel de destaques, portal de aprovação para projetos de clientes e programa de apoio com 4 níveis (R$ 25 a R$ 301+).",
    period: "Desde 2016 · vitrine atual 2026",
    baseMetric: "Catálogo público /apps (contagem verificável)",
    result:
      "51 apps catalogados em 8 categorias — 22 lançados, 22 em beta público e 7 entre em desenvolvimento e conceito — cada um com trilha de apoio própria.",
    evidence: "/apps — catálogo público com status por app",
    authorized: true,
    publishedAt: "2026-09-16",
  },
];

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  posicionamento: "Posicionamento",
  conteudo: "Conteúdo",
  conversao: "Conversão",
  "produto-digital": "Produto digital",
  desenvolvimento: "Desenvolvimento",
};

export const CASE_CATEGORY_COLORS: Record<CaseCategory, string> = {
  posicionamento: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  conteudo: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  conversao: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "produto-digital": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  desenvolvimento: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
};
