import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, Home } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";

export const metadata: Metadata = {
  title: "Pagamento cancelado | Clodoaldo Silva",
  robots: { index: false, follow: false },
};

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-2xl px-5 sm:px-8 pt-32 pb-20 text-center flex-1">
        <div className="inline-flex h-20 w-20 rounded-full bg-destructive/15 items-center justify-center">
          <XCircle size={48} className="text-destructive" />
        </div>
        <h1 className="mt-6 font-display font-medium text-3xl sm:text-4xl">
          Pagamento cancelado
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Nenhum valor foi cobrado. Se preferir, você pode tentar novamente ou
          falar diretamente conosco no WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground"
          >
            <Home size={16} /> Voltar para o site
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
