import { createClient } from "@supabase/supabase-js";
import { SERVICES, type ServiceSlug, type Service } from "./services-catalog";
import { FUNDING_TIERS, type FundingTierId, type AppItem } from "./apps-catalog";

/**
 * Cria uma sessão de checkout na Kiwify.
 *
 * Fluxo:
 * 1. Cria um registro na tabela `orders` (ou `supporters`) com status "pending"
 * 2. Chama a API da Kiwify para criar um link de checkout
 * 3. Retorna { orderId, url } — se KIWIFY_API_TOKEN não configurado, retorna
 *    URL de sucesso com `?pending=kiwify` (modo degradação para desenvolvimento)
 */

interface OriginResolver {
  (): string;
}

function getOrigin(): string {
  // Server-side: use NEXT_PUBLIC_SITE_URL or env var
  if (typeof window === "undefined") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
  }
  return window.location.origin;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface CheckoutInput {
  service: ServiceSlug;
  addons: ServiceSlug[];
  answers: Record<string, string>;
  customer_email: string;
  customer_name: string;
  queue_id?: string;
}

export interface CheckoutResult {
  orderId: string;
  url: string;
}

export async function createKiwifyCheckout(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const service = SERVICES[input.service];
  if (!service) throw new Error("Item inválido");

  const origin = getOrigin();
  const sb = getSupabase();

  // Serviços com produção limitada só seguem para o pagamento com uma reserva
  // válida de fila para o mesmo serviço.
  const { data: capacity } = await sb
    .from("service_capacity")
    .select("service_slug, active")
    .eq("service_slug", service.slug)
    .maybeSingle();

  let queueId: string | null = null;
  if (capacity?.active) {
    if (!input.queue_id) {
      throw new Error("Reserve sua posição na fila antes de finalizar o pedido");
    }
    const { data: queueRow } = await sb
      .from("service_queue")
      .select("id, service_slug, status")
      .eq("id", input.queue_id)
      .maybeSingle();
    if (!queueRow || queueRow.service_slug !== service.slug || queueRow.status === "cancelled") {
      throw new Error("Reserva de fila inválida. Volte e reserve sua posição novamente.");
    }
    queueId = queueRow.id;
  }

  const addonServices = input.addons
    .map((slug) => SERVICES[slug])
    .filter(Boolean)
    .filter((item) => item.priceCents > 0);

  const totalCents =
    service.priceCents + addonServices.reduce((sum, a) => sum + a.priceCents, 0);

  const bonusEbooks = (service.bonusEbooks ?? []).map((bonus) => ({
    title: bonus.title,
    description: bonus.description,
  }));

  // 1. Cria o pedido no Supabase
  const { data: order, error: orderErr } = await sb
    .from("orders")
    .insert({
      service_slug: service.slug,
      service_name: service.name,
      addons: addonServices.map((a) => ({
        slug: a.slug,
        name: a.shortName,
        priceCents: a.priceCents,
        kind: a.kind,
      })),
      answers: input.answers,
      total_cents: totalCents,
      customer_email: input.customer_email,
      customer_name: input.customer_name,
      status: "pending",
      bonus_ebooks: bonusEbooks as unknown as never,
      queue_id: queueId,
    })
    .select()
    .single();

  if (orderErr || !order) {
    throw new Error("Não foi possível criar o pedido");
  }

  // 2. Tenta criar sessão Kiwify (se configurada)
  const kiwifyToken = process.env.KIWIFY_API_TOKEN || process.env.KIWIFY_TOKEN;
  if (!kiwifyToken) {
    // Modo degradação: sem Kiwify configurada, vai direto para sucesso
    return {
      orderId: order.id,
      url: `${origin}/checkout/sucesso?order=${order.id}&pending=kiwify`,
    };
  }

  // 3. Cria o link de checkout Kiwify
  try {
    const kiwifyUrl = await createKiwifyCheckoutLink({
      token: kiwifyToken,
      product_id: getKiwifyProductId(service),
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      amount_cents: totalCents,
      order_id: order.id,
      success_url: `${origin}/checkout/sucesso?order=${order.id}`,
      cancel_url: `${origin}/checkout/cancelado?order=${order.id}`,
      metadata: {
        order_id: order.id,
        queue_id: queueId ?? "",
        item_slug: service.slug,
        item_kind: service.kind,
      },
    });

    // Atualiza o pedido com o ID da transação Kiwify
    await sb
      .from("orders")
      .update({ stripe_session_id: kiwifyUrl.session_id })
      .eq("id", order.id);

    return { orderId: order.id, url: kiwifyUrl.checkout_url };
  } catch (e) {
    console.error("[kiwify] checkout creation failed:", e);
    // Fallback: redireciona para sucesso com pending=kiwify
    return {
      orderId: order.id,
      url: `${origin}/checkout/sucesso?order=${order.id}&pending=kiwify`,
    };
  }
}

