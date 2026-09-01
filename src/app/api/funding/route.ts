import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createKiwifyFunding } from "@/lib/kiwify";

const fundingSchema = z.object({
  app_slug: z.string().min(1).max(120),
  tier_id: z.enum(["apoiador", "colaborador", "co-criador", "visionario"]),
  amount_cents: z.number().int().positive().optional(),
  supporter_name: z.string().trim().min(1).max(120),
  supporter_email: z.string().trim().email().max(254),
  supporter_message: z.string().max(240).optional(),
  public_display: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = fundingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createKiwifyFunding(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar apoio";
    console.error("[api/funding] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
