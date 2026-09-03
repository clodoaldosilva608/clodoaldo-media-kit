import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createKiwifyCheckout } from "@/lib/kiwify";

const slugRe = /^[a-z0-9-]{1,64}$/;

const checkoutSchema = z.object({
  service: z.string().regex(slugRe, "slug inválido"),
  addons: z.array(z.string().regex(slugRe)).max(20).default([]),
  answers: z.record(z.string().max(120), z.any()).default({}),
  customer_email: z.string().trim().email().max(254),
  customer_name: z.string().trim().min(1).max(120),
  queue_id: z.string().uuid().nullish(),
  coupon_code: z.string().max(30).nullish(),
  affiliate_slug: z.string().max(30).nullish(),
  total_cents: z.number().int().nonnegative().nullish(),
  session_id: z.string().max(120).nullish(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createKiwifyCheckout(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar checkout";
    console.error("[api/checkout] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
