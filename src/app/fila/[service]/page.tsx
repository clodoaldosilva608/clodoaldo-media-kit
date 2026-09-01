import type { Metadata } from "next";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { FilaClient } from "./fila-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  return {
    title: `Fila de espera — ${slug} | Clodoaldo Silva`,
    description:
      "Reserve sua posição na fila de produção e siga para o checkout quando estiver pronto.",
    robots: { index: false, follow: false },
  };
}

export default async function FilaPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: slug } = await params;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <FilaClient slug={slug} />
      <Footer />
    </div>
  );
}
