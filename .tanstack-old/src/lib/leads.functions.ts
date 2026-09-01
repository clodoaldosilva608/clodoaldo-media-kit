import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email(),
  ebook_slug: z.string().trim().min(1).max(120),
  source: z.string().trim().min(1).max(80).default("biblioteca"),
  consent: z.literal(true),
  instagram_follow_intent: z.boolean().default(true),
});

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name?.trim() || null,
      email: data.email.trim().toLowerCase(),
      ebook_slug: data.ebook_slug,
      source: data.source,
      consent: data.consent,
      instagram_follow_intent: data.instagram_follow_intent,
    });

    if (error) throw new Error("Não foi possível registrar seu acesso ao e-book.");

    return { ok: true };
  });
