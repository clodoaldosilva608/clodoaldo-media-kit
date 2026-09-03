import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

/**
 * POST /api/quiz/result
 * Computes the quiz result and saves it.
 * Optionally captures a lead (name/email/phone).
 *
 * Body: {
 *   session_id,
 *   answers: { question_id: answer_value, ... },
 *   lead?: { name, email, phone?, consent_contact?, preferred_channel? }
 * }
 *
 * Returns: { profile_key, profile_label, primary_offer, secondary_offer, score_breakdown, lead_id? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      session_id: z.string().uuid(),
      answers: z.record(z.string(), z.string()),
      lead: z
        .object({
          name: z.string().min(1).max(120),
          email: z.string().email().max(254),
          phone: z.string().max(40).optional(),
          consent_contact: z.boolean().optional(),
          preferred_channel: z.string().max(20).optional(),
        })
        .optional(),
    });
    const parsed = schema.parse(body);

    const supabase = getSupabaseServer();

    // Fetch all quiz rules
    const { data: rules, error: rulesErr } = await supabase
      .from("quiz_rules")
      .select("question_id, answer_value, offer_slug, weight, priority, active")
      .eq("active", true);

    if (rulesErr || !rules) {
      return NextResponse.json({ error: "Could not load quiz rules" }, { status: 500 });
    }

    // Score offers based on the user's answers
    const scores: Record<string, { score: number; priorities: number[]; reasons: { question: string; answer: string; weight: number; priority: number }[] }> = {};

    for (const [questionId, answerValue] of Object.entries(parsed.answers)) {
      const matchingRules = rules.filter(
        (r: any) => r.question_id === questionId && r.answer_value === answerValue
      );
      for (const rule of matchingRules) {
        const slug = rule.offer_slug;
        if (!scores[slug]) {
          scores[slug] = { score: 0, priorities: [], reasons: [] };
        }
        scores[slug].score += Number(rule.weight);
        scores[slug].priorities.push(Number(rule.priority));
        scores[slug].reasons.push({
          question: questionId,
          answer: answerValue,
          weight: Number(rule.weight),
          priority: Number(rule.priority),
        });
      }
    }

    // Sort offers by score (desc), then by max priority (desc)
    const ranked = Object.entries(scores)
      .map(([slug, data]) => ({
        slug,
        score: data.score,
        maxPriority: Math.max(...data.priorities, 0),
        reasons: data.reasons,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.maxPriority - a.maxPriority;
      });

    if (ranked.length === 0) {
      return NextResponse.json({ error: "Não foi possível gerar uma recomendação. Tente novamente." }, { status: 400 });
    }

    const primaryOffer = ranked[0];
    const secondaryOffer = ranked[1] || null;

    // Determine profile key based on primary offer category
    const { data: offer } = await supabase
      .from("offers")
      .select("slug, name, category")
      .eq("slug", primaryOffer.slug)
      .maybeSingle();

    const profile_key = (offer?.category || "geral").toLowerCase();
    const profile_label = PROFILE_LABELS[profile_key] || "Plano personalizado";

    // Save quiz result
    const { data: result, error: resultErr } = await supabase
      .from("quiz_results")
      .upsert({
        session_id: parsed.session_id,
        profile_key,
        profile_label,
        primary_offer_slug: primaryOffer.slug,
        secondary_offer_slug: secondaryOffer?.slug || null,
        score_breakdown: { ranked: ranked.slice(0, 5) },
      }, { onConflict: "session_id" })
      .select("id")
      .single();

    if (resultErr) {
      console.error("[quiz/result] insert error:", resultErr);
    }

    // Save lead if provided
    let leadId: string | null = null;
    if (parsed.lead && parsed.lead.email) {
      const { data: lead, error: leadErr } = await supabase
        .from("quiz_leads")
        .upsert({
          session_id: parsed.session_id,
          name: parsed.lead.name,
          email: parsed.lead.email.toLowerCase().trim(),
          phone: parsed.lead.phone || null,
          consent_contact: parsed.lead.consent_contact ?? true,
          consent_at: parsed.lead.consent_contact ? new Date().toISOString() : null,
          preferred_channel: parsed.lead.preferred_channel || "email",
          source: "quiz",
          recommended_offer_slug: primaryOffer.slug,
        }, { onConflict: "lower(email),COALESCE(session_id,'00000000-0000-0000-0000-000000000000'::uuid)" })
        .select("id")
        .single();

      if (!leadErr && lead) {
        leadId = lead.id;
      } else if (leadErr) {
        console.error("[quiz/result] lead insert error:", leadErr);
      }
    }

    // Track analytics event
    await supabase.from("analytics_events").insert({
      event_name: "quiz_completed",
      session_id: parsed.session_id,
      offer_slug: primaryOffer.slug,
      path: "/quiz",
      props: { lead_captured: !!leadId, profile: profile_key },
    }).then(() => {}, () => {});

    // Fire pixel event if applicable
    // (handled client-side)

    return NextResponse.json({
      result_id: result?.id || null,
      lead_id: leadId,
      profile_key,
      profile_label,
      primary_offer: {
        slug: primaryOffer.slug,
        name: offer?.name || primaryOffer.slug,
        reasons: primaryOffer.reasons.slice(0, 3),
      },
      secondary_offer: secondaryOffer
        ? {
            slug: secondaryOffer.slug,
            name: secondaryOffer.slug, // will be filled client-side
          }
        : null,
      score_breakdown: { ranked: ranked.slice(0, 5) },
    });
  } catch (e: any) {
    console.error("[quiz/result] error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

const PROFILE_LABELS: Record<string, string> = {
  influencia: "Perfil: Influência & Autoridade",
  ghost: "Perfil: Creator Produzindo",
  produto: "Perfil: Aprender & Executar",
  web: "Perfil: Estrutura Digital",
  geral: "Plano personalizado",
};
