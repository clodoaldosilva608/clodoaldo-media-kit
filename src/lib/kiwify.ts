/**
 * Kiwify integration — OAuth flow + checkout + webhook verification.
 *
 * Flow:
 * 1. Get access_token via OAuth (client_id + client_secret → POST /v1/oauth/token)
 * 2. Use access_token with x-kiwify-account-id header for all API calls
 * 3. Products CANNOT be created via API — must be created in dashboard
 * 4. Webhook signature verified with KIWIFY_WEBHOOK_SECRET
 */

import { createClient } from "@supabase/supabase-js";
import { SERVICES, type ServiceSlug } from "./services-catalog";
import { FUNDING_TIERS, type FundingTierId } from "./apps-catalog";

// === OAuth Token Cache ===
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getKiwifyAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token;
  }

  const clientId = process.env.KIWIFY_CLIENT_ID;
  const clientSecret = process.env.KIWIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing KIWIFY_CLIENT_ID or KIWIFY_CLIENT_SECRET");
  }

  const resp = await fetch("https://public-api.kiwify.com.br/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Kiwify OAuth failed: ${errText}`);
  }

  const data = await resp.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 86400) * 1000,
  };

  return data.access_token;
}

function getStoreId(): string {
  const storeId = process.env.KIWIFY_STORE_ID;
  if (!storeId) throw new Error("Missing KIWIFY_STORE_ID");
  return storeId;
}

