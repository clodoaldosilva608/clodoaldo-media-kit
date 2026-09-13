import { NextResponse } from "next/server";

/**
 * GET /api/public/calendar
 * Público (sem auth). Retorna se Cal.com está configurado + URL do embed.
 */
export async function GET() {
  const calcomUrl = process.env.CALCOM_EVENT_URL || null;
  return NextResponse.json({
    calcom_configured: !!calcomUrl,
    calcom_url: calcomUrl,
  });
}
