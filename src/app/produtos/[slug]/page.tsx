"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, QrCode, Loader2, Copy, Check, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { type ProductRecord, categoryLabel, formatProductPrice } from "@/lib/product-catalog";

const WHATSAPP_PHONE = "5581920051068";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [pixOpen, setPixOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/public/products/${slug}`)
      .then(r => r.json())
      .then(d => setProduct(d.product || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function copyPix() {
    navigator.clipboard.writeText("6cf7994f-57e3-4ab3-9185-06d95b3291d6");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Link href="/#catalogo" className="text-primary hover:underline">← Voltar ao catálogo</Link>
      </div>
    );
  }

  const amount = product.price_cents / 100;
  const amountFormatted = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const priceDisplay = formatProductPrice(product);
  const waMsg = `Olá Clodoaldo! Tenho interesse no produto: ${product.name} (${priceDisplay}). Pode me explicar como funciona?`;

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org JSON-LD: Product + FAQ (Passo 13 do brief — SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "@id": `https://clodoaldo.vercel.app/produtos/${slug}#product`,
                name: product.name,
                description: product.description || `${product.name} — serviço de ${categoryLabel(product.category)} por Clodoaldo Silva`,
                category: categoryLabel(product.category),
                brand: { "@type": "Brand", name: "Clodoaldo Silva" },
                offers: {
                  "@type": "Offer",
                  price: product.price_cents ? (product.price_cents / 100).toFixed(2) : "0",
                  priceCurrency: "BRL",
                  availability: "https://schema.org/InStock",
                  url: `https://clodoaldo.vercel.app/produtos/${slug}`,
                  seller: { "@type": "Organization", name: "Clodoaldo Silva" },
                },
              },
              {
                "@type": "FAQPage",
                "@id": `https://clodoaldo.vercel.app/produtos/${slug}#faq`,
                mainEntity: getFAQ(product).map(faq => ({
                  "@type": "Question",
                  name: faq.q,
                  acceptedAnswer: { "@type": "Answer", text: faq.a },
                })),
              },
            ],
          }),
        }}
      />

      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">
          <Link href="/#catalogo" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Catálogo
          </Link>
          <Link href="/" className="text-sm font-bold text-primary">Clodoaldo Silva</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 py-8 sm:py-12">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {/* Image */}
          {product.image_path && (
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <img src={product.image_path} alt={product.name} className="h-full w-full object-cover" />
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              {categoryLabel(product.category)}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-medium leading-tight mb-3">
              {product.icon || "✅"} {product.name}
            </h1>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
              {priceDisplay}
            </div>
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setPixOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
              >
                <QrCode className="h-5 w-5" /> Pagar com PIX
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(waMsg)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-bold text-emerald-600 hover:bg-emerald-500/20 transition dark:text-emerald-400"
              >
                <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="mx-auto max-w-4xl px-5 pb-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-display text-lg font-medium mb-4">O que está incluso</h2>
          <ul className="space-y-3">
            {getInclusos(product.whatsapp_sku).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-display text-lg font-medium mb-4">Perguntas frequentes</h2>
          <div className="space-y-4">
            {getFAQ(product).map((faq, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-foreground mb-1">{faq.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/[0.04] p-6 text-center">
          <h3 className="font-display text-lg font-medium mb-2">Pronto pra começar?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Pague via PIX ou fale comigo no WhatsApp. Sem compromisso, sem fidelidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setPixOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
            >
              <QrCode className="h-4 w-4" /> Pagar com PIX
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-500/20 transition dark:text-emerald-400"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* PIX Modal */}
      {pixOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPixOpen(false)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white">
              <h3 className="font-display text-lg font-bold">💰 Pagamento via PIX</h3>
              <p className="text-xs opacity-90 mt-1">{product.name}</p>
              <div className="text-2xl font-bold mt-2">{amountFormatted}</div>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Chave PIX (C6 Bank)</div>
                <div className="font-mono text-xs break-all">6cf7994f-57e3-4ab3-9185-06d95b3291d6</div>
                <button onClick={copyPix} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar chave</>}
                </button>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Olá Clodoaldo! Acabei de pagar via PIX o produto: ${product.name} (${amountFormatted}). Segue o comprovante.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition"
              >
                <MessageCircle className="h-4 w-4" /> Enviar comprovante no WhatsApp
              </a>
              <button onClick={() => setPixOpen(false)} className="w-full text-xs text-muted-foreground hover:text-foreground transition">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getInclusos(sku: string | null): string[] {
  const map: Record<string, string[]> = {
    "site-profissional": [
      "Site profissional responsivo (desktop, tablet, mobile)",
      "Design moderno e otimizado para conversão",
      "SEO local básico (meta tags, structured data)",
      "Integração com WhatsApp (botão flutuante)",
      "Google Meu Negócio configurado",
      "Domínio e hospedagem por 1 ano",
      "Suporte por 30 dias após entrega",
    ],
    "seo-local": [
      "Otimização para aparecer em 1º nas buscas '[nicho] em [cidade]'",
      "Configuração completa do Google Search Console",
      "Otimização de meta tags e structured data",
      "Pesquisa de palavras-chave locais",
      "Relatório de posicionamento inicial",
      "Acompanhamento por 30 dias",
    ],
    "google-meu-negocio": [
      "Criação/otimização completa do perfil",
      "Adição de fotos profissionais",
      "Configuração de horários e serviços",
      "Descrição otimizada com keywords",
      "Postagens iniciais (3 posts)",
      "Avaliações: estratégia de captação",
    ],
    "integracao-whatsapp": [
      "Botão flutuante de WhatsApp em todas as páginas",
      "Formulário que abre WhatsApp com mensagem pronta",
      "Configuração de mensagem de saudação automática",
      "QR Code para contato direto",
      "Catálogo de produtos no WhatsApp Business",
    ],
    "cardapio-digital-qr": [
      "Cardápio digital acessível via QR Code",
      "Design responsivo (funciona em qualquer celular)",
      "Categorias organizadas (entradas, pratos, sobremesas, bebidas)",
      "Fotos e descrições atrativas de cada prato",
      "Atualização ilimitada por 30 dias",
      "10 QR Codes impressos (entrega em Recife)",
    ],
    "edicao-cardapio": [
      "Fotografia profissional de 20 itens do cardápio",
      "Descrições copywriting que vendem",
      "Edição e tratamento de imagens",
      "Organização visual por categorias",
      "Versão digital + impressa",
    ],
    "artes-redes-sociais": [
      "12 a 30 artes mensais prontas para postar",
      "Templates personalizados com sua marca",
      "Copy (texto) para cada post",
      "Calendário de conteúdo mensal",
      "Stories templates reutilizáveis",
      "Ajustes ilimitados nas artes",
    ],
    "pacote-recorrencia-mensal": [
      "Tudo do Site Profissional",
      "Tudo do SEO Local",
      "Tudo do Google Meu Negócio",
      "Tudo das Artes para Redes Sociais",
      "Suporte prioritário por WhatsApp",
      "Atualizações ilimitadas no site",
      "Relatório mensal de resultados",
    ],
    "produtos-digitais-sob-medida": [
      "E-books personalizados com sua marca",
      "Landing pages de campanhas",
      "Auditoria completa de perfil",
      "Criativos para tráfego pago",
      "Consultoria de estratégia digital",
    ],
  };
  return map[sku || ""] || ["Entre em contato para detalhes personalizados"];
}

function getFAQ(product: ProductRecord): Array<{ q: string; a: string }> {
  return [
    {
      q: "Qual o prazo de entrega?",
      a: product.whatsapp_sku === "site-profissional"
        ? "7 a 15 dias úteis após briefing aprovado."
        : product.whatsapp_sku === "artes-redes-sociais" || product.whatsapp_sku === "pacote-recorrencia-mensal"
        ? "Primeiras artes em 3 dias úteis. Depois, entregas semanais."
        : "3 a 7 dias úteis dependendo do escopo.",
    },
    {
      q: "Tem fidelidade ou contrato?",
      a: "Não. Você pode cancelar a recorrência quando quiser, sem multa. O site é seu para sempre.",
    },
    {
      q: "Como funciona o pagamento?",
      a: `PIX (chave aleatória C6 Bank) ou parcelamento em até 12x. O valor é ${product.price_label || " conforme acima"}. Após o pagamento, libero o acesso imediatamente.`,
    },
    {
      q: "Atende quais regiões?",
      a: "Atendo todo Brasil (remoto). Para fotografia de cardápio, presencial em Recife e região metropolitana.",
    },
  ];
}
