import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APPS, FUNDING_TIERS, getFundingTier } from "./apps-catalog";
import { resolveOrigin } from "./origin.server";

const slugRe = /^[a-z0-9-]{1,64}$/;
const inputSchema = z.object({
  app_slug: z.string().regex(slugRe, "slug inválido"),
  tier_id: z.enum(["apoiador", "colaborador", "co-criador", "visionario"]),
  amount_cents: z.number().int().min(2500).max(1000000).optional(),
  supporter_name: z.string().trim().min(1).max(120),
  supporter_email: z.string().trim().email().max(254),
  supporter_message: z.string().trim().max(240).optional(),
  public_display: z.boolean().default(true),
});

export const createFundingSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const origin = resolveOrigin();
    const app = APPS.find((a) => a.slug === data.app_slug);
    if (!app) throw new Error("Aplicativo não encontrado");
    const tier = getFundingTier(data.tier_id);
    if (!tier) throw new Error("Nível de apoio inválido");

    // Enforce amount within tier range (fallback to default).
    const requested = data.amount_cents ?? tier.defaultCents;
    const clamped = Math.max(
      tier.minCents,
      tier.maxCents ? Math.min(requested, Math.max(tier.maxCents, tier.minCents)) : requested,
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("supporters")
      .insert({
        app_slug: app.slug,
        tier_id: tier.id,
        amount_cents: clamped,
        supporter_name: data.supporter_name,
        supporter_email: data.supporter_email,
        supporter_message: data.supporter_message ?? null,
        public_display: data.public_display,
        status: "pending",
      })
      .select()
      .single();

    if (error || !row) throw new Error("Não foi possível registrar o apoio");
    const supporterId = (row as { id: string }).id;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return {
        supporterId,
        url: `${origin}/apoiar/${app.slug}?pending=stripe`,
      };
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" as never });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Apoio ao app ${app.name} — ${tier.label}`,
              description: `Vaquinha de desenvolvimento do app ${app.name}. Recompensas: ${tier.perks.join(" · ")}`,
            },
            unit_amount: clamped,
          },
          quantity: 1,
        },
      ],
      customer_email: data.supporter_email,
      metadata: {
        supporter_id: supporterId,
        app_slug: app.slug,
        tier_id: tier.id,
        kind: "funding",
      },
      success_url: `${origin}/apoiar/${app.slug}?status=success&supporter=${supporterId}`,
      cancel_url: `${origin}/apoiar/${app.slug}?status=cancel`,
    });

    await supabaseAdmin
      .from("supporters")
      .update({ stripe_session_id: session.id })
      .eq("id", supporterId);

    return { supporterId, url: session.url ?? "" };
  });

export { FUNDING_TIERS };
