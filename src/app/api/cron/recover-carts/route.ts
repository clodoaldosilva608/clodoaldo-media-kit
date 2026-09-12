import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { notifyCartRecovery } from "@/lib/telegram";
import {
  assignVariant,
  renderTemplate,
  buildWaLink,
  getVariantById,
} from "@/lib/recovery-variants";

/**
 * POST /api/cron/recover-carts
 *
 * Vercel Cron job — runs daily at 10:00 BRT (13:00 UTC).
 * Finds abandoned carts that:
 *   - Are older than 30 minutes (user has truly abandoned)
 *   - Have NOT had a recovery message sent yet
 *   - Have a customer_phone OR customer_email
 *   - Are NOT already recovered
 *
 * For each one:
 *   1. Assigns A/B/C variant deterministically (by session_id hash)
 *   2. Renders the personalized message
 *   3. Builds wa.me click-to-chat link
 *   4. Sends Telegram push notification to Clodoaldo with inline buttons
 *   5. Marks recovery_email_sent = true, recovery_link, recovery_variant,
 *      recovery_attempted_at
 *
 * Auth: protected by CRON_SECRET env var.
 */

const ORIGIN = "https://clodoaldo-media-kit.vercel.app";

export async function POST(req: NextRequest) {
  // Auth check
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

  // Find eligible carts
  const { data: carts, error } = await supabase
    .from("abandoned_carts")
    .select(
      "id, session_id, service_slug, customer_name, customer_email, customer_phone, total_cents, created_at",
    )
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

  let processed = 0;
  let failed = 0;
  let telegramSent = 0;
  let telegramFailed = 0;
  const errors: string[] = [];
  const variantCounts: Record<string, number> = { A: 0, B: 0, C: 0 };

  for (const cart of carts) {
    try {
      // A/B/C variant assignment (deterministic by session_id)
      const variant = assignVariant(cart.session_id);
      variantCounts[variant.id]++;

      // Recovery link back to checkout
      const recoveryLink = `${ORIGIN}/checkout/${cart.service_slug}?recover=${cart.session_id}`;

      // Personalize the message
      const firstName = (cart.customer_name || "").split(" ")[0] || "tudo bem?";
      const serviceLabel = cart.service_slug.replace(/-/g, " ");
      const message = renderTemplate(variant, {
        name: firstName,
        serviceSlug: cart.service_slug,
        recoveryLink,
      });

      // Build wa.me link
      const waLink = buildWaLink(cart.customer_phone || "", message);

      // Compute cart age for Telegram notification
      const cartAgeMinutes = Math.round(
        (Date.now() - new Date(cart.created_at).getTime()) / 60000,
      );

      // Send Telegram push notification to Clodoaldo
      const tgOk = await notifyCartRecovery({
        customerName: cart.customer_name || "(sem nome)",
        customerPhone: cart.customer_phone || "",
        serviceSlug: serviceLabel,
        totalCents: cart.total_cents || 0,
        cartAgeMinutes,
        variant: variant.id,
        waLink,
        checkoutLink: recoveryLink,
      });
      if (tgOk) telegramSent++;
      else telegramFailed++;

      // Mark cart as recovery attempted — store variant + link + timestamp
      const updatePayload: Record<string, unknown> = {
        recovery_email_sent: true,
        recovery_variant: variant.id,
        recovery_link: waLink,
        recovery_attempted_at: new Date().toISOString(),
      };
      try {
        const { error: updErr } = await supabase
          .from("abandoned_carts")
          .update(updatePayload)
          .eq("id", cart.id);
        if (updErr) throw updErr;
      } catch (e: any) {
        // Fallback: try without optional columns
        await supabase
          .from("abandoned_carts")
          .update({ recovery_email_sent: true })
          .eq("id", cart.id);
      }

      processed++;
    } catch (e: any) {
      failed++;
      errors.push(`cart ${cart.id}: ${e.message}`);
    }
  }

  console.log(
    JSON.stringify({
      source: "cron/recover-carts",
      outcome: "completed",
      processed,
      failed,
      telegram_sent: telegramSent,
      telegram_failed: telegramFailed,
      variants: variantCounts,
      total_eligible: carts.length,
      ts: new Date().toISOString(),
    }),
  );

  return NextResponse.json({
    ok: true,
    processed,
    failed,
    telegram_sent: telegramSent,
    telegram_failed: telegramFailed,
    variants: variantCounts,
    total_eligible: carts.length,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
