import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Download, Home, Instagram, MessageCircle, Youtube } from "lucide-react";
import { Footer } from "@/components/media-kit/footer";
import { Header } from "@/components/media-kit/header";
import { getOrderSummary } from "@/lib/orders.functions";
import { SERVICES, type ServiceSlug } from "@/lib/services-catalog";

export const Route = createFileRoute("/checkout/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    order: typeof s.order === "string" ? s.order : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pedido confirmado! | Clodoaldo Silva" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order: orderId } = Route.useSearch();
  const fetchOrder = useServerFn(getOrderSummary);
  const { data: order } = useQuery({
    queryKey: ["order-summary", orderId],
    queryFn: () => fetchOrder({ data: { orderId: orderId! } }),
    enabled: !!orderId,
  });

  const service = order?.service_slug
    ? SERVICES[order.service_slug as ServiceSlug]
    : null;
  const addons = Array.isArray(order?.addons) ? (order!.addons as Array<{ slug: string; name: string }>) : [];
  const addonServices = addons
    .map((a) => SERVICES[a.slug as ServiceSlug])
    .filter((s): s is NonNullable<typeof s> => !!s);

  const downloads = [service, ...addonServices]
    .filter((s): s is NonNullable<typeof s> => !!s && !!s.pdfUrl);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-5 sm:px-8 pt-32 pb-20 text-center">
        <div className="inline-flex h-20 w-20 rounded-full bg-success/15 items-center justify-center">
          <CheckCircle2 size={48} className="text-success" />
        </div>
        <h1 className="mt-6 font-display font-medium text-3xl sm:text-4xl">
          Pedido confirmado!
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Seu pedido entrou na fila de análise. Materiais digitais estão disponíveis para download abaixo; serviços com briefing serão retornados em até 72 horas úteis.
        </p>

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
            href="https://wa.me/qr/AGB4UOBZXOSAE1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 min-h-11 text-sm font-semibold hover:bg-card"
          >
            <MessageCircle size={16} /> Falar no WhatsApp
          </a>
          <Link
            to="/"
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
