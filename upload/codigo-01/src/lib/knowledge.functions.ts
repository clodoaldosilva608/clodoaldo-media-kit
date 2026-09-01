import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { stripMarkdown } from "./knowledge-markdown";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// ------ List all published items ------
export const listKnowledgeItems = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("knowledge_items")
    .select("id, slug, title, description, cover_url, category, type, access_type, price_cents, currency, estimated_minutes, difficulty, order_index")
    .eq("status", "published")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ------ List items with per-item access flag & progress (authenticated) ------
export const listKnowledgeItemsForUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: items, error } = await supabase
      .from("knowledge_items")
      .select("id, slug, title, description, cover_url, category, type, access_type, price_cents, currency, estimated_minutes, difficulty, order_index")
      .eq("status", "published")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (items ?? []).map((i) => i.id);
    if (ids.length === 0) return [];

    const [entRes, bundleEntRes, progRes, chapCountRes] = await Promise.all([
      supabase
        .from("knowledge_entitlements")
        .select("knowledge_id, active, expires_at")
        .eq("user_id", userId)
        .eq("active", true)
        .not("knowledge_id", "is", null),
      supabase
        .from("knowledge_entitlements")
        .select("bundle_id, active, expires_at")
        .eq("user_id", userId)
        .eq("active", true)
        .not("bundle_id", "is", null),
      supabase
        .from("knowledge_progress")
        .select("knowledge_id, progress_pct, completed, last_read_at")
        .eq("user_id", userId)
        .in("knowledge_id", ids),
      supabase
        .from("knowledge_chapters")
        .select("knowledge_id")
        .in("knowledge_id", ids),
    ]);

    const nowMs = Date.now();
    const activeItems = new Set(
      (entRes.data ?? [])
        .filter((e) => !e.expires_at || new Date(e.expires_at).getTime() > nowMs)
        .map((e) => e.knowledge_id as string),
    );

    // Resolve bundle -> items
    const activeBundleIds = (bundleEntRes.data ?? [])
      .filter((e) => !e.expires_at || new Date(e.expires_at).getTime() > nowMs)
      .map((e) => e.bundle_id as string);
    if (activeBundleIds.length > 0) {
      const { data: bItems } = await supabase
        .from("knowledge_bundle_items")
        .select("knowledge_id")
        .in("bundle_id", activeBundleIds);
      for (const row of bItems ?? []) activeItems.add(row.knowledge_id);
    }

    // Aggregate progress + chapter counts
    const progressByItem = new Map<string, { pct: number; done: boolean; last: string | null }>();
    for (const p of progRes.data ?? []) {
      const cur = progressByItem.get(p.knowledge_id) ?? { pct: 0, done: false, last: null };
      progressByItem.set(p.knowledge_id, {
        pct: Math.max(cur.pct, Number(p.progress_pct)),
        done: cur.done || Boolean(p.completed),
        last: p.last_read_at,
      });
    }
    const chapterCount = new Map<string, number>();
    for (const c of chapCountRes.data ?? []) {
      chapterCount.set(c.knowledge_id, (chapterCount.get(c.knowledge_id) ?? 0) + 1);
    }

    return (items ?? []).map((it) => {
      const hasAccess = it.access_type === "free" || activeItems.has(it.id);
      const prog = progressByItem.get(it.id);
      return {
        ...it,
        hasAccess,
        chapter_count: chapterCount.get(it.id) ?? 0,
        progress_pct: prog?.pct ?? 0,
        completed: prog?.done ?? false,
      };
    });
  });

// ------ Get one item (public metadata + preview chapters) ------
const slugRe = /^[a-z0-9-]{1,64}$/;
const slugSchema = z.object({ slug: z.string().regex(slugRe, "slug inválido") });

