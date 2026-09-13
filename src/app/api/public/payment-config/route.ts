import { NextResponse } from "next/server";

/**
 * GET /api/public/payment-config
 *
 * Retorna APENAS se Asaas está configurado (boolean).
 * Público (sem auth) — não expõe API keys ou tokens.
 * Usado pelo modal PIX no catálogo de produtos pra mostrar/ocultar
 * o botão "PIX Automático (Asaas)".
 */
export async function GET() {
  return NextResponse.json({
    asaas_configured: !!process.env.ASAAS_API_KEY,
  });
}
