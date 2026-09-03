import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

/**
 * POST /api/quiz/session
 * Creates a new quiz session.
 * Body: { utm_source?, utm_medium?, utm_campaign?, device_type? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const schema = z.object({
      utm_source: z.string().max(120).optional(),
      utm_medium: z.string().max(120).optional(),
      utm_campaign: z.string().max(120).optional(),
      device_type: z.string().max(60).optional(),
    });
    const parsed = schema.parse(body);

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("quiz_sessions")
      .insert({
        ...parsed,
        device_type: parsed.device_type || detectDevice(req.headers.get("user-agent")),
      })
      .select("id, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessionId: data.id, createdAt: data.created_at });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

function detectDevice(ua: string | null): string {
  if (!ua) return "unknown";
  if (/Mobile|Android|iPhone/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}
