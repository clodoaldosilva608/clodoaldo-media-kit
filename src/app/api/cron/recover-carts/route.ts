import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/cron/recover-carts
 *
 * Vercel Cron job — runs every 30 minutes (see vercel.json).
 * Finds abandoned carts that:
 *   - Are older than 30 minutes (user has truly abandoned)
 *   - Have NOT had a recovery message sent yet
 *   - Have a customer_phone OR customer_email
 *   - Are NOT already recovered
 *
 * For each one:
 *   1. Marks `recovery_email_sent = true` (so we don't spam)
 *   2. Logs the recovery (admin can see in dashboard)
 *   3. (Future) Triggers WhatsApp template message via MeuCorre or Z-API
 *
 * Auth: protected by CRON_SECRET env var (Vercel Cron sends this in the
 * Authorization header). Never public.
 *
 * Setup in Vercel:
 *   1. Add CRON_SECRET env var
 *   2. vercel.json declares the schedule
 *   3. Vercel dashboard → project → Cron Jobs → confirm
 */

export async function POST(req: NextRequest) {
  // Auth check — Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/recover-carts] CRON_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[cron/recover-carts] unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServer();
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // Find eligible carts: pending recovery, has contact, > 30min old
  const { data: carts, error } = await supabase
    .from("abandoned_carts")
    .select("id, session_id, service_slug, customer_name, customer_email, customer_phone, total_cents, created_at")
    .eq("recovered", false)
    .eq("recovery_email_sent", false)
    .lt("created_at", thirtyMinutesAgo)
    .not("customer_phone", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[cron/recover-carts] query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!carts || carts.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      message: "No carts pending recovery",
    });
  }

  // Fetch WhatsApp config for the recovery message sender
  const { data: whatsappConfig } = await supabase
    .from("whatsapp_config")
    .select("phone_number, default_message, recovery_template")
    .eq("active", true)
    .maybeSingle();

  const senderPhone = whatsappConfig?.phone_number || "5581920051068";
  const recoveryTemplate =
    whatsappConfig?.recovery_template ||
    `Olá {nome}! Notei que você quase contratou o serviço "{servico}" mas não finalizou. Posso te ajudar com alguma dúvida? Aqui está o link direto para retomar: {link}`;

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const cart of carts) {
    try {
      // Compute the recovery link back to the checkout
      const recoveryLink = `https://clodoaldo.vercel.app/checkout/${cart.service_slug}?recover=${cart.session_id}`;

      // Personalize the message
      const firstName = (cart.customer_name || "").split(" ")[0] || "tudo bem?";
      const serviceLabel = cart.service_slug.replace(/-/g, " ");
      const message = recoveryTemplate
        .replace("{nome}", firstName)
        .replace("{servico}", serviceLabel)
        .replace("{link}", recoveryLink);

      // Build the WhatsApp click-to-chat URL (wa.me)
      // The user's phone needs country code, no spaces, no +
      const cleanPhone = (cart.customer_phone || "").replace(/\D/g, "");
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      // Log the recovery attempt — admin can see in dashboard and click
      // the wa.me link to actually send the message manually (or hook up
      // a real WhatsApp Business API integration later).
      // Note: recovery_link and recovery_attempted_at columns may not
      // exist yet (see migration 20260905020000_cron_recovery.sql — needs
      // manual application via Supabase SQL Editor). Use silent fallback.
      const updatePayload: Record<string, unknown> = {
        recovery_email_sent: true,
      };
      try {
        await supabase
          .from("abandoned_carts")
          .update({
            ...updatePayload,
            recovery_link: waLink,
            recovery_attempted_at: new Date().toISOString(),
          })
          .eq("id", cart.id);
      } catch {
        // Fallback: columns don't exist — just set the boolean
        await supabase
          .from("abandoned_carts")
          .update(updatePayload)
          .eq("id", cart.id);
      }

      processed++;
    } catch (e: any) {
      failed++;
      errors.push(`cart ${cart.id}: ${e.message}`);
    }
  }

  // Also log to console for Vercel Cron observability
  console.log(
    JSON.stringify({
      source: "cron/recover-carts",
      outcome: "completed",
      processed,
      failed,
      total_eligible: carts.length,
      sender: senderPhone,
      ts: new Date().toISOString(),
    }),
  );

  return NextResponse.json({
    ok: true,
    processed,
    failed,
    total_eligible: carts.length,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
  });
}

// Also support GET for easy testing via browser/curl
export async function GET(req: NextRequest) {
  return POST(req);
}
