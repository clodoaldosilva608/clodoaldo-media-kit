import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, Download, Home, Instagram, MessageCircle, Youtube } from "lucide-react";
import { Footer } from "@/components/media-kit/footer";
import { Header } from "@/components/media-kit/header";
import { getSupabaseServer } from "@/lib/supabase-server";
import { SERVICES, type ServiceSlug } from "@/lib/services-catalog";

export const metadata: Metadata = {
  title: "Pedido confirmado! | Clodoaldo Silva",
  robots: { index: false, follow: false },
};

// Force dynamic — depends on query param.
export const dynamic = "force-dynamic";

async function getOrder(orderId: string | undefined) {
  if (!orderId) return null;
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("orders")
      .select("id, service_slug, addons, status, customer_email, customer_name")
      .eq("id", orderId)
      .maybeSingle();
    if (error) {
      console.error("[checkout/sucesso] error:", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error("[checkout/sucesso] exception:", e);
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; pending?: string }>;
}) {
  const { order: orderId, pending } = await searchParams;
  const order = await getOrder(orderId);
  const isPending = pending === "kiwify";

  const service = order?.service_slug ? SERVICES[order.service_slug as ServiceSlug] : null;
  const addons = Array.isArray(order?.addons)
    ? (order!.addons as Array<{ slug: string; name: string }>)
    : [];
  const addonServices = addons
    .map((a) => SERVICES[a.slug as ServiceSlug])
    .filter((s): s is NonNullable<typeof s> => !!s);

  const downloads = [service, ...addonServices].filter(
    (s): s is NonNullable<typeof s> => !!s && !!s.pdfUrl,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-2xl px-5 sm:px-8 pt-32 pb-20 text-center flex-1">
        <div className="inline-flex h-20 w-20 rounded-full bg-success/15 items-center justify-center">
          <CheckCircle2 size={48} className="text-success" />
        </div>
        <h1 className="mt-6 font-display font-medium text-3xl sm:text-4xl">
          {isPending ? "Briefing recebido!" : "Pedido confirmado!"}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          {isPending
            ? "Recebemos seu briefing com sucesso! Em até 24h úteis você receberá um email do Clodoaldo com o link de pagamento personalizado (PIX, cartão ou boleto) e os próximos passos."
            : "Seu pedido entrou na fila de análise. Materiais digitais estão disponíveis para download abaixo; serviços com briefing serão retornados em até 72 horas úteis."}
        </p>

        {isPending && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6 text-left">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Resumo do seu pedido
            </div>
            <h2 className="mt-2 font-display text-xl sm:text-2xl font-black">
              {service?.shortName || order?.service_slug || "Serviço"}
            </h2>
            {order?.customer_name && (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="text-foreground">Cliente:</strong> {order.customer_name}
                {order.customer_email && <> · {order.customer_email}</>}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              ✉️ Fique de olho no seu email (verifique também o spam) e em seu WhatsApp.
            </p>
          </div>
        )}

        {downloads.length > 0 && (
          <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6 text-left">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Downloads disponíveis
            </div>
            <h2 className="mt-2 font-display text-xl sm:text-2xl font-black">
              Acesse seus materiais agora
            </h2>
            <ul className="mt-4 space-y-3">
              {downloads.map((s) => (
                <li key={s.slug}>
                  <a
                    href={s.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 min-h-11 text-sm font-semibold hover:bg-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="inline-flex items-center gap-3 text-left">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-orange text-primary-foreground">
                        <Download size={16} />
                      </span>
                      <span>{s.shortName}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6 text-left flex gap-4 items-start">
          <Clock size={28} className="text-primary shrink-0 mt-1" aria-hidden="true" />
          <div>
            <div className="font-display font-medium text-base">Próximos passos</div>
            <p className="text-sm text-muted-foreground mt-1">
              O briefing será revisado e o retorno comercial seguirá pelo e-mail ou WhatsApp informado. Se o seu pedido incluir bônus digitais, eles entram no fluxo automaticamente.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5 sm:p-6 text-left">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Bônus de engajamento
          </div>
          <h2 className="mt-2 font-display text-xl sm:text-2xl font-black">
            Enquanto aguarda, siga as redes do Clodoaldo
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Novas dicas, bastidores e referências chegam toda semana — destrave materiais extras seguindo os perfis abaixo.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a
            href="https://www.instagram.com/clodoaldo_c_silva"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Instagram size={16} /> Seguir no Instagram
          </a>
          <a
            href="https://youtube.com/@clodoaldosilvaa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF0000] px-6 py-3 min-h-11 text-sm font-semibold text-white"
          >
            <Youtube size={16} /> Seguir no YouTube
          </a>
          <a
            href="https://wa.me/5581920051068?text=Ol%C3%A1!%20Acabei%20de%20enviar%20um%20briefing%20pelo%20site%20e%20gostaria%20de%20confirmar%20o%20recebimento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 min-h-11 text-sm font-semibold hover:bg-card"
          >
            <MessageCircle size={16} /> Falar no WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 min-h-11 text-sm font-semibold hover:bg-card"
          >
            <Home size={16} /> Voltar para o site
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
