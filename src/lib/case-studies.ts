/**
 * Cases estruturados — modelo fixo da auditoria seção 5.1.
 * NÃO inventar cases. Só adicionar case real com autorização.
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
    id: "exemplo-posicionamento",
    title: "Exemplo de estrutura (aguardando case real autorizado)",
    category: "posicionamento",
    anonymized: true,
    clientCategory: "Exemplo — preencher com case real",
    context: "Cliente da categoria [tipo de negócio] com perfil ativo há 6+ meses, sem crescimento consistente.",
    problem: "Estagnação no crescimento do perfil, conteúdo sem ângulo claro, baixa retenção.",
    strategy: "Diagnóstico completo do perfil + plano de 30 dias com 5 ações concretas focadas em padrão narrativo.",
    execution: "Auditoria de perfil, recomendação de ângulos, ajuste de ritmo e estrutura de vídeos verticais.",
    period: "30 dias (antes vs depois da auditoria)",
    baseMetric: "~5K visualizações médias por vídeo",
    result: "Exemplo de resultado real a ser preenchido com case autorizado",
    evidence: undefined,
    authorized: false,
    publishedAt: "2026-09-05",
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
