import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { renderTemplate } from "@/lib/email-templates";

/**
 * POST /api/cron/email-triggers
 *
 * Vercel Cron — runs every 2 hours.
 * Schedule: "0 */2 * * *"
 *
 * Dispara emails automáticos baseados em triggers:
 * 1. welcome: lead criado nas últimas 2h sem email enviado
 * 2. abandoned_cart: checkout iniciado há +1h sem pagamento
 * 3. lead_no_response: lead contactado há +5 dias sem resposta
 *
 * Requer Gmail OAuth conectado.
 *
 * Auth: protected by CRON_SECRET
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (authHeader !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { getConnectedEmail } = await import("@/lib/google-oauth");
    const { sendEmail } = await import("@/lib/gmail");
    const dest = await getConnectedEmail();

    if (!dest) {
      return NextResponse.json({ ok: true, skipped: "gmail_not_connected" });
    }

    const sb: any = getSupabaseServer();
    const results = { welcome: 0, abandoned_cart: 0, lead_no_response: 0, errors: [] as string[] };

    // === 1. WELCOME: novos leads sem email enviado ===
    try {
      const { data: newLeads } = await sb.from("crm_leads")
        .select("id, name, email, created_at")
        .not("email", "is", null)
        .gte("created_at", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (newLeads && newLeads.length > 0) {
        const { data: templates } = await sb.from("email_templates")
          .select("*")
          .eq("trigger", "welcome")
          .eq("active", true)
          .maybeSingle();

        const template = templates || null;
        const subject = template?.subject || "Recebemos seu contato, {{nome}}! 🎉";
        const body = template?.body_html || null;

        for (const lead of newLeads) {
          // Verifica se já enviou welcome
          const { data: existing } = await sb.from("audit_logs")
            .select("id")
            .eq("entity", "email_sent")
            .eq("entity_id", lead.id)
            .ilike("details->>trigger", "welcome")
            .limit(1);

          if (existing && existing.length > 0) continue;

          const vars = { nome: lead.name, email: lead.email };
          const html = body ? renderTemplate(body, vars) : null;
          const finalSubject = renderTemplate(subject, vars);

          try {
            await sendEmail(lead.email, finalSubject, html || `<p>Olá ${lead.name}, obrigado pelo contato! Em breve entrarei em contato.</p>`);
            results.welcome++;

            // Registra envio
            await sb.from("audit_logs").insert({
              actor: "system",
              actor_role: "system",
              action: "email_sent",
              entity: "email_sent",
              entity_id: lead.id,
              details: { trigger: "welcome", to: lead.email, subject: finalSubject },
            });
          } catch (e: any) {
            results.errors.push(`welcome ${lead.email}: ${e.message}`);
          }
        }
      }
    } catch (e: any) {
      results.errors.push(`welcome: ${e.message}`);
    }

    // === 2. ABANDONED CART: checkout iniciado há +1h sem pagamento ===
    try {
      const { data: carts } = await sb.from("orders")
        .select("id, customer_name, customer_email, service_name, service_slug, total_cents, created_at")
        .eq("status", "pending")
        .not("customer_email", "is", null)
        .lt("created_at", new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString())
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (carts && carts.length > 0) {
        const { data: template } = await sb.from("email_templates")
          .select("*")
          .eq("trigger", "abandoned_cart")
          .eq("active", true)
          .maybeSingle();

        for (const cart of carts) {
          const vars = {
            nome: cart.customer_name,
            servico: cart.service_name,
            valor: (cart.total_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            checkout_url: `https://clodoaldo.vercel.app/checkout/${cart.service_slug}`,
          };
          const subject = template?.subject || "{{nome}}, seu carrinho ainda está salvo 🛒";
          const body = template?.body_html || null;
          const finalSubject = renderTemplate(subject, vars);
          const html = body ? renderTemplate(body, vars) : null;

          // Verifica se já enviou abandoned pra este order
          const { data: existing } = await sb.from("audit_logs")
            .select("id")
            .eq("entity", "email_sent")
            .eq("entity_id", cart.id)
            .ilike("details->>trigger", "abandoned_cart")
            .limit(1);

          if (existing && existing.length > 0) continue;

          try {
            await sendEmail(cart.customer_email, finalSubject, html || `<p>Olá ${cart.customer_name}, seu carrinho está salvo!</p>`);
            results.abandoned_cart++;
            await sb.from("audit_logs").insert({
              actor: "system", actor_role: "system", action: "email_sent",
              entity: "email_sent", entity_id: cart.id,
              details: { trigger: "abandoned_cart", to: cart.customer_email },
            });
          } catch (e: any) {
            results.errors.push(`abandoned ${cart.customer_email}: ${e.message}`);
          }
        }
      }
    } catch (e: any) {
      results.errors.push(`abandoned_cart: ${e.message}`);
    }

    // === 3. LEAD NO RESPONSE: contactado há +5 dias sem resposta ===
    try {
      const { getMeucorrePool } = await import("@/lib/meucorre-db");
      const pool = getMeucorrePool();
      const client = await pool.connect();
      try {
        const r = await client.query(
          `SELECT p.id, p.name, p.email, p.whatsapp, p.niche, p.city, p.last_contact_at
           FROM clodoaldo_prospects p
           WHERE p.email IS NOT NULL AND p.email != ''
             AND p.send_status = 'sent'
             AND p.replied = false
             AND p.last_contact_at < now() - interval '5 days'
             AND p.last_contact_at > now() - interval '15 days'
           ORDER BY p.last_contact_at ASC
           LIMIT 10`
        );

        if (r.rows.length > 0) {
          const { data: template } = await sb.from("email_templates")
            .select("*")
            .eq("trigger", "lead_no_response")
            .eq("active", true)
            .maybeSingle();

          for (const lead of r.rows) {
            const days = Math.floor((Date.now() - new Date(lead.last_contact_at).getTime()) / (1000 * 60 * 60 * 24));
            const vars = { nome: lead.name, dias_sem_resposta: String(days) };
            const subject = template?.subject || "Ainda posso te ajudar, {{nome}}? 💬";
            const body = template?.body_html || null;
            const finalSubject = renderTemplate(subject, vars);
            const html = body ? renderTemplate(body, vars) : null;

            try {
              await sendEmail(lead.email, finalSubject, html || `<p>Olá ${lead.name}, faz ${days} dias que não falamos. Ainda posso te ajudar?</p>`);
              results.lead_no_response++;
            } catch (e: any) {
              results.errors.push(`no_response ${lead.email}: ${e.message}`);
            }
          }
        }
      } finally {
        client.release();
      }
    } catch (e: any) {
      results.errors.push(`lead_no_response: ${e.message}`);
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
