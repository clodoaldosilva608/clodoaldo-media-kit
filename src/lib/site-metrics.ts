/**
 * Fonte única de verdade para todas as métricas exibidas no site.
 */

export interface Metric {
  value: number;
  label: string;
  definition: string;
  period: string;
  source: string;
  pending?: boolean;
  lastUpdated: string;
}

export const SITE_METRICS = {
  impactedPeople: {
    value: 1_200_000,
    label: "Pessoas impactadas com conteúdo",
    definition: "Soma de visualizações únicas em conteúdo público desde o início.",
    period: "Acumulado desde 2016",
    source: "Painéis nativos das plataformas",
    lastUpdated: "2026-09-05",
  } as Metric,
  communitySize: {
    value: 38_000,
    label: "Comunidade engajada",
    definition: "Soma de seguidores em perfis públicos ativos.",
    period: "Snapshot atual",
    source: "Contagem pública dos perfis",
    lastUpdated: "2026-09-05",
  } as Metric,
  clientsAttended: {
    value: 120,
    label: "Clientes atendidos",
    definition: "Pessoas e empresas que contrataram serviço desde 2016.",
    period: "Acumulado desde 2016",
    source: "Registro interno de pedidos",
    lastUpdated: "2026-09-05",
  },
  appsCount: {
    value: 52,
    label: "Projetos lançados",
    definition: "Apps e produtos digitais cadastrados no ecossistema.",
    period: "Snapshot atual",
    source: "Catálogo em src/lib/apps-catalog.ts",
    lastUpdated: "2026-09-05",
  },
  startYear: 2016,
  currentYear: new Date().getFullYear(),
  yearsOfExperience: new Date().getFullYear() - 2016,
} as const;

export interface AppCountBreakdown {
  total: number;
  available: number;
  beta: number;
  inDevelopment: number;
  concept: number;
}

export function getAppCountBreakdown(): AppCountBreakdown {
  const { APPS } = require("./apps-catalog") as typeof import("./apps-catalog");
  const total = APPS.length;
  const available = APPS.filter((a) => a.status === "lancado").length;
  const beta = APPS.filter((a) => a.status === "beta").length;
  const inDevelopment = APPS.filter((a) => a.status === "em-desenvolvimento").length;
  const concept = APPS.filter((a) => a.status === "conceito").length;
  return { total, available, beta, inDevelopment, concept };
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}K`;
  return value.toLocaleString("pt-BR");
}
