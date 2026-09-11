/**
 * RBAC — Permissões por função (auditoria P1-4).
 *
 * Roles aceitos:
 *   admin      → tudo
 *   comercial  → leads, crm, briefings, pedidos (sem segredos)
 *   marketing  → pixels, whatsapp, afiliados, depoimentos, email
 *   financeiro → pedidos, pagamentos, relatórios financeiros
 *   conteudo   → biblioteca, apps, cases, depoimentos
 *   leitura    → dashboard e analytics (sem ações mutáveis)
 *
 * Uso:
 *   import { can, type Role } from "@/lib/rbac";
 *   if (!can(role, "leads", "read")) return unauthorized;
 */

export type Role = "admin" | "comercial" | "marketing" | "financeiro" | "conteudo" | "leitura";

export type Module =
  | "dashboard" | "analytics" | "leads" | "crm" | "pedidos" | "briefings"
  | "ofertas" | "fila" | "pixels" | "whatsapp" | "afiliados" | "email"
  | "depoimentos" | "biblioteca" | "apps" | "coupons" | "countdown"
  | "notifications" | "settings" | "financeiro" | "auditoria" | "health"
  | "aprovacoes" | "recuperacao" | "parceiros" | "subscriptions";

export type Action = "read" | "create" | "update" | "delete" | "export" | "send" | "config";

type PermMatrix = Record<Role, Partial<Record<Module, Action[]>>>;

const ALL_ACTIONS: Action[] = ["read", "create", "update", "delete", "export", "send", "config"];

const MATRIX: PermMatrix = {
  admin: {
    dashboard: ALL_ACTIONS, analytics: ALL_ACTIONS, leads: ALL_ACTIONS, crm: ALL_ACTIONS,
    pedidos: ALL_ACTIONS, briefings: ALL_ACTIONS, ofertas: ALL_ACTIONS, fila: ALL_ACTIONS,
    pixels: ALL_ACTIONS, whatsapp: ALL_ACTIONS, afiliados: ALL_ACTIONS, email: ALL_ACTIONS,
    depoimentos: ALL_ACTIONS, biblioteca: ALL_ACTIONS, apps: ALL_ACTIONS, coupons: ALL_ACTIONS,
    countdown: ALL_ACTIONS, notifications: ALL_ACTIONS, settings: ALL_ACTIONS,
    financeiro: ALL_ACTIONS, auditoria: ALL_ACTIONS, health: ALL_ACTIONS,
    aprovacoes: ALL_ACTIONS, recuperacao: ALL_ACTIONS, parceiros: ALL_ACTIONS,
    subscriptions: ALL_ACTIONS,
  },
  comercial: {
    dashboard: ["read"], analytics: ["read"], leads: ALL_ACTIONS, crm: ALL_ACTIONS,
    briefings: ALL_ACTIONS, pedidos: ["read", "create", "update", "export"],
    recuperacao: ["read"], whatsapp: ["read", "send"], notifications: ["read"],
    fila: ["read"],
  },
  marketing: {
    dashboard: ["read"], analytics: ALL_ACTIONS, pixels: ALL_ACTIONS,
    whatsapp: ALL_ACTIONS, afiliados: ALL_ACTIONS, email: ALL_ACTIONS,
    depoimentos: ALL_ACTIONS, coupons: ALL_ACTIONS, countdown: ALL_ACTIONS,
    ofertas: ALL_ACTIONS, notifications: ["read"], fila: ["read"],
  },
  financeiro: {
    dashboard: ["read"], analytics: ["read"], pedidos: ALL_ACTIONS,
    financeiro: ALL_ACTIONS, recuperacao: ["read"], coupons: ["read"],
    notifications: ["read"],
  },
  conteudo: {
    dashboard: ["read"], analytics: ["read"], biblioteca: ALL_ACTIONS,
    apps: ALL_ACTIONS, depoimentos: ALL_ACTIONS, notifications: ["read"],
  },
  leitura: {
    dashboard: ["read"], analytics: ["read"], leads: ["read"], crm: ["read"],
    pedidos: ["read"], briefings: ["read"], notifications: ["read"],
  },
};

export function can(role: Role | undefined | null, module: Module, action: Action = "read"): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  const mods = MATRIX[role];
  if (!mods) return false;
  const actions = mods[module];
  if (!actions) return false;
  return actions.includes(action);
}

export function listAllowedModules(role: Role): Module[] {
  return Object.keys(MATRIX[role] || {}) as Module[];
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador (todos os módulos)",
  comercial: "Comercial (leads, CRM, briefings, pedidos)",
  marketing: "Marketing (pixels, WhatsApp, email, afiliados)",
  financeiro: "Financeiro (pedidos, pagamentos, reconciliação)",
  conteudo: "Conteúdo (biblioteca, apps, cases)",
  leitura: "Leitura (dashboards e relatórios)",
};
