import type { Metadata } from "next";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { getApp } from "@/lib/apps-catalog";
import { getSupabaseServer } from "@/lib/supabase-server";
import { ApoiarClient } from "./apoiar-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ app: string }>;
}): Promise<Metadata> {
  const { app: slug } = await params;
  const app = getApp(slug);
  if (!app) {
    return {
      title: "Apoiar app | Clodoaldo Silva",
      robots: { index: false, follow: false },
    };
  }
  const title = `Apoie ${app.name} e seja um Criador Parceiro | Clodoaldo Silva`;
  const description = `Construa o futuro conosco. Apoie o desenvolvimento de ${app.name} — ${app.tagline} — e tenha seu nome eternizado no Roll dos Criadores Parceiros.`;
  const url = `https://clodoaldo-media-kit.vercel.app/apoiar/${app.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [app.coverUrl],
    },
  };
}

interface PublicSupporter {
  id: string;
  tier_id: string;
  supporter_name: string;
  supporter_message: string | null;
}

async function listAppSupporters(appSlug: string): Promise<PublicSupporter[]> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("supporters")
      .select("id, tier_id, supporter_name, supporter_message")
      .eq("app_slug", appSlug)
      .eq("status", "paid")
      .eq("public_display", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[apoiar] supporters error:", error.message);
      return [];
    }
    return (data ?? []) as PublicSupporter[];
  } catch (e) {
    console.error("[apoiar] exception:", e);
    return [];
  }
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ app: string }>;
}) {
  const { app: slug } = await params;
  const app = getApp(slug);

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-32 pb-20 flex-1">
          <h1 className="font-display font-medium text-3xl">App não encontrado</h1>
          <a href="/apps" className="mt-4 inline-flex items-center gap-2 text-primary">
            Ver todos os apps
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  const supporters = await listAppSupporters(app.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ApoiarClient app={app} supporters={supporters} />
      <Footer />
    </div>
  );
}
