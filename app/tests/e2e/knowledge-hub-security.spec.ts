import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const premiumSlug = "pack-prompts-premium";
const premiumZipSlug = "pack-imagens-premium";
const zipPath = "/api/public/downloads/pack-imagens-premium.zip";

function hasBackendEnv() {
  return Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
}

function hasDatabaseEnv() {
  return Boolean(process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE);
}

function sqlValue(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function psql(query: string) {
  return execFileSync("psql", ["-Atqc", query], { encoding: "utf8" }).trim();
}

async function signUpIsolatedUser(page: Page) {
  test.skip(!hasBackendEnv(), "Backend auth env is required for authenticated E2E checks.");

  const client = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const email = `knowledge-e2e-${randomUUID()}@example.com`;
  const password = `E2e-${randomUUID()}a1!`;
  const { data, error } = await client.auth.signUp({ email, password });
  test.skip(Boolean(error || !data.session || !data.user), "Auth sign-up did not return an active session.");

  const storageKey = `sb-${new URL(process.env.VITE_SUPABASE_URL!).hostname.split(".")[0]}-auth-token`;
  await page.goto("/");
  await page.evaluate(
    ({ key, session }) => window.localStorage.setItem(key, JSON.stringify(session)),
    { key: storageKey, session: data.session },
  );

  return { userId: data.user!.id };
}

test("Biblioteca mostra e-books e nenhum card revelado fica com opacity 0", async ({ page }) => {
  await page.goto("/biblioteca");
  await expect(page.getByText("Biblioteca Digital").first()).toBeVisible();
  await expect(page.getByText("Pack de Imagens Premium", { exact: true })).toBeVisible();
  await expect(page.getByText("Pack de Prompts Premium", { exact: true })).toBeVisible();

  await page.goto("/");
  await page.locator("#biblioteca").scrollIntoViewIfNeeded();
  await expect(page.getByText("Pack de Imagens Premium", { exact: true }).first()).toBeVisible();

  const hiddenRevealCount = await page.locator(".reveal.is-visible").evaluateAll((els) =>
    els.filter((el) => getComputedStyle(el).opacity === "0").length,
  );
  expect(hiddenRevealCount).toBe(0);
});

test("Biblioteca continua visível sem IntersectionObserver", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", { value: undefined, configurable: true });
  });
  await page.goto("/biblioteca");
  await expect(page.getByText("Pack de Imagens Premium", { exact: true })).toBeVisible();

  const transparentCards = await page.locator(".reveal").evaluateAll((els) =>
    els.filter((el) => (el.textContent ?? "").includes("Pack de Imagens") && getComputedStyle(el).opacity === "0").length,
  );
  expect(transparentCards).toBe(0);
});

test("Download validado do Pack de Imagens retorna o ZIP correto", async ({ request }) => {
  const response = await request.get(zipPath);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/zip");
  expect(Number(response.headers()["content-length"])).toBe(15_696_404);
  expect(response.headers()["x-content-sha256"]).toBe("001b227be01f7253f6e2cdab19972788e6af1c9a05a6b21d35d905b2e02decca");
});

