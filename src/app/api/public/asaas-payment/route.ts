import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { createCustomer, createPixPayment } from "@/lib/asaas";

/**
 * POST /api/public/asaas-payment
 *
 * Cria cobrança PIX no Asaas — endpoint PÚBLICO (sem admin auth).
 * Usado pelo modal PIX no catálogo de produtos.
 *
 * Body: { product_sku, customer_name, customer_email, customer_phone?, customer_cpf? }
 *
 * Rate limit: o middleware já aplica rate limit em todas as rotas.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_sku, customer_name, customer_email, customer_phone, customer_cpf } = body;

    if (!product_sku || !customer_email) {
      return NextResponse.json({ error: "product_sku and customer_email required" }, { status: 400 });
    }

    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ error: "Asaas não configurado" }, { status: 503 });
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

    // Cria customer no Asaas
    const customer = await createCustomer(customer_name, customer_email, customer_phone, customer_cpf);
    if (!customer) {
      return NextResponse.json({ error: "Erro ao criar cliente no Asaas" }, { status: 500 });
    }

    // Cria cobrança PIX
    const payment = await createPixPayment({
      customer_id: customer.id,
      value: product.price_cents / 100,
      description: `${product.name} — Clodoaldo Silva`,
      external_reference: `product_${product.id}`,
    });

    if (!payment) {
      return NextResponse.json({ error: "Erro ao criar cobrança PIX" }, { status: 500 });
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
      due_date: payment.dueDate,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
