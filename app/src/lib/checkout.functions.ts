import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SERVICES, type ServiceSlug } from "./services-catalog";
import { resolveOrigin } from "./origin.server";

const slugRe = /^[a-z0-9-]{1,64}$/;

const checkoutSchema = z.object({
  service: z.string().regex(slugRe, "slug inválido"),
  addons: z.array(z.string().regex(slugRe)).max(20).default([]),
  answers: z.record(z.string().max(120), z.string().max(2000)).default({}),
  customer_email: z.string().trim().email().max(254),
  customer_name: z.string().trim().min(1).max(120),
  queue_id: z.string().uuid().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const service = SERVICES[data.service as ServiceSlug];
    if (!service) throw new Error("Item inválido");
    const origin = resolveOrigin();

    const addonServices = data.addons
      .map((slug) => SERVICES[slug as ServiceSlug])
      .filter(Boolean)
      .filter((item) => item.priceCents > 0);

    const totalCents =
      service.priceCents +
      addonServices.reduce((sum, a) => sum + a.priceCents, 0);

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Serviços com produção limitada só seguem para o pagamento com uma reserva
    // válida de fila para o mesmo serviço.
    const { data: capacity } = await supabaseAdmin
      .from("service_capacity")
      .select("service_slug, active")
      .eq("service_slug", service.slug)
      .maybeSingle();

    let queueId: string | null = null;
    if (capacity?.active) {
      if (!data.queue_id) {
        throw new Error("Reserve sua posição na fila antes de finalizar o pedido");
      }
      const { data: queueRow } = await supabaseAdmin
        .from("service_queue")
        .select("id, service_slug, status")
        .eq("id", data.queue_id)
        .maybeSingle();
      if (!queueRow || queueRow.service_slug !== service.slug || queueRow.status === "cancelled") {
        throw new Error("Reserva de fila inválida. Volte e reserve sua posição novamente.");
      }
      queueId = queueRow.id;
    }

    const bonusEbooks = (service.bonusEbooks ?? []).map((bonus) => ({
      title: bonus.title,
      description: bonus.description,
    }));

    const { data: order, error: orderErr } = await supabaseAdmin
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
        answers: data.answers,
        total_cents: totalCents,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        status: "pending",
        bonus_ebooks: bonusEbooks as unknown as never,
        queue_id: queueId,
      })
      .select()
      .single();

    if (orderErr || !order) {
      throw new Error("Não foi possível criar o pedido");
    }

    if (!stripeKey) {
      return {
        orderId: order.id,
        url: `${origin}/checkout/sucesso?order=${order.id}&pending=stripe`,
      };
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia" as never,
    });

    const lineItems = [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: service.name,
            description: service.description,
          },
          unit_amount: service.priceCents,
        },
        quantity: 1,
      },
      ...addonServices.map((a) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: a.kind === "ebook" ? `E-book: ${a.shortName}` : `Add-on: ${a.shortName}`,
            description: a.description,
          },
          unit_amount: a.priceCents,
        },
        quantity: 1,
      })),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: data.customer_email,
      metadata: {
        order_id: order.id,
        queue_id: queueId ?? "",
        item_slug: service.slug,
        item_kind: service.kind,
      },
      success_url: `${origin}/checkout/sucesso?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelado?order=${order.id}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return { orderId: order.id, url: session.url ?? "" };
  });
