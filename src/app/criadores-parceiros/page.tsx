import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Heart, Star, Trophy } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { APPS, FUNDING_TIERS, getApp, type FundingTierId } from "@/lib/apps-catalog";
import { getSupabaseServer } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Roll dos Criadores Parceiros | Clodoaldo Silva",
  description:
    "Reconhecimento público a quem tornou possível o ecossistema de apps. Visionários, Co-Criadores, Colaboradores e Apoiadores.",
  alternates: { canonical: "https://clodoaldo-silva.lovable.app/criadores-parceiros" },
  openGraph: {
    title: "Roll dos Criadores Parceiros | Clodoaldo Silva",
    description:
      "Reconhecimento público a quem tornou possível o ecossistema de apps.",
    url: "https://clodoaldo-silva.lovable.app/criadores-parceiros",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const TIER_ORDER: FundingTierId[] = ["visionario", "co-criador", "colaborador", "apoiador"];

interface PublicSupporter {
  id: string;
  app_slug: string;
  tier_id: string;
  supporter_name: string;
  supporter_message: string | null;
  status: string;
}

async function listPublicSupporters(appSlug?: string) {
  try {
    const sb = getSupabaseServer();
    let q = sb
      .from("supporters")
      .select("id, app_slug, tier_id, supporter_name, supporter_message, status")
      .eq("status", "paid")
      .eq("public_display", true)
      .order("created_at", { ascending: false });

    if (appSlug) {
      q = q.eq("app_slug", appSlug);
    }

    const { data, error } = await q;
    if (error) {
      console.error("[criadores-parceiros] error:", error.message);
      return [];
    }
    return (data ?? []) as PublicSupporter[];
  } catch (e) {
    console.error("[criadores-parceiros] exception:", e);
    return [];
  }
}

export default async function CreatorsRollPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app: appFilter } = await searchParams;
  const filteredApp = appFilter ? getApp(appFilter) : null;
  const supporters = await listPublicSupporters(appFilter);

  const grouped: Record<FundingTierId, PublicSupporter[]> = {
    apoiador: [],
    colaborador: [],
    "co-criador": [],
    visionario: [],
  };
  for (const s of supporters) {
    const id = s.tier_id as FundingTierId;
    if (grouped[id]) grouped[id].push(s);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Programa Criadores Parceiros
          </div>
          <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl leading-tight">
            Roll dos Criadores Parceiros
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {filteredApp ? (
              <>
                Reconhecimento aos apoiadores que ajudaram a construir{" "}
                <strong className="text-foreground">{filteredApp.name}</strong>.{" "}
                <Link href="/criadores-parceiros" className="text-primary underline underline-offset-2">
                  ver todos os apps
                </Link>
              </>
            ) : (
              <>
                Cada apoio acelera o desenvolvimento e faz parte da história dos {APPS.length} apps.
                Estes são os Criadores Parceiros que tornaram (e tornam) tudo possível.
              </>
            )}
          </p>
        </div>

        {supporters.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-background/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              O Roll está pronto para receber seus primeiros nomes. Seja o primeiro a apoiar e
              tenha destaque premium.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Escolher um app para apoiar <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {supporters.length > 0 &&
          TIER_ORDER.map((tierId) => {
            const list = grouped[tierId];
            if (list.length === 0) return null;
            const tier = FUNDING_TIERS.find((t) => t.id === tierId)!;
            return (
              <section key={tierId} className="mt-14">
                <div className="flex items-center gap-3">
                  <TierBadge id={tierId} />
                  <div>
                    <h2 className="font-display font-medium text-2xl sm:text-3xl leading-tight">
                      {tier.label}s
                    </h2>
                    <p className="text-sm text-muted-foreground">{tier.headline}</p>
                  </div>
                </div>
                <div
                  className={`mt-6 grid gap-3 ${
                    tierId === "visionario"
                      ? "sm:grid-cols-2"
                      : tierId === "co-criador"
                        ? "sm:grid-cols-2 lg:grid-cols-3"
                        : "sm:grid-cols-2 lg:grid-cols-4"
                  }`}
                >
                  {list.map((s) => (
                    <SupporterCard key={s.id} supporter={s} tier={tierId} />
                  ))}
                </div>
              </section>
            );
          })}

        <div className="mt-16 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 sm:p-8">
          <h2 className="font-display font-medium text-2xl sm:text-3xl leading-tight">
            Quero ser um Criador Parceiro
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Escolha qualquer app do ecossistema e escolha um dos 4 níveis de apoio. Todos os
            níveis incluem seu nome permanente neste Roll.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/apps"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Explorar os {APPS.length} apps <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SupporterCard({
  supporter,
  tier,
}: {
  supporter: PublicSupporter;
  tier: FundingTierId;
}) {
  const app = getApp(supporter.app_slug);
  const isPremium = tier === "visionario" || tier === "co-criador";
  return (
    <article
      className={`rounded-2xl border p-4 flex items-start gap-3 ${
        tier === "visionario"
          ? "border-primary/60 bg-primary/5 shadow-glow"
          : isPremium
            ? "border-primary/30 bg-card/70"
            : "border-border bg-card/50"
      }`}
    >
      <TierBadge id={tier} small />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{supporter.supporter_name}</div>
        {supporter.supporter_message && (
          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            “{supporter.supporter_message}”
          </div>
        )}
        {app && (
          <Link
            href={`/apoiar/${app.slug}`}
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            Apoiou {app.name}
          </Link>
        )}
      </div>
    </article>
  );
}

function TierBadge({ id, small = false }: { id: FundingTierId; small?: boolean }) {
  const size = small ? 14 : 18;
  const map: Record<FundingTierId, React.ReactNode> = {
    apoiador: <Heart size={size} aria-hidden />,
    colaborador: <Star size={size} aria-hidden />,
    "co-criador": <Award size={size} aria-hidden />,
    visionario: <Trophy size={size} aria-hidden />,
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${
        small ? "h-8 w-8" : "h-12 w-12"
      } ${
        id === "visionario"
          ? "bg-gradient-orange text-primary-foreground shadow-glow"
          : "bg-primary/10 text-primary border border-primary/30"
      }`}
    >
      {map[id]}
    </span>
  );
}
