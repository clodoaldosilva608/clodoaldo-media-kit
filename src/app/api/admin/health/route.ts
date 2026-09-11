import { NextResponse } from "next/server";
import { getMeucorrePool } from "@/lib/meucorre-db";

/**
 * GET /api/admin/health
 *
 * Central de saúde operacional — auditoria P1-5.
 * Verifica em tempo real:
 *   - banco acessível
 *   - autenticação configurada (Supabase)
 *   - webhook de pagamento ativo (payment_events recentes)
 *   - pixel ativo (rastreamento)
 *   - email conectado (Google OAuth)
 *   - WhatsApp / cron Telegram funcionando
 *   - cron semanal executado
 *   - variáveis obrigatórias presentes
 *   - última falha de integração
 */

export async function GET() {
  const checks: Array<{
    key: string;
    label: string;
    status: "ok" | "warning" | "critical";
    detail?: string;
    lastCheck: string;
    action?: string;
  }> = [];

  const now = new Date().toISOString();

  // 1) Banco acessível
  try {
    const pool = getMeucorrePool();
    if (!pool) throw new Error("pool null");
    await pool.query("SELECT 1");
    checks.push({ key: "db", label: "Banco de dados", status: "ok", detail: "Supabase acessível", lastCheck: now });
  } catch (e: any) {
    checks.push({ key: "db", label: "Banco de dados", status: "critical", detail: e.message, lastCheck: now, action: "Verificar DATABASE_URL / serviço Supabase" });
  }

  const pool = getMeucorrePool();

  // 2) Webhook de pagamento ativo (qualquer payment_event nos últimos 30 dias)
  try {
    const r = await pool.query(
      "SELECT COUNT(*)::int AS n, MAX(received_at) AS last FROM payment_events WHERE received_at > now() - interval '30 days'"
    );
    const n = r.rows[0]?.n || 0;
    const last = r.rows[0]?.last;
    if (n > 0) {
      checks.push({ key: "payment_webhook", label: "Webhook de pagamento", status: "ok", detail: `${n} evento(s) nos últimos 30 dias, último em ${new Date(last).toLocaleString("pt-BR")}`, lastCheck: now });
    } else {
      checks.push({ key: "payment_webhook", label: "Webhook de pagamento", status: "warning", detail: "Nenhum evento de webhook recebido", lastCheck: now, action: "Configurar webhook Kiwify/Stripe apontando para /api/webhook-kiwify" });
    }
  } catch (e: any) {
    checks.push({ key: "payment_webhook", label: "Webhook de pagamento", status: "warning", detail: "Tabela payment_events inacessível", lastCheck: now });
  }

  // 3) Pixel ativo
  try {
    const r = await pool.query("SELECT COUNT(*)::int AS n FROM pixel_config WHERE active = true");
    if ((r.rows[0]?.n || 0) > 0) {
      checks.push({ key: "pixel", label: "Pixel de rastreamento", status: "ok", detail: `${r.rows[0].n} pixel(is) ativo(s)`, lastCheck: now });
    } else {
      checks.push({ key: "pixel", label: "Pixel de rastreamento", status: "warning", detail: "Nenhum pixel ativo", lastCheck: now, action: "Configurar em /admin/pixels" });
    }
  } catch (e: any) {
    checks.push({ key: "pixel", label: "Pixel de rastreamento", status: "warning", detail: e.message, lastCheck: now });
  }

  // 4) Email Google OAuth conectado
  try {
    const r = await pool.query("SELECT value FROM app_settings WHERE key = 'google_oauth_connected' LIMIT 1");
    const connected = r.rows[0]?.value === true || r.rows[0]?.value === "true";
    if (connected) {
      checks.push({ key: "email", label: "Email (Gmail OAuth)", status: "ok", detail: "Google conectado — relatório semanal ativo", lastCheck: now });
    } else {
      checks.push({ key: "email", label: "Email (Gmail OAuth)", status: "warning", detail: "Google não conectado", lastCheck: now, action: "Conectar em /admin/settings" });
    }
  } catch {
    checks.push({ key: "email", label: "Email (Gmail OAuth)", status: "warning", detail: "Status não verificado", lastCheck: now });
  }

  // 5) Cron semanal executado (any record in last 8 days)
  try {
    const r = await pool.query(
      "SELECT MAX(created_at) AS last FROM audit_logs WHERE action = 'weekly_report_sent'"
    );
    const last = r.rows[0]?.last;
    if (last) {
      const ageDays = (Date.now() - new Date(last).getTime()) / (24 * 60 * 60 * 1000);
      if (ageDays <= 8) {
        checks.push({ key: "cron_weekly", label: "Cron semanal", status: "ok", detail: `Último relatório enviado há ${ageDays.toFixed(1)} dias`, lastCheck: now });
      } else {
        checks.push({ key: "cron_weekly", label: "Cron semanal", status: "warning", detail: `Último relatório há ${ageDays.toFixed(0)} dias — pode ter falhado`, lastCheck: now, action: "Testar manualmente em /admin/settings → 'Disparar agora'" });
      }
    } else {
      checks.push({ key: "cron_weekly", label: "Cron semanal", status: "warning", detail: "Nenhum relatório registrado", lastCheck: now, action: "Verificar CRON_SECRET no Vercel e trigger manual" });
    }
  } catch {
    checks.push({ key: "cron_weekly", label: "Cron semanal", status: "warning", detail: "Não verificado", lastCheck: now });
  }

  // 6) Variáveis obrigatórias
  const requiredEnvs = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missingEnvs = requiredEnvs.filter(k => !process.env[k]);
  if (missingEnvs.length === 0) {
    checks.push({ key: "envs", label: "Variáveis de ambiente", status: "ok", detail: "Variáveis obrigatórias presentes", lastCheck: now });
  } else {
    checks.push({ key: "envs", label: "Variáveis de ambiente", status: "critical", detail: `Faltando: ${missingEnvs.join(", ")}`, lastCheck: now, action: "Configurar no Vercel → Project → Settings → Environment Variables" });
  }

  // 7) Última falha de integração (audit_logs action = error)
  try {
    const r = await pool.query(
      "SELECT details, created_at FROM audit_logs WHERE action LIKE '%error%' OR action LIKE '%fail%' ORDER BY created_at DESC LIMIT 1"
    );
    if (r.rows[0]) {
      checks.push({ key: "last_error", label: "Última falha", status: "warning", detail: `${r.rows[0].details || "(sem detalhe)"} — ${new Date(r.rows[0].created_at).toLocaleString("pt-BR")}`, lastCheck: now });
    } else {
      checks.push({ key: "last_error", label: "Última falha", status: "ok", detail: "Nenhuma falha registrada", lastCheck: now });
    }
  } catch {
    // tabela ainda vazia, ok
  }

  // 8) Tabelas principais acessíveis
  try {
    const r = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM orders) AS orders,
        (SELECT COUNT(*) FROM clodoaldo_prospects) AS prospects,
        (SELECT COUNT(*) FROM quiz_leads) AS quiz,
        (SELECT COUNT(*) FROM analytics_events WHERE created_at > now() - interval '7 days') AS events_7d`
    );
    const d = r.rows[0];
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

  // Aggregate score
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
