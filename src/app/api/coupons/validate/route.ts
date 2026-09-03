import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/coupons/validate
 * Validates a coupon code and returns the discount.
 * Body: { code, total_cents, service_slug? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, total_cents, service_slug } = body;

    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const supabase = getSupabaseServer();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("active", true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: "Cupom inválido ou expirado" });
    }

    // Check validity window
    const now = new Date();
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, error: "Cupom expirado" });
    }
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, error: "Cupom ainda não está ativo" });
    }

    // Check usage limits
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "Cupom esgotado" });
    }

    // Check minimum order
    if (coupon.min_order_cents > 0 && (total_cents || 0) < coupon.min_order_cents) {
      return NextResponse.json({
        valid: false,
        error: `Pedido mínimo de R$ ${(coupon.min_order_cents / 100).toFixed(2).replace(".", ",")} para este cupom`,
      });
    }

    // Check applies_to
    if (coupon.applies_to === "service" && coupon.target_slug && coupon.target_slug !== service_slug) {
      return NextResponse.json({ valid: false, error: "Cupom não se aplica a este serviço" });
    }

    // Calculate discount
    let discountCents = 0;
    if (coupon.kind === "percent") {
      discountCents = Math.round((total_cents || 0) * (Number(coupon.value) / 100));
    } else {
      discountCents = Math.round(Number(coupon.value) * 100);
    }
    discountCents = Math.min(discountCents, total_cents || 0);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        kind: coupon.kind,
        value: Number(coupon.value),
      },
      discount_cents: discountCents,
      total_after_discount_cents: (total_cents || 0) - discountCents,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
