import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/** Admin responde a um pedido de alteração: aceitar, marcar custo, rejeitar, confirmar pagamento */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServer();
    const { id } = await params;
    const body = await req.json();

    const allowed = [
      "category",
      "is_fine_tune",
      "counts_as_revision",
      "has_extra_cost",
      "extra_cost_amount",
      "extra_cost_reason",
      "extra_cost_kiwify_url",
      "additional_service_id",
      "status",
      "admin_response",
      "payment_status",
      "payment_confirmed_at",
      "resolved_at",
    ];

    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("approval_change_requests")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