export const getKnowledgeItemPublic = createServerFn({ method: "GET" })
  .inputValidator((d) => slugSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: item, error } = await sb
      .from("knowledge_items")
      .select("id, slug, title, description, cover_url, category, type, access_type, price_cents, currency, estimated_minutes, difficulty")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!item) return null;

    const { data: chapters } = await sb
      .from("knowledge_chapters")
      .select("id, slug, title, order_index, is_preview, content_md")
      .eq("knowledge_id", item.id)
      .order("order_index", { ascending: true });

    const isFree = item.access_type === "free" || item.price_cents === 0;
    const shaped = (chapters ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      order_index: c.order_index,
      is_preview: c.is_preview,
      preview_excerpt: c.is_preview || isFree ? null : stripMarkdown(c.content_md, 240),
      content_md: c.is_preview || isFree ? c.content_md : null,
    }));

    return { item, chapters: shaped, hasAccess: isFree };
  });

// ------ Get one item for a user (with entitlement + progress) ------
export const getKnowledgeItemForUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => slugSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: item, error } = await supabase
      .from("knowledge_items")
      .select("id, slug, title, description, cover_url, category, type, access_type, price_cents, currency, estimated_minutes, difficulty")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!item) return null;

    // Check access
    let hasAccess = item.access_type === "free" || item.price_cents === 0;
    if (!hasAccess) {
      const nowIso = new Date().toISOString();
      const { data: direct } = await supabase
        .from("knowledge_entitlements")
        .select("id")
        .eq("user_id", userId)
        .eq("knowledge_id", item.id)
        .eq("active", true)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .maybeSingle();
      if (direct) hasAccess = true;
      if (!hasAccess) {
        const { data: bundleEnts } = await supabase
          .from("knowledge_entitlements")
          .select("bundle_id")
          .eq("user_id", userId)
          .eq("active", true)
          .not("bundle_id", "is", null)
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
        const bIds = (bundleEnts ?? []).map((b) => b.bundle_id as string);
        if (bIds.length > 0) {
          const { data: hit } = await supabase
            .from("knowledge_bundle_items")
            .select("bundle_id")
            .in("bundle_id", bIds)
            .eq("knowledge_id", item.id)
            .maybeSingle();
          if (hit) hasAccess = true;
        }
      }
    }

    const { data: chapters } = await supabase
      .from("knowledge_chapters")
      .select("id, slug, title, order_index, is_preview, content_md")
      .eq("knowledge_id", item.id)
      .order("order_index", { ascending: true });

    const { data: progress } = await supabase
      .from("knowledge_progress")
      .select("chapter_id, progress_pct, completed")
      .eq("user_id", userId)
      .eq("knowledge_id", item.id);

    const progMap = new Map<string, { pct: number; completed: boolean }>();
    for (const p of progress ?? []) progMap.set(p.chapter_id, { pct: Number(p.progress_pct), completed: p.completed });

    const shaped = (chapters ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      order_index: c.order_index,
      is_preview: c.is_preview,
      preview_excerpt: hasAccess || c.is_preview ? null : stripMarkdown(c.content_md, 240),
      content_md: hasAccess || c.is_preview ? c.content_md : null,
      progress_pct: progMap.get(c.id)?.pct ?? 0,
      completed: progMap.get(c.id)?.completed ?? false,
    }));

    return { item, chapters: shaped, hasAccess };
  });

// ------ Read one chapter (auth + access enforced server-side) ------
const chapterSchema = z.object({
  knowledgeSlug: z.string().regex(slugRe, "slug inválido"),
  chapterSlug: z.string().regex(slugRe, "slug inválido"),
});

