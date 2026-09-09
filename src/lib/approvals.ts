/**
 * Portal de Aprovação — tipos e utilitários
 */

export type ProjectStatus =
  | "draft"
  | "sent"
  | "in_review"
  | "changes_requested"
  | "in_progress"
  | "awaiting_payment"
  | "approved"
  | "archived"
  | "expired";

export type ProjectType =
  | "website"
  | "landing_page"
  | "art_social"
  | "menu_digital"
  | "ecosystem"
  | "other";

export type RevisionStatus =
  | "sent"
  | "in_review"
  | "approved"
  | "rejected"
  | "superseded";

export type ChangeRequestCategory =
  | "fine_tune"
  | "new_revision"
  | "bug"
  | "design_change"
  | "content_change"
  | "new_feature"
  | "out_of_scope"
  | "other";

export type ChangeRequestStatus =
  | "pending"
  | "admin_reviewing"
  | "awaiting_payment"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "cancelled";

export type PaymentStatus = "none" | "pending" | "confirmed" | "refunded";

export type Theme = "dark" | "light" | "system" | "inherit";

export interface ApprovalSettings {
  id: string;
  pix_key: string | null;
  pix_key_type: "cpf" | "cnpj" | "email" | "phone" | "random" | null;
  pix_recipient_name: string | null;
  whatsapp_for_receipts: string | null;
  default_max_revisions: number;
  web3forms_access_key: string | null;
  notification_email: string | null;
  default_theme: "dark" | "light" | "system";
  limit_reached_message: string;
  out_of_scope_message: string;
  brand_name: string;
  brand_logo_url: string | null;
  updated_at: string;
}

export interface ApprovalProject {
  id: string;
  client_token: string;
  client_name: string;
  client_email: string | null;
  client_whatsapp: string | null;
  project_title: string;
  project_type: ProjectType;
  preview_url: string | null;
  preview_html: string | null;
  notes_for_client: string | null;
  project_scope: string | null;
  out_of_scope_examples: string | null;
  status: ProjectStatus;
  max_revisions: number;
  current_revision: number;
  theme: Theme;
  expires_at: string | null;
  access_password: string | null;
  prospect_id: string | null;
  sent_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRevision {
  id: string;
  project_id: string;
  revision_number: number;
  preview_url: string | null;
  preview_html: string | null;
  notes: string | null;
  images: string[] | null;
  status: RevisionStatus;
  sent_at: string;
  approved_at: string | null;
  created_at: string;
}

export interface ApprovalChangeRequest {
  id: string;
  project_id: string;
  revision_id: string | null;
  client_message: string;
  category: ChangeRequestCategory;
  is_fine_tune: boolean;
  counts_as_revision: boolean;
  has_extra_cost: boolean;
  extra_cost_amount: number | null;
  extra_cost_reason: string | null;
  extra_cost_kiwify_url: string | null;
  additional_service_id: string | null;
  status: ChangeRequestStatus;
  admin_response: string | null;
  payment_status: PaymentStatus;
  payment_confirmed_at: string | null;
  image_index: number | null;
  image_x: number | null;
  image_y: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category:
    | "revision_extra"
    | "page"
    | "menu"
    | "art_pack"
    | "audit"
    | "integration"
    | "custom"
    | "other";
  price_cents: number;
  price_label: string | null;
  kiwify_checkout_url: string | null;
  visible_to_client: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApprovalImageComment {
  id: string;
  project_id: string;
  revision_id: string;
  image_index: number;
  x_percent: number;
  y_percent: number;
  author_name: string | null;
  author_role: "client" | "admin";
  comment: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface ApprovalAccessLog {
  id: string;
  project_id: string;
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  accessed_at: string;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
}

// ============================================================
// UTILITÁRIOS
// ============================================================

/** Gera token aleatório seguro de 32 chars */
export function generateToken(length = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

/** Formata status para exibição em português */
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  in_review: "Em revisão",
  changes_requested: "Alterações solicitadas",
  in_progress: "Em andamento",
  awaiting_payment: "Aguardando pagamento",
  approved: "Aprovado",
  archived: "Arquivado",
  expired: "Expirado",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/20",
  sent: "bg-blue-500/15 text-blue-300 ring-blue-500/20",
  in_review: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
  changes_requested: "bg-orange-500/15 text-orange-300 ring-orange-500/20",
  in_progress: "bg-violet-500/15 text-violet-300 ring-violet-500/20",
  awaiting_payment: "bg-rose-500/15 text-rose-300 ring-rose-500/20",
  approved: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
  archived: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/20",
  expired: "bg-rose-500/15 text-rose-400 ring-rose-500/20",
};

export const CATEGORY_LABELS: Record<ChangeRequestCategory, string> = {
  fine_tune: "Ajuste fino",
  new_revision: "Nova revisão",
  bug: "Erro/Bug",
  design_change: "Mudança de design",
  content_change: "Mudança de conteúdo",
  new_feature: "Nova funcionalidade",
  out_of_scope: "Fora do escopo",
  other: "Outro",
};

export const CR_STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  pending: "Pendente",
  admin_reviewing: "Em análise",
  awaiting_payment: "Aguardando pagamento",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
};

export const CR_STATUS_COLORS: Record<ChangeRequestStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
  admin_reviewing: "bg-blue-500/15 text-blue-300 ring-blue-500/20",
  awaiting_payment: "bg-rose-500/15 text-rose-300 ring-rose-500/20",
  in_progress: "bg-violet-500/15 text-violet-300 ring-violet-500/20",
  resolved: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
  rejected: "bg-rose-500/15 text-rose-300 ring-rose-500/20",
  cancelled: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/20",
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: "Website",
  landing_page: "Landing Page",
  art_social: "Arte para redes sociais",
  menu_digital: "Cardápio digital",
  ecosystem: "Ecossistema de produtos",
  other: "Outro",
};

/** Verifica se um projeto está expirado */
export function isExpired(project: ApprovalProject): boolean {
  if (!project.expires_at) return false;
  return new Date(project.expires_at) < new Date();
}

/** Verifica se um projeto pode ser editado (não aprovado/arquivado) */
export function isEditable(project: ApprovalProject): boolean {
  return (
    project.status !== "approved" &&
    project.status !== "archived" &&
    project.status !== "expired"
  );
}

/** Verifica se o cliente pode pedir alteração (revisões restantes > 0) */
export function canRequestChanges(project: ApprovalProject): boolean {
  if (!isEditable(project)) return false;
  return project.current_revision < project.max_revisions;
}

/** Calcula revisões restantes */
export function remainingRevisions(project: ApprovalProject): number {
  return Math.max(0, project.max_revisions - project.current_revision);
}

/** Formata moeda em centavos */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** Cria URL pública do portal */
export function buildPublicUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://clodoaldo.vercel.app";
  return `${base}/aprovar/${token}`;
}

/** Cria link de WhatsApp com mensagem pré-preenchida */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