export interface FundingInput {
  app_slug: string;
  tier_id: FundingTierId;
  amount_cents?: number;
  supporter_name: string;
  supporter_email: string;
  supporter_message?: string;
  public_display: boolean;
}

export async function createKiwifyFunding(
  input: FundingInput,
): Promise<CheckoutResult> {
  const tier = FUNDING_TIERS.find((t) => t.id === input.tier_id);
  if (!tier) throw new Error("Nível de apoio inválido");

  const origin = getOrigin();
  const sb = getSupabase();

  const amountCents =
    input.amount_cents && input.amount_cents > 0
      ? Math.max(tier.minCents, Math.min(tier.maxCents ?? Infinity, input.amount_cents))
      : tier.defaultCents;

  // 1. Cria o supporter no Supabase
  const { data: supporter, error } = await sb
    .from("supporters")
    .insert({
      app_slug: input.app_slug,
      tier_id: input.tier_id,
      amount_cents: amountCents,
      supporter_name: input.supporter_name,
      supporter_email: input.supporter_email,
      supporter_message: input.supporter_message ?? null,
      public_display: input.public_display,
      status: "pending",
    })
    .select()
    .single();

  if (error || !supporter) {
    throw new Error("Não foi possível registrar o apoio");
  }

  // 2. Tenta criar sessão Kiwify
  const kiwifyToken = process.env.KIWIFY_API_TOKEN || process.env.KIWIFY_TOKEN;
  if (!kiwifyToken) {
    return {
      orderId: supporter.id,
      url: `${origin}/apoiar/${input.app_slug}?pending=kiwify`,
    };
  }

  try {
    const kiwifyUrl = await createKiwifyCheckoutLink({
      token: kiwifyToken,
      product_id: process.env.KIWIFY_FUNDING_PRODUCT_ID || "funding",
      customer_name: input.supporter_name,
      customer_email: input.supporter_email,
      amount_cents: amountCents,
      order_id: supporter.id,
      success_url: `${origin}/apoiar/${input.app_slug}?thanks=1`,
      cancel_url: `${origin}/apoiar/${input.app_slug}?cancel=1`,
      metadata: {
        supporter_id: supporter.id,
        app_slug: input.app_slug,
        tier_id: input.tier_id,
        kind: "funding",
      },
    });

    await sb
      .from("supporters")
      .update({ stripe_session_id: kiwifyUrl.session_id })
      .eq("id", supporter.id);

    return { orderId: supporter.id, url: kiwifyUrl.checkout_url };
  } catch (e) {
    console.error("[kiwify] funding checkout failed:", e);
    return {
      orderId: supporter.id,
      url: `${origin}/apoiar/${input.app_slug}?pending=kiwify`,
    };
  }
}

/**
 * Chama a API da Kiwify para criar um link de checkout.
 * Docs: https://docs.kiwify.com.br/api/criar-link-de-pagamento
 */
async function createKiwifyCheckoutLink(params: {
  token: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  amount_cents: number;
  order_id: string;
  success_url: string;
  cancel_url: string;
  metadata: Record<string, string>;
}): Promise<{ checkout_url: string; session_id: string }> {
  // Kiwify API endpoint para criar link de pagamento
  // Documentação: https://docs.kiwify.com.br/api-reference
  const endpoint = "https://api.kiwify.com.br/v1/checkout/create";

  const body = {
    product_id: params.product_id,
    customer: {
      name: params.customer_name,
      email: params.customer_email,
    },
    amount: (params.amount_cents / 100).toFixed(2),
    currency: "BRL",
    reference: params.order_id,
    return_url: params.success_url,
    cancel_url: params.cancel_url,
    metadata: params.metadata,
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Kiwify API ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return {
    checkout_url: data.checkout_url || data.url || data.payment_url,
    session_id: data.id || data.session_id || data.reference || params.order_id,
  };
}

/**
 * Mapeia slug de serviço → product_id da Kiwify.
 * Configurável via env vars KIWIFY_PRODUCT_<SLUG_UPPER>.
 * Fallback: usa KIWIFY_DEFAULT_PRODUCT_ID.
 */
function getKiwifyProductId(service: Service): string {
  const envKey = `KIWIFY_PRODUCT_${service.slug.toUpperCase().replace(/-/g, "_")}`;
  return process.env[envKey] || process.env.KIWIFY_DEFAULT_PRODUCT_ID || service.slug;
}

/**
 * Valida assinatura do webhook da Kiwify.
 *
 * Kiwify envia o webhook com um header `x-kiwify-signature` (HMAC-SHA256 do body
 * usando o webhook secret como chave), ou um campo `signature` no body.
 *
 * Esta função suporta ambos os formatos.
 */
export function verifyKiwifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!secret) return false;
  if (!signature) return false;

  // Kiwify usa HMAC-SHA256 hex
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Compara em tempo constante
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}