test("Paywall bloqueia Pack de Prompts sem entitlement e webhook libera acesso", async ({ page, request }) => {
  test.skip(!hasDatabaseEnv(), "Database env is required to create an isolated entitlement fixture.");
  test.skip(!process.env.STRIPE_WEBHOOK_SECRET, "Stripe webhook secret is required to sign the simulated event.");

  const { userId } = await signUpIsolatedUser(page);
  await page.goto(`/knowledge/${premiumSlug}`);
  await expect(page.getByText("Conteúdo premium")).toBeVisible();
  await expect(page.getByRole("button", { name: /desbloquear agora/i })).toBeVisible();

  const knowledgeId = psql(`select id from public.knowledge_items where slug = ${sqlValue(premiumSlug)} limit 1`);
  expect(knowledgeId).toMatch(/[0-9a-f-]{36}/);
  const sessionId = `cs_test_${randomUUID()}`;
  const entitlementId = psql(`
    insert into public.knowledge_entitlements (user_id, knowledge_id, source, active, stripe_session_id)
    values (${sqlValue(userId)}, ${sqlValue(knowledgeId)}, 'purchase', false, ${sqlValue(sessionId)})
    returning id
  `);
  expect(entitlementId).toMatch(/[0-9a-f-]{36}/);

  const stripe = new Stripe("sk_test_placeholder", { apiVersion: "2024-12-18.acacia" as never });
  const payload = JSON.stringify({
    id: `evt_${randomUUID()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_intent: `pi_${randomUUID()}`,
        metadata: { kind: "knowledge", entitlement_id: entitlementId },
      },
    },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });

  const webhookResponse = await request.post("/api/public/stripe-webhook", {
    data: payload,
    headers: { "stripe-signature": signature, "content-type": "application/json" },
  });
  expect(webhookResponse.status()).toBe(200);

  await page.reload();
  await expect(page.getByRole("link", { name: /começar a ler/i })).toBeVisible();
});

test("Paywall bloqueia Pack de Imagens e webhook libera o capítulo de download do ZIP", async ({ page, request }) => {
  test.skip(!hasDatabaseEnv(), "Database env is required to create an isolated entitlement fixture.");
  test.skip(!process.env.STRIPE_WEBHOOK_SECRET, "Stripe webhook secret is required to sign the simulated event.");

  const { userId } = await signUpIsolatedUser(page);
  await page.goto(`/knowledge/${premiumZipSlug}/baixar-arquivos`);
  await expect(page.getByText("Conteúdo premium")).toBeVisible();

  const knowledgeId = psql(`select id from public.knowledge_items where slug = ${sqlValue(premiumZipSlug)} limit 1`);
  expect(knowledgeId).toMatch(/[0-9a-f-]{36}/);
  const sessionId = `cs_test_${randomUUID()}`;
  const entitlementId = psql(`
    insert into public.knowledge_entitlements (user_id, knowledge_id, source, active, stripe_session_id)
    values (${sqlValue(userId)}, ${sqlValue(knowledgeId)}, 'purchase', false, ${sqlValue(sessionId)})
    returning id
  `);

  const stripe = new Stripe("sk_test_placeholder", { apiVersion: "2024-12-18.acacia" as never });
  const payload = JSON.stringify({
    id: `evt_${randomUUID()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_intent: `pi_${randomUUID()}`,
        metadata: { kind: "knowledge", entitlement_id: entitlementId, knowledge_id: knowledgeId },
      },
    },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });

  const webhookResponse = await request.post("/api/public/stripe-webhook", {
    data: payload,
    headers: { "stripe-signature": signature, "content-type": "application/json" },
  });
  expect(webhookResponse.status()).toBe(200);

  await page.reload();
  await expect(page.getByRole("link", { name: /baixar pack de imagens/i })).toBeVisible();
  const downloadResponse = await request.get(zipPath);
  expect(downloadResponse.status()).toBe(200);
});
test("E-book gratuito abre capítulo público sem redirecionar para /auth", async ({ page }) => {
  test.skip(!hasDatabaseEnv(), "Database env required to lookup a free item.");
  const row = psql(`
    select ki.slug || '|' || kc.slug
    from public.knowledge_items ki
    join public.knowledge_chapters kc on kc.knowledge_id = ki.id
    where ki.access_type = 'free' and ki.status = 'published'
    order by ki.order_index, kc.order_index
    limit 1
  `);
  test.skip(!row.includes("|"), "No free item + chapter available for the test.");
  const [itemSlug, chapterSlug] = row.split("|");

  await page.goto(`/knowledge/${itemSlug}/${chapterSlug}`);
  await page.waitForLoadState("networkidle");
  expect(page.url()).not.toContain("/auth");
  expect(page.url()).toContain(`/knowledge/${itemSlug}/${chapterSlug}`);
});

test("Webhook Stripe rejeita replay do mesmo event.id (idempotência)", async ({ request }) => {
  test.skip(!hasDatabaseEnv(), "Database env required.");
  test.skip(!process.env.STRIPE_WEBHOOK_SECRET, "Stripe webhook secret required.");

  // Send an event that has no matching order/entitlement so business logic
  // returns quickly; we only care that the second delivery is deduped.
  const stripe = new Stripe("sk_test_placeholder", { apiVersion: "2024-12-18.acacia" as never });
  const eventId = `evt_${randomUUID()}`;
  const payload = JSON.stringify({
    id: eventId,
    object: "event",
    type: "customer.subscription.updated", // ignored branch → 200 ok
    data: { object: { id: `sub_${randomUUID()}` } },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });

  const first = await request.post("/api/public/stripe-webhook", {
    data: payload,
    headers: { "stripe-signature": signature, "content-type": "application/json" },
  });
  expect(first.status()).toBe(200);

  const replay = await request.post("/api/public/stripe-webhook", {
    data: payload,
    headers: { "stripe-signature": signature, "content-type": "application/json" },
  });
  expect(replay.status()).toBe(200);

  const count = psql(`select count(*) from public.stripe_webhook_events where event_id = ${sqlValue(eventId)}`);
  expect(count).toBe("1");
});

