/**
 * Tipagem unificada do catálogo de produtos (item 8 do handoff).
 *
 * Fonte única para /produtos/[slug], /servicos/[slug], APIs públicas
 * (/api/public/products), catálogo na landing e página admin/produtos.
 * Espelha o schema da tabela `products_catalog` no Supabase
 * (scripts/migration-products-catalog.sql + migration-products-image-path.sql).
 */

/** Categorias fixas do catálogo (checkbox "extras" cobre itens avulsos). */
export type ProductCategory =
  | "site"
  | "seo"
  | "gmb"
  | "cardapio"
  | "social"
  | "assinatura"
  | "extras";

/** Rótulos de categoria — usar sempre daqui (era duplicado em 3 arquivos). */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  site: "Site Profissional",
  seo: "SEO",
  gmb: "Google Meu Negócio",
  cardapio: "Cardápio Digital",
  social: "Redes Sociais",
  assinatura: "Assinatura",
  extras: "Extras",
};

/** Rótulo seguro mesmo com categoria desconhecida/legada no banco. */
export function categoryLabel(category: string | null | undefined): string {
  if (!category) return "Extras";
  return CATEGORY_LABELS[category as ProductCategory] ?? category;
}

/**
 * Linha da tabela `products_catalog`.
 * Colunas opcionais refletem defaults do schema e colunas adicionadas
 * por migrations posteriores (ex.: image_path).
 */
export interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  price_label: string | null;
  category: string | null;
  icon: string | null;
  is_recurring: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  whatsapp_sku: string | null;
  image_path: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Campos retornados pela API pública de listagem (sem is_active/sort_order). */
export type PublicProduct = Pick<
  ProductRecord,
  "id" | "name" | "description" | "price_cents" | "price_label" | "category" | "icon" | "is_recurring" | "image_path" | "whatsapp_sku"
>;

/** Preço em reais formatado em pt-BR (usa price_label quando existir). */
export function formatProductPrice(product: Pick<ProductRecord, "price_cents" | "price_label">): string {
  if (product.price_label) return product.price_label;
  const amount = (product.price_cents ?? 0) / 100;
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
