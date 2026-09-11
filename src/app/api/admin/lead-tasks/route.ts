import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET  /api/admin/lead-tasks?lead_id=...
 * POST /api/admin/lead-tasks   { lead_id, title, description, due_at, assigned_to }
 * PATCH /api/admin/lead-tasks  { id, done }
 * DELETE /api/admin/lead-tasks?id=...
 */
export async function GET(req: NextRequest) {
  try {
    const leadId = req.nextUrl.searchParams.get("lead_id");
    if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { data, error } = await sb
      .from("lead_tasks")
      .select("*")
      .eq("lead_id", leadId)
      .order("done", { ascending: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      if (error.message.includes("relation") || error.code === "PGRST205") {
        return NextResponse.json({ tasks: [] });
      }
      throw error;
    }
    return NextResponse.json({ tasks: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, title, description, due_at, assigned_to } = body;
    if (!lead_id || !title) return NextResponse.json({ error: "lead_id and title required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("lead_tasks").insert({
      lead_id, title, description: description || null,
      due_at: due_at || null, assigned_to: assigned_to || null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ task: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, done } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { data, error } = await sb.from("lead_tasks").update({
      done, done_at: done ? new Date().toISOString() : null,
    }).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ task: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const sb: any = getSupabaseServer();
    const { error } = await sb.from("lead_tasks").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