test("Webhook nega entitlement de outro usuário/produto e mantém o paywall bloqueado", async ({ page, request }) => {
  test.skip(!hasDatabaseEnv(), "Database env required.");
  test.skip(!process.env.STRIPE_WEBHOOK_SECRET, "Stripe webhook secret required.");

  const { userId } = await signUpIsolatedUser(page);
  const knowledgeId = psql(`select id from public.knowledge_items where slug = ${sqlValue(premiumSlug)} limit 1`);
  const otherKnowledgeId = psql(`
    select id from public.knowledge_items
    where slug <> ${sqlValue(premiumSlug)} and access_type = 'paid'
    limit 1
  `);
  test.skip(!otherKnowledgeId, "Second paid item required for the mismatch scenario.");

  const sessionId = `cs_test_${randomUUID()}`;
  const entitlementId = psql(`
    insert into public.knowledge_entitlements (user_id, knowledge_id, source, active, stripe_session_id)
    values (${sqlValue(userId)}, ${sqlValue(knowledgeId)}, 'purchase', false, ${sqlValue(sessionId)})
    returning id
  `);

  const stripe = new Stripe("sk_test_placeholder", { apiVersion: "2024-12-18.acacia" as never });

  async function deliver(metadata: Record<string, string>) {
    const payload = JSON.stringify({
      id: `evt_${randomUUID()}`,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          object: "checkout.session",
          payment_intent: `pi_${randomUUID()}`,
          metadata: { kind: "knowledge", entitlement_id: entitlementId, ...metadata },
        },
      },
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });
    return request.post("/api/public/stripe-webhook", {
      data: payload,
      headers: { "stripe-signature": signature, "content-type": "application/json" },
    });
  }

  // Wrong owner in metadata → ownership mismatch.
  const wrongUser = await deliver({ user_id: randomUUID() });
  expect(wrongUser.status()).toBe(409);

  // Wrong product in metadata → product mismatch.
  const wrongProduct = await deliver({ knowledge_id: otherKnowledgeId });
  expect(wrongProduct.status()).toBe(409);

  const active = psql(`select active from public.knowledge_entitlements where id = ${sqlValue(entitlementId)}`);
  expect(active).toBe("f");

  await page.goto(`/knowledge/${premiumSlug}`);
  await expect(page.getByText("Conteúdo premium")).toBeVisible();
  await expect(page.getByRole("button", { name: /desbloquear agora/i })).toBeVisible();
});

test("Replay triplo do checkout ativa o entitlement uma única vez", async ({ page, request }) => {
  test.skip(!hasDatabaseEnv(), "Database env required.");
  test.skip(!process.env.STRIPE_WEBHOOK_SECRET, "Stripe webhook secret required.");

  const { userId } = await signUpIsolatedUser(page);
  const knowledgeId = psql(`select id from public.knowledge_items where slug = ${sqlValue(premiumSlug)} limit 1`);
  const sessionId = `cs_test_${randomUUID()}`;
  const entitlementId = psql(`
    insert into public.knowledge_entitlements (user_id, knowledge_id, source, active, stripe_session_id)
    values (${sqlValue(userId)}, ${sqlValue(knowledgeId)}, 'purchase', false, ${sqlValue(sessionId)})
    returning id
  `);

  const stripe = new Stripe("sk_test_placeholder", { apiVersion: "2024-12-18.acacia" as never });
  const eventId = `evt_${randomUUID()}`;
  const payload = JSON.stringify({
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_intent: `pi_${randomUUID()}`,
        metadata: {
          kind: "knowledge",
          entitlement_id: entitlementId,
          knowledge_id: knowledgeId,
          user_id: userId,
        },
      },
    },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });

  for (let i = 0; i < 3; i += 1) {
    const response = await request.post("/api/public/stripe-webhook", {
      data: payload,
      headers: { "stripe-signature": signature, "content-type": "application/json" },
    });
    expect(response.status()).toBe(200);
  }

  expect(psql(`select count(*) from public.stripe_webhook_events where event_id = ${sqlValue(eventId)}`)).toBe("1");
  expect(
    psql(`
      select count(*) from public.knowledge_entitlements
      where user_id = ${sqlValue(userId)} and knowledge_id = ${sqlValue(knowledgeId)} and active
    `),
  ).toBe("1");
});