function getOrigin(): string {
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

/**
 * Maps service slug → Kiwify product_id.
 * Reads from env var KIWIFY_PRODUCT_<SLUG_UPPER> or falls back to the
 * product_id stored in Supabase knowledge_items.kiwify_product_id.
 */
async function getKiwifyProductId(slug: string): Promise<string | null> {
  // Try env var first
  const envKey = `KIWIFY_PRODUCT_${slug.toUpperCase().replace(/-/g, "_")}`;
  const envValue = process.env[envKey];
  if (envValue) return envValue;

  // Try Supabase
  try {
    const sb = getSupabase();
    const { data } = await sb
      .from("knowledge_items")
      .select("kiwify_product_id")
      .eq("slug", slug)
      .maybeSingle();
    if (data?.kiwify_product_id) return data.kiwify_product_id;
  } catch {
    // ignore
  }

  return null;
}

export interface CheckoutInput {
  service: ServiceSlug;
  addons: ServiceSlug[];
  answers: Record<string, string>;
  customer_email: string;
  customer_name: string;
  queue_id?: string;
  coupon_code?: string;
  affiliate_slug?: string;
  total_cents?: number;
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

  // Check queue if needed
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
      throw new Error("Reserva de fila inválida.");
    }
    queueId = queueRow.id;
  }

  const addonServices = input.addons
    .map((slug) => SERVICES[slug])
    .filter(Boolean)
    .filter((item) => item.priceCents > 0);

  let totalCents =
    service.priceCents + addonServices.reduce((sum, a) => sum + a.priceCents, 0);

  // Apply coupon if provided
  let couponData: { id: string; code: string; kind: string; value: number } | null = null;
  let discountCents = 0;
  if (input.coupon_code) {
    const { data: coupon } = await sb
      .from("coupons")
      .select("*")
      .eq("code", input.coupon_code.toUpperCase().trim())
      .eq("active", true)
      .maybeSingle();
    if (coupon) {
      couponData = coupon;
      if (coupon.kind === "percent") {
        discountCents = Math.round(totalCents * (Number(coupon.value) / 100));
      } else {
        discountCents = Math.round(Number(coupon.value) * 100);
      }
      discountCents = Math.min(discountCents, totalCents);
      totalCents = totalCents - discountCents;
    }
  }

  // Override with client-side total if provided (it already accounts for coupon)
  if (input.total_cents && input.total_cents > 0) {
    totalCents = input.total_cents;
  }

  const bonusEbooks = (service.bonusEbooks ?? []).map((bonus) => ({
    title: bonus.title,
    description: bonus.description,
  }));

  // 1. Create order in Supabase
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

  // Increment coupon usage
  if (couponData) {
    await sb
      .from("coupons")
      .update({ used_count: (couponData as any).used_count + 1 })
      .eq("id", (couponData as any).id)
      .then(() => {}, () => {});
  }

  // Register affiliate sale
  if (input.affiliate_slug) {
    const { data: aff } = await sb
      .from("affiliates")
      .select("id, commission_percent, sales, earnings_cents")
      .eq("slug", input.affiliate_slug)
      .eq("status", "active")
      .maybeSingle();
    if (aff) {
      const commissionCents = Math.round(totalCents * (Number(aff.commission_percent) / 100));
      await sb.from("affiliate_sales").insert({
        affiliate_id: aff.id,
        order_id: order.id,
        customer_email: input.customer_email,
        commission_cents: commissionCents,
        status: "pending",
      }).then(() => {}, () => {});
      await sb
        .from("affiliates")
        .update({
          sales: (aff.sales || 0) + 1,
          earnings_cents: (aff.earnings_cents || 0) + commissionCents,
        })
        .eq("id", aff.id)
        .then(() => {}, () => {});
    }
  }

  // Mark abandoned cart as recovered
  const sessionId = input.answers?.session_id || null;
  if (sessionId) {
    await sb
      .from("abandoned_carts")
      .update({ recovered: true, recovered_order_id: order.id, updated_at: new Date().toISOString() })
      .eq("session_id", sessionId)
      .then(() => {}, () => {});
  }

  // 2. Get Kiwify checkout URL from Supabase (pre-configured link)
  let checkoutUrl: string | null = null;
  try {
    const sb = getSupabase();
    const { data } = await sb
      .from("knowledge_items")
      .select("kiwify_product_id, kiwify_checkout_url")
      .eq("slug", service.slug)
      .maybeSingle();
    if (data?.kiwify_checkout_url) {
      checkoutUrl = data.kiwify_checkout_url;
    }
  } catch {
    // ignore
  }

  // Also check env var as fallback
  if (!checkoutUrl) {
    const envKey = `KIWIFY_CHECKOUT_${service.slug.toUpperCase().replace(/-/g, "_")}`;
    checkoutUrl = process.env[envKey] || null;
  }

  if (!checkoutUrl) {
    // No Kiwify checkout URL configured — redirect to success with pending flag
    return {
      orderId: order.id,
      url: `${origin}/checkout/sucesso?order=${order.id}&pending=kiwify`,
    };
  }

  // 3. Redirect to Kiwify checkout page
  // Kiwify handles payment, delivery, and webhook notification
  await sb
    .from("orders")
    .update({ stripe_session_id: `kiwify-${order.id}` })
    .eq("id", order.id);

  return { orderId: order.id, url: checkoutUrl };
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

  // 1. Create supporter
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

  // 2. Get funding product_id
  const productId = await getKiwifyProductId("funding");

  if (!productId) {
    return {
      orderId: supporter.id,
      url: `${origin}/apoiar/${input.app_slug}?pending=kiwify`,
    };
  }

  // 3. Create checkout
  try {
    const accessToken = await getKiwifyAccessToken();
    const storeId = getStoreId();

    const resp = await fetch("https://public-api.kiwify.com.br/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-kiwify-account-id": storeId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        customer: {
          name: input.supporter_name,
          email: input.supporter_email,
        },
        reference: supporter.id,
        return_url: `${origin}/apoiar/${input.app_slug}?thanks=1`,
        cancel_url: `${origin}/apoiar/${input.app_slug}?cancel=1`,
        metadata: {
          supporter_id: supporter.id,
          app_slug: input.app_slug,
          tier_id: input.tier_id,
          kind: "funding",
        },
      }),
    });

    if (!resp.ok) {
      throw new Error(`Kiwify API ${resp.status}`);
    }

    const data = await resp.json();
    const checkoutUrl = data.checkout_url || data.url || data.payment_url;
    const sessionId = data.id || data.session_id || supporter.id;

    await sb
      .from("supporters")
      .update({ stripe_session_id: sessionId })
      .eq("id", supporter.id);

    return { orderId: supporter.id, url: checkoutUrl };
  } catch (e) {
    console.error("[kiwify] funding checkout failed:", e);
    return {
      orderId: supporter.id,
      url: `${origin}/apoiar/${input.app_slug}?pending=kiwify`,
    };
  }
}

/**
 * Verifies webhook signature from Kiwify.
 * Kiwify sends a token/header that can be verified with the webhook secret.
 */
export function verifyKiwifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!secret) return false;
  if (!signature) return false;

  // Kiwify webhook verification: the signature is typically the
  // webhook secret or an HMAC of the body. Check both.
  if (signature === secret) return true;

  // HMAC-SHA256 verification
  try {
    const crypto = require("crypto");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

/**
 * Lists all products from Kiwify (for admin/sync purposes).
 */
export async function listKiwifyProducts() {
  const accessToken = await getKiwifyAccessToken();
  const storeId = getStoreId();

  const resp = await fetch(
    "https://public-api.kiwify.com.br/v1/products?page_number=1&page_size=100",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-kiwify-account-id": storeId,
      },
    },
  );

  if (!resp.ok) {
    throw new Error(`Kiwify API ${resp.status}`);
  }

  const data = await resp.json();
  return data.data || [];
}
