import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

/**
 * POST /api/quiz/answer
 * Saves a single answer to a quiz session.
 * Body: { session_id, question_id, answer_value, answer_label? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      session_id: z.string().uuid(),
      question_id: z.string().min(1).max(60),
      answer_value: z.string().min(1).max(60),
      answer_label: z.string().max(120).optional(),
    });
    const parsed = schema.parse(body);

    const supabase = getSupabaseServer();

    // Upsert answer (UNIQUE constraint on session_id + question_id)
    const { error } = await supabase
      .from("quiz_answers")
      .upsert({
        session_id: parsed.session_id,
        question_id: parsed.question_id,
        answer_value: parsed.answer_value,
        answer_label: parsed.answer_label || parsed.answer_value,
      }, { onConflict: "session_id,question_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