// Public variant — returns full content only if the item is free or the chapter is a preview.
// No user-specific data (progress/notes/favorites). Used for anonymous readers.
export const getChapterPublic = createServerFn({ method: "GET" })
  .inputValidator((d) => chapterSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: item } = await sb
      .from("knowledge_items")
      .select("id, slug, title, access_type, price_cents, currency")
      .eq("slug", data.knowledgeSlug)
      .eq("status", "published")
      .maybeSingle();
    if (!item) throw new Error("Conteúdo não encontrado");

    const { data: chapter } = await sb
      .from("knowledge_chapters")
      .select("id, slug, title, order_index, is_preview, content_md")
      .eq("knowledge_id", item.id)
      .eq("slug", data.chapterSlug)
      .maybeSingle();
    if (!chapter) throw new Error("Capítulo não encontrado");

    const isFree = item.access_type === "free" || item.price_cents === 0;
    const hasAccess = isFree || chapter.is_preview;

    const { data: allChaps } = await sb
      .from("knowledge_chapters")
      .select("id, slug, title, order_index, is_preview")
      .eq("knowledge_id", item.id)
      .order("order_index", { ascending: true });

    return {
      item: { id: item.id, slug: item.slug, title: item.title, access_type: item.access_type, price_cents: item.price_cents, currency: item.currency },
      chapter: {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        order_index: chapter.order_index,
        is_preview: chapter.is_preview,
        content_md: hasAccess ? chapter.content_md : null,
      },
      allChapters: allChaps ?? [],
      hasAccess,
    };
  });


export const getChapter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => chapterSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: item } = await supabase
      .from("knowledge_items")
      .select("id, slug, title, access_type, price_cents, currency")
      .eq("slug", data.knowledgeSlug)
      .eq("status", "published")
      .maybeSingle();
    if (!item) throw new Error("Conteúdo não encontrado");

    const { data: chapter } = await supabase
      .from("knowledge_chapters")
      .select("id, slug, title, order_index, is_preview, content_md")
      .eq("knowledge_id", item.id)
      .eq("slug", data.chapterSlug)
      .maybeSingle();
    if (!chapter) throw new Error("Capítulo não encontrado");

    // Access enforcement
    let hasAccess = item.access_type === "free" || item.price_cents === 0 || chapter.is_preview;
    if (!hasAccess) {
      const nowIso = new Date().toISOString();
      const { data: direct } = await supabase
        .from("knowledge_entitlements")
        .select("id")
        .eq("user_id", userId)
        .eq("knowledge_id", item.id)
        .eq("active", true)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .maybeSingle();
      if (direct) hasAccess = true;
      if (!hasAccess) {
        const { data: bundleEnts } = await supabase
          .from("knowledge_entitlements")
          .select("bundle_id")
          .eq("user_id", userId)
          .eq("active", true)
          .not("bundle_id", "is", null)
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
        const bIds = (bundleEnts ?? []).map((b) => b.bundle_id as string);
        if (bIds.length > 0) {
          const { data: hit } = await supabase
            .from("knowledge_bundle_items")
            .select("bundle_id")
            .in("bundle_id", bIds)
            .eq("knowledge_id", item.id)
            .maybeSingle();
          if (hit) hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return {
        item: { id: item.id, slug: item.slug, title: item.title, access_type: item.access_type, price_cents: item.price_cents, currency: item.currency },
        chapter: { id: chapter.id, slug: chapter.slug, title: chapter.title, order_index: chapter.order_index, is_preview: false, content_md: null },
        hasAccess: false,
      };
    }

    // Load progress, notes, favorites, checklists (parallel)
    const [progRes, notesRes, favRes, checkRes, allChapsRes] = await Promise.all([
      supabase.from("knowledge_progress").select("progress_pct, last_position, completed").eq("user_id", userId).eq("chapter_id", chapter.id).maybeSingle(),
      supabase.from("knowledge_notes").select("id, content, anchor, updated_at").eq("user_id", userId).eq("chapter_id", chapter.id).order("updated_at", { ascending: false }),
      supabase.from("knowledge_favorites").select("id").eq("user_id", userId).eq("chapter_id", chapter.id).maybeSingle(),
      supabase.from("knowledge_checklists").select("item_key, checked").eq("user_id", userId).eq("chapter_id", chapter.id),
      supabase.from("knowledge_chapters").select("id, slug, title, order_index, is_preview").eq("knowledge_id", item.id).order("order_index", { ascending: true }),
    ]);

    return {
      item: { id: item.id, slug: item.slug, title: item.title, access_type: item.access_type, price_cents: item.price_cents, currency: item.currency },
      chapter: {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        order_index: chapter.order_index,
        is_preview: chapter.is_preview,
        content_md: chapter.content_md,
      },
      allChapters: allChapsRes.data ?? [],
      progress: progRes.data ?? null,
      notes: notesRes.data ?? [],
      favorite: Boolean(favRes.data),
      checklist: (checkRes.data ?? []).reduce<Record<string, boolean>>((acc, row) => {
        acc[row.item_key] = row.checked;
        return acc;
      }, {}),
      hasAccess: true,
    };
  });

