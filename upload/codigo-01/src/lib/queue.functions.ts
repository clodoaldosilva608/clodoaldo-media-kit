import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugSchema = z.object({
  service: z.string().regex(/^[a-z0-9-]{1,64}$/, "slug inválido"),
});

export type QueueStatus = {
  queueId: string;
  position: number;
  monthlySlots: number;
  taken: number;
  availableNow: boolean;
  status: string;
  cycleMonth: string;
};

/** Serviços que exigem fila de espera (fonte de verdade: tabela service_capacity). */
export const getQueueCapacity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("service_capacity")
      .select("service_slug, monthly_slots, active")
      .eq("service_slug", data.service)
      .maybeSingle();

    if (!row || !row.active) return { hasQueue: false as const };

    const cycle = new Date();
    const cycleMonth = new Date(Date.UTC(cycle.getUTCFullYear(), cycle.getUTCMonth(), 1))
      .toISOString()
      .slice(0, 10);

    const { count } = await supabaseAdmin
      .from("service_queue")
      .select("id", { count: "exact", head: true })
      .eq("service_slug", data.service)
      .eq("cycle_month", cycleMonth)
      .neq("status", "cancelled");

    const taken = count ?? 0;
    return {
      hasQueue: true as const,
      monthlySlots: row.monthly_slots,
      taken,
      slotsLeft: Math.max(row.monthly_slots - taken, 0),
    };
  });

/** Reserva (ou recupera) a posição do usuário logado na fila do mês corrente. */
export const joinServiceQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("service_queue_join", {
      _slug: data.service,
    });
    if (error) throw new Error("Não foi possível reservar sua posição na fila");
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new Error("Este serviço não possui fila de espera");

    return {
      queueId: row.queue_id as string,
      position: row.queue_position as number,
      monthlySlots: row.monthly_slots as number,
      taken: row.taken as number,
      availableNow: row.available_now as boolean,
      status: row.queue_status as string,
      cycleMonth: row.cycle as string,
    } satisfies QueueStatus;
  });
