import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { createCustomer, createPixPayment } from "@/lib/asaas";

/**
 * POST /api/admin/payment-config
 *
 * Cria cobrança PIX automática no Asaas.
 * Retorna QR Code + Copia e Cola + payment link.
 *
 * Body: { product_sku, customer_name, customer_email, customer_phone? }
 *
 * Se ASAAS_API_KEY não configurado, retorna instruções de setup.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_sku, customer_name, customer_email, customer_phone, customer_cpf } = body;

    if (!product_sku || !customer_email) {
      return NextResponse.json({ error: "product_sku and customer_email required" }, { status: 400 });
    }

    // Se Asaas não configurado, retorna instruções
    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({
        error: "Asaas não configurado",
        setup_instructions: {
          step1: "Crie conta gratuita em https://www.asaas.com",
          step2: "Gere API Key em Perfil > Integrações > API Keys",
          step3: "Configure webhook URL: https://clodoaldo.vercel.app/api/webhook-asaas",
          step4: "Gere Webhook Token em Perfil > Integrações > Webhooks",
          step5: "Adicione ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN nas env vars do Vercel",
        },
      }, { status: 503 });
    }

    const sb: any = getSupabaseServer();

    // Busca produto
    const { data: product } = await sb.from("products_catalog")
      .select("*")
      .eq("whatsapp_sku", product_sku)
      .eq("is_active", true)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    // Cria customer no Asaas (CPF é obrigatório pra cobranças)
    const customer = await createCustomer(customer_name, customer_email, customer_phone, customer_cpf);
    if (!customer) {
      return NextResponse.json({ error: "Failed to create Asaas customer. Verifique se sua conta Asaas está aprovada para PIX." }, { status: 500 });
    }

    // Cria cobrança PIX
    const payment = await createPixPayment({
      customer_id: customer.id,
      value: product.price_cents / 100,
      description: `${product.name} — Clodoaldo Silva`,
      external_reference: `product_${product.id}`,
    });

    if (!payment) {
      return NextResponse.json({ error: "Failed to create Asaas payment. Verifique se o PIX está aprovado na sua conta Asaas." }, { status: 500 });
    }

    if (payment.error) {
      return NextResponse.json({ error: `Asaas: ${payment.error}` }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      payment_id: payment.id,
      status: payment.status,
      value: payment.value,
      pix_qr_code: payment.pixQrCode || null,
      pix_copy_paste: payment.pixCopyPaste || null,
      payment_link: payment.paymentLink || null,
      invoice_url: payment.invoiceUrl || null,
      due_date: payment.dueDate,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/payment-config
 * Retorna se Asaas está configurado.
 */
export async function GET() {
  return NextResponse.json({
    asaas_configured: !!process.env.ASAAS_API_KEY,
    webhook_url: "https://clodoaldo.vercel.app/api/webhook-asaas",
  });
}
