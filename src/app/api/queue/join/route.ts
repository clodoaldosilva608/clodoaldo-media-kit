import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const slugRe = /^[a-z0-9-]{1,64}$/;
const queueSchema = z.object({
  service: z.string().regex(slugRe, "slug inválido"),
});

interface QueueStatus {
  position: number;
  availableNow: boolean;
  taken: number;
  monthlySlots: number;
  queueId: string;
}

/**
 * Cria uma entrada na fila de espera para o serviço solicitado.
 *
 * Auth: recebe o token do usuário no header Authorization (Bearer).
 * Identifica o user_id via verificação do JWT no Supabase.
 *
 * Idempotência: se o usuário já tem entrada ativa para este serviço,
 * retorna a mesma posição em vez de criar nova.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = queueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Supabase server client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }
  const sb = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Verifica o usuário
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  const userId = userData.user.id;

  const serviceSlug = parsed.data.service;

  try {
    // 1. Verifica se o serviço tem capacity ativa
    const { data: capacity } = await sb
      .from("service_capacity")
      .select("service_slug, monthly_slots, active")
      .eq("service_slug", serviceSlug)
      .maybeSingle();

    if (!capacity) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }
    if (!capacity.active) {
      return NextResponse.json({ error: "Serviço sem fila de espera" }, { status: 400 });
    }

    // 2. Idempotência: verifica se já tem entrada ativa
    const { data: existing } = await sb
      .from("service_queue")
      .select("id, status, position, created_at")
      .eq("service_slug", serviceSlug)
      .eq("user_id", userId)
      .in("status", ["waiting", "paid"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let queueId: string;

    if (existing) {
      queueId = existing.id;
    } else {
      // 3. Cria nova entrada
      const { data: inserted, error: insErr } = await sb
        .from("service_queue")
        .insert({
          service_slug: serviceSlug,
          user_id: userId,
          status: "waiting",
        })
        .select("id")
        .single();

      if (insErr || !inserted) {
        console.error("[queue/join] insert error:", insErr);
        return NextResponse.json(
          { error: "Não foi possível reservar posição" },
          { status: 500 },
        );
      }
      queueId = inserted.id;
    }

    // 4. Calcula posição (quantas entradas "waiting" ou "paid" existem
    //    com created_at <= ao meu)
    const { data: queueList } = await sb
      .from("service_queue")
      .select("id, status, created_at")
      .eq("service_slug", serviceSlug)
      .in("status", ["waiting", "paid"])
      .order("created_at", { ascending: true });

    const myList = queueList ?? [];
    const position =
      myList.findIndex((q) => q.id === queueId) + 1 || myList.length;
    const taken = myList.filter((q) => q.status === "paid").length;
    const availableNow = taken < (capacity.monthly_slots ?? 0);

    const result: QueueStatus = {
      position,
      availableNow,
      taken,
      monthlySlots: capacity.monthly_slots ?? 0,
      queueId,
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error("[queue/join] exception:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
