import { NextResponse } from "next/server";

/**
 * GET /api/admin/calendar
 *
 * Retorna se Cal.com está configurado.
 * Se CALCOM_EVENT_URL estiver configurada, retorna a URL pra embed.
 */
export async function GET() {
  const calcomUrl = process.env.CALCOM_EVENT_URL || null;

  return NextResponse.json({
    calcom_configured: !!calcomUrl,
    calcom_url: calcomUrl,
    google_calendar_connected: false, // TODO: implementar Google Calendar API
    message: calcomUrl
      ? "Cal.com configurado — embed disponível em /agendar"
      : "Cal.com não configurado. Configure CALCOM_EVENT_URL no Vercel.",
  });
}
