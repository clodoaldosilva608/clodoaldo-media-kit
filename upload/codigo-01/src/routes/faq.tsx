import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Footer } from "@/components/media-kit/footer";
import { Header } from "@/components/media-kit/header";

const SITE_URL = "https://clodoaldo-silva.lovable.app";
const WHATSAPP_URL = "https://wa.me/qr/AGB4UOBZXOSAE1";

const FAQ = [
  {
    q: "Como funciona a contratação de um serviço?",
    a: "Escolha o formato ideal, avance pelo checkout, preencha o briefing e finalize o pagamento. Em seguida o pedido entra em análise e o retorno acontece com prioridade comercial.",
  },
  {
    q: "Qual é o prazo de entrega?",
    a: "O prazo padrão é de até 72 horas úteis após confirmação do pagamento e recebimento completo do briefing.",
  },
  {
    q: "Como funcionam os Ghost Services?",
    a: "São produtos pensados para quem quer estratégia, roteiro, edição, criativos ou diagnóstico sem depender da aparição direta do Clodoaldo no conteúdo.",
  },
  {
    q: "Como funciona a Biblioteca Digital?",
    a: "A Biblioteca reúne e-books gratuitos para captura de lead, materiais pagos de entrada e bônus que podem ser liberados automaticamente em compras premium.",
  },
  {
    q: "Os e-books gratuitos exigem cadastro?",
    a: "Sim. O acesso é liberado após informar e-mail e aceitar o recebimento do material, criando uma porta de entrada para o ecossistema digital.",
  },
  {
    q: "Os e-books pagos são entregues como?",
    a: "A compra acontece de forma digital e segura. Após confirmação do pedido, o material entra no fluxo de entrega associado ao checkout.",
  },
  {
    q: "Existe nota fiscal?",
    a: "Sim. As contratações podem ser formalizadas e organizadas conforme a necessidade comercial do projeto.",
  },
  {
    q: "Posso pedir algo personalizado?",
    a: "Sim. Se o escopo não se encaixar exatamente nos formatos listados, o WhatsApp funciona como canal direto para proposta personalizada.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Perguntas Frequentes | Clodoaldo Silva" },
      {
        name: "description",
        content:
          "Dúvidas sobre serviços, Ghost Services, e-books, prazos, pagamentos e funcionamento da plataforma comercial do Clodoaldo Silva.",
      },
      { property: "og:title", content: "FAQ — Perguntas Frequentes | Clodoaldo Silva" },
      {
        property: "og:description",
        content:
          "Tire dúvidas sobre contratação, Biblioteca Digital, prazos, pagamentos e formatos de parceria.",
      },
      { property: "og:url", content: `${SITE_URL}/faq` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/faq` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
          FAQ Inteligente
        </div>
        <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl">
          Dúvidas que travam a decisão? Resolva aqui.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Reunimos respostas rápidas sobre contratação, produtos digitais, Ghost Services, prazos e funcionamento da plataforma.
        </p>

        <div className="mt-10 space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-display font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 shadow-card">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Ainda com dúvidas?
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">
            Fale com meu time no WhatsApp
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Se você quer validar o melhor formato, confirmar disponibilidade ou pedir uma proposta sob medida, o canal mais rápido é o WhatsApp.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <MessageCircle size={16} /> Falar no WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
