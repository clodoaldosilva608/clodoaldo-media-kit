import type { Metadata } from "next";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  return {
    title: `Adquirir ${slug} | Clodoaldo Silva`,
    description:
      "Finalize sua contratação com Clodoaldo Silva em um fluxo rápido com briefing, upsell e pagamento via Kiwify.",
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ service: string }>;
  searchParams: Promise<{ queue?: string }>;
}) {
  const { service: slug } = await params;
  const { queue: queueId } = await searchParams;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CheckoutClient slug={slug} queueId={queueId} />
      <Footer />
    </div>
  );
}