// ------ Save progress ------
export const saveProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        knowledge_id: z.string().uuid(),
        chapter_id: z.string().uuid(),
        progress_pct: z.number().min(0).max(100),
        last_position: z.number().int().min(0).default(0),
        completed: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("knowledge_progress")
      .upsert(
        {
          user_id: context.userId,
          knowledge_id: data.knowledge_id,
          chapter_id: data.chapter_id,
          progress_pct: data.progress_pct,
          last_position: data.last_position,
          completed: data.completed,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "user_id,chapter_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------ Toggle favorite ------
export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ knowledge_id: z.string().uuid(), chapter_id: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const q = context.supabase
      .from("knowledge_favorites")
      .select("id")
      .eq("user_id", context.userId)
      .eq("knowledge_id", data.knowledge_id);
    const existing = data.chapter_id
      ? await q.eq("chapter_id", data.chapter_id).maybeSingle()
      : await q.is("chapter_id", null).maybeSingle();
    if (existing.data) {
      await context.supabase.from("knowledge_favorites").delete().eq("id", existing.data.id);
      return { favorited: false };
    }
    await context.supabase.from("knowledge_favorites").insert({
      user_id: context.userId,
      knowledge_id: data.knowledge_id,
      chapter_id: data.chapter_id ?? null,
    });
    return { favorited: true };
  });

