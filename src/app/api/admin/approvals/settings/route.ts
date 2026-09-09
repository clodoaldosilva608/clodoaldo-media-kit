import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("approval_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const allowed = [
      "pix_key",
      "pix_key_type",
      "pix_recipient_name",
      "whatsapp_for_receipts",
      "default_max_revisions",
      "web3forms_access_key",
      "notification_email",
      "default_theme",
      "limit_reached_message",
      "out_of_scope_message",
      "brand_name",
      "brand_logo_url",
    ];

    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("approval_settings")
      .update(update)
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
