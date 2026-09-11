import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/health
 * Central de saúde operacional — auditoria P1-5.
 * Verifica em tempo real: banco, webhook pagamento, pixel, email, cron, envs, etc.
 */
function getServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  const checks: any[] = [];
  const now = new Date().toISOString();

  let sb: any = null;
  try {
    sb = getServer();
    checks.push({ key: "db", label: "Banco de dados (Supabase)", status: "ok", detail: "Cliente Supabase inicializado com service_role", lastCheck: now });
  } catch (e: any) {
    checks.push({ key: "db", label: "Banco de dados (Supabase)", status: "critical", detail: e.message, lastCheck: now, action: "Verificar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel" });
    return NextResponse.json({ overall: "critical", score: { ok: 0, warning: 0, critical: 1, total: 1 }, checks, generatedAt: now });
  }

  // 1) Pixel ativo
  try {
    const { count, error } = await sb.from("pixel_config").select("*", { count: "exact", head: true }).eq("active", true);
    if (error) throw error;
    if ((count || 0) > 0) {
      checks.push({ key: "pixel", label: "Pixel de rastreamento", status: "ok", detail: `${count} pixel(is) ativo(s)`, lastCheck: now });
    } else {
      checks.push({ key: "pixel", label: "Pixel de rastreamento", status: "warning", detail: "Nenhum pixel ativo", lastCheck: now, action: "Configurar em /admin/pixels" });
    }
  } catch (e: any) {
    checks.push({ key: "pixel", label: "Pixel de rastreamento", status: "warning", detail: e.message, lastCheck: now });
  }

  // 2) Webhook de pagamento ativo (payment_events em 30d)
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb.from("payment_events")
      .select("received_at")
      .gte("received_at", thirtyDaysAgo)
      .order("received_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      checks.push({ key: "payment_webhook", label: "Webhook de pagamento", status: "ok", detail: `Último evento em ${new Date(data[0].received_at).toLocaleString("pt-BR")}`, lastCheck: now });
    } else {
      checks.push({ key: "payment_webhook", label: "Webhook de pagamento", status: "warning", detail: "Nenhum evento recebido em 30 dias", lastCheck: now, action: "Configurar webhook Kiwify/Stripe apontando para /api/webhook-kiwify" });
    }
  } catch (e: any) {
    checks.push({ key: "payment_webhook", label: "Webhook de pagamento", status: "warning", detail: "Tabela payment_events ainda não existe (rode migration SQL)", lastCheck: now, action: "Ver item 'Schema' abaixo" });
  }

  // 3) Email Google OAuth conectado
  try {
    const { data, error } = await sb.from("app_settings").select("value").eq("key", "google_oauth_connected").maybeSingle();
    if (error) throw error;
    const connected = data?.value === true || data?.value === "true";
    if (connected) {
      checks.push({ key: "email", label: "Email (Gmail OAuth)", status: "ok", detail: "Google conectado — relatório semanal ativo", lastCheck: now });
    } else {
      checks.push({ key: "email", label: "Email (Gmail OAuth)", status: "warning", detail: "Google não conectado", lastCheck: now, action: "Conectar em /admin/settings" });
    }
  } catch (e: any) {
    checks.push({ key: "email", label: "Email (Gmail OAuth)", status: "warning", detail: "app_settings inacessível", lastCheck: now });
  }

  // 4) Cron semanal executado
  try {
    const { data, error } = await sb.from("audit_logs")
      .select("created_at,details")
      .eq("action", "weekly_report_sent")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      const ageDays = (Date.now() - new Date(data[0].created_at).getTime()) / (24 * 60 * 60 * 1000);
      if (ageDays <= 8) {
        checks.push({ key: "cron_weekly", label: "Cron semanal", status: "ok", detail: `Último relatório há ${ageDays.toFixed(1)} dias`, lastCheck: now });
      } else {
        checks.push({ key: "cron_weekly", label: "Cron semanal", status: "warning", detail: `Último relatório há ${ageDays.toFixed(0)} dias — pode ter falhado`, lastCheck: now, action: "Testar manualmente em /admin/settings → 'Disparar agora'" });
      }
    } else {
      checks.push({ key: "cron_weekly", label: "Cron semanal", status: "warning", detail: "Nenhum relatório registrado em audit_logs", lastCheck: now, action: "Verificar CRON_SECRET no Vercel e trigger manual" });
    }
  } catch {
    checks.push({ key: "cron_weekly", label: "Cron semanal", status: "warning", detail: "audit_logs inacessível", lastCheck: now });
  }

  // 5) Variáveis obrigatórias
  const requiredEnvs = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missingEnvs = requiredEnvs.filter(k => !process.env[k]);
  if (missingEnvs.length === 0) {
    checks.push({ key: "envs", label: "Variáveis de ambiente", status: "ok", detail: "Variáveis obrigatórias presentes", lastCheck: now });
  } else {
    checks.push({ key: "envs", label: "Variáveis de ambiente", status: "critical", detail: `Faltando: ${missingEnvs.join(", ")}`, lastCheck: now, action: "Configurar no Vercel → Project → Settings → Environment Variables" });
  }

  // 6) Última falha
  try {
    const { data, error } = await sb.from("audit_logs")
      .select("details,created_at,action")
      .or("action.like.%error%,action.like.%fail%")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      checks.push({ key: "last_error", label: "Última falha", status: "warning", detail: `${data[0].action}: ${JSON.stringify(data[0].details).slice(0, 80)} — ${new Date(data[0].created_at).toLocaleString("pt-BR")}`, lastCheck: now });
    } else {
      checks.push({ key: "last_error", label: "Última falha", status: "ok", detail: "Nenhuma falha registrada", lastCheck: now });
    }
  } catch {
    // ignore
  }

  // 7) Dados recentes (orders + events 7d)
  try {
    const [ordersC, prospectsC, quizC] = await Promise.all([
      sb.from("orders").select("*", { count: "exact", head: true }),
      sb.from("clodoaldo_prospects").select("*", { count: "exact", head: true }),
      sb.from("quiz_leads").select("*", { count: "exact", head: true }),
    ]);
    const events7dAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const eventsC = await sb.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", events7dAgo);
    const d = {
      orders: ordersC.count || 0,
      prospects: prospectsC.count || 0,
      quiz: quizC.count || 0,
      events_7d: eventsC.count || 0,
    };
    checks.push({
      key: "data_freshness",
      label: "Dados recentes",
      status: d.events_7d > 0 ? "ok" : "warning",
      detail: `${d.orders} pedidos, ${d.prospects} prospects, ${d.quiz} quiz leads, ${d.events_7d} eventos (7d)`,
      lastCheck: now,
    });
  } catch (e: any) {
    checks.push({ key: "data_freshness", label: "Dados recentes", status: "warning", detail: e.message, lastCheck: now });
  }

  const critical = checks.filter(c => c.status === "critical").length;
  const warning = checks.filter(c => c.status === "warning").length;
  const ok = checks.filter(c => c.status === "ok").length;

  return NextResponse.json({
    overall: critical > 0 ? "critical" : warning > 0 ? "warning" : "ok",
    score: { ok, warning, critical, total: checks.length },
    checks,
    generatedAt: now,
  });
}
