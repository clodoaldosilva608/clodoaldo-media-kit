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

  // Get env vars
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  // Step 1: Verify the user's JWT token using the anon key
  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userResp.ok) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const userData = await userResp.json();
  const userId = userData.id;
  if (!userId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Step 2: Use service_role key for database operations (bypasses RLS)
  if (!serviceKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }
  
  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const serviceSlug = parsed.data.service;

  try {
    // 1. Check if service has capacity active
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

    // 2. Idempotency: check if user already has an active queue entry
    const { data: existing } = await sb
      .from("service_queue")
      .select("id, status, created_at")
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
      // 3. Create new queue entry
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

    // 4. Calculate position
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