// ------ Notes ------
export const upsertNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        knowledge_id: z.string().uuid(),
        chapter_id: z.string().uuid().optional(),
        content: z.string().max(10000),
        anchor: z.string().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { error } = await context.supabase
        .from("knowledge_notes")
        .update({ content: data.content, anchor: data.anchor ?? null })
        .eq("id", data.id)
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("knowledge_notes")
      .insert({
        user_id: context.userId,
        knowledge_id: data.knowledge_id,
        chapter_id: data.chapter_id ?? null,
        content: data.content,
        anchor: data.anchor ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("knowledge_notes").delete().eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

// ------ Checklists ------
export const toggleChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        chapter_id: z.string().uuid(),
        item_key: z.string().min(1).max(200),
        checked: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("knowledge_checklists")
      .upsert(
        {
          user_id: context.userId,
          chapter_id: data.chapter_id,
          item_key: data.item_key,
          checked: data.checked,
        },
        { onConflict: "user_id,chapter_id,item_key" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------ Checkout (unlock a knowledge item or bundle) ------
export const createKnowledgeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        knowledge_slug: z.string().regex(slugRe).optional(),
        bundle_slug: z.string().regex(slugRe).optional(),
      })
      .refine((v) => v.knowledge_slug || v.bundle_slug, { message: "knowledge_slug or bundle_slug required" })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { resolveOrigin } = await import("./origin.server");
    const origin = resolveOrigin();
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const requestKey = `${userId}:${data.knowledge_slug ?? data.bundle_slug ?? "unknown"}`;
    console.info("[knowledge-checkout] start", { requestKey, hasKnowledgeSlug: Boolean(data.knowledge_slug), hasBundleSlug: Boolean(data.bundle_slug) });

    let productName = "";
    let productDescription = "";
    let priceCents = 0;
    let currency = "brl";
    let successPath = "/knowledge";
    let entitlementRow: {
      user_id: string;
      knowledge_id: string | null;
      bundle_id: string | null;
      source: "purchase";
      active: false;
    } | null = null;
    const metadata: Record<string, string> = { kind: "knowledge", user_id: userId };

    if (data.knowledge_slug) {
      const { data: item } = await supabaseAdmin
        .from("knowledge_items")
        .select("id, slug, title, description, price_cents, currency, access_type")
        .eq("slug", data.knowledge_slug)
        .maybeSingle();
      if (!item) throw new Error("Conteúdo não encontrado");
      if (item.access_type === "free") throw new Error("Conteúdo gratuito");
      if (!item.price_cents || item.price_cents <= 0) throw new Error("Preço do conteúdo inválido");
      productName = `Knowledge Hub — ${item.title}`;
      productDescription = item.description || item.title;
      priceCents = item.price_cents;
      currency = item.currency.toLowerCase();
      successPath = `/knowledge/${item.slug}`;
      metadata.knowledge_id = item.id;
      entitlementRow = { user_id: userId, knowledge_id: item.id, bundle_id: null, source: "purchase", active: false };
    } else if (data.bundle_slug) {
      const { data: bundle } = await supabaseAdmin
        .from("knowledge_bundles")
        .select("id, slug, title, description, price_cents, currency")
        .eq("slug", data.bundle_slug)
        .maybeSingle();
      if (!bundle) throw new Error("Pacote não encontrado");
      productName = `Knowledge Hub — ${bundle.title}`;
      productDescription = bundle.description || bundle.title;
      priceCents = bundle.price_cents;
      currency = bundle.currency.toLowerCase();
      metadata.bundle_id = bundle.id;
      entitlementRow = { user_id: userId, knowledge_id: null, bundle_id: bundle.id, source: "purchase", active: false };
    }

    if (!entitlementRow || priceCents <= 0) throw new Error("Item inválido");

    const existingQuery = supabaseAdmin
      .from("knowledge_entitlements")
      .select("id, active, expires_at")
      .eq("user_id", userId);
    const existing = entitlementRow.knowledge_id
      ? await existingQuery.eq("knowledge_id", entitlementRow.knowledge_id).maybeSingle()
      : entitlementRow.bundle_id
        ? await existingQuery.eq("bundle_id", entitlementRow.bundle_id).maybeSingle()
        : { data: null, error: new Error("Pacote inválido") };

    if (existing.error) throw new Error("Falha ao verificar acesso existente");
    if (existing.data?.active && (!existing.data.expires_at || new Date(existing.data.expires_at).getTime() > Date.now())) {
      console.info("[knowledge-checkout] existing active entitlement", { requestKey, entitlementId: existing.data.id });
      return { url: `${origin}${successPath}?status=success&entitlement=${existing.data.id}` };
    }

    // Ensure a pending entitlement exists we can activate on webhook without disabling active access.
    const pendingWrite = existing.data
      ? supabaseAdmin
          .from("knowledge_entitlements")
          .update({ active: false, source: "purchase" })
          .eq("id", existing.data.id)
          .select("id")
          .single()
      : supabaseAdmin
          .from("knowledge_entitlements")
          .insert(entitlementRow)
          .select("id")
          .single();

    const { data: ent, error: entErr } = await pendingWrite;
    if (entErr || !ent) throw new Error("Falha ao registrar intenção de compra");
    metadata.entitlement_id = ent.id;
    console.info("[knowledge-checkout] pending entitlement", { requestKey, entitlementId: ent.id, priceCents, currency });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("[knowledge-checkout] missing stripe secret", { requestKey, entitlementId: ent.id });
      return { url: `${origin}/knowledge?pending=stripe` };
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" as never });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: productName, description: productDescription },
              unit_amount: priceCents,
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url: `${origin}${successPath}?status=success&entitlement=${ent.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/knowledge?status=cancel`,
      });
    } catch (error) {
      console.error("[knowledge-checkout] stripe session failed", {
        requestKey,
        entitlementId: ent.id,
        message: error instanceof Error ? error.message : "unknown",
      });
      throw new Error("Não foi possível iniciar o pagamento agora. Tente novamente em instantes.");
    }

    await supabaseAdmin
      .from("knowledge_entitlements")
      .update({ stripe_session_id: session.id })
      .eq("id", ent.id);

    console.info("[knowledge-checkout] session created", { requestKey, entitlementId: ent.id, sessionId: session.id });

    return { url: session.url ?? "" };
  });
