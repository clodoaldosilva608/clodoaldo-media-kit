import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getOrderSummary = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, service_slug, service_name, addons, bonus_ebooks, status")
      .eq("id", data.orderId)
      .single();
    if (error || !order) return null;
    return order;
  });
