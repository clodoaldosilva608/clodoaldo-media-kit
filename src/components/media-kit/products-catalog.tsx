"use client";

import { useEffect, useState } from "react";
import { MessageCircle, QrCode, Loader2, Copy, Check } from "lucide-react";

/**
 * Products Catalog — Seção da landing page que mostra os 9 produtos
 * do método Gabriel Miranda, com botão "Pagar com PIX" e "Falar no WhatsApp".
 *
 * Busca produtos do /api/public/products (público, sem auth).
 */
interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  price_label: string | null;
  category: string;
  icon: string | null;
  is_recurring: boolean;
  image_path: string | null;
  whatsapp_sku: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  site: "Site Profissional",
  seo: "SEO",
  gmb: "Google Meu Negócio",
  cardapio: "Cardápio Digital",
  social: "Redes Sociais",
  assinatura: "Assinatura",
  extras: "Extras",
};

const WHATSAPP_PHONE = "5581920051068";

export function ProductsCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pixModal, setPixModal] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/public/products")
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function buildWhatsAppLink(p: Product): string {
    const msg = `Olá Clodoaldo! Tenho interesse no produto: ${p.name} (${p.price_label || "valor a combinar"}). Pode me explicar como funciona?`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
  }

  function openPix(p: Product) {
    setPixModal(p);
  }

  function copyPixKey() {
    navigator.clipboard.writeText("6cf7994f-57e3-4ab3-9185-06d95b3291d6");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
          Carregando catálogo de produtos…
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20 md:py-24" id="catalogo">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          Catálogo de produtos
        </div>
        <h2 className="mt-2 font-display font-medium text-2xl sm:text-3xl md:text-4xl leading-tight">
          Tudo que seu negócio precisa pra crescer online
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
          Site profissional, SEO local, cardápio digital, redes sociais — escolha o que faz sentido pra você.
          Pague via PIX com 1 clique ou fale comigo no WhatsApp pra tirar dúvidas.
        </p>
      </div>

      {/* Grid de produtos */}
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onPix={() => openPix(p)}
            whatsappLink={buildWhatsAppLink(p)}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 sm:mt-12 rounded-2xl border border-primary/30 bg-primary/[0.04] p-6 sm:p-8 text-center">
        <h3 className="font-display font-medium text-xl sm:text-2xl mb-2">
          Não sabe qual produto escolher?
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
          Me chama no WhatsApp — em 5 minutinhos eu monto um plano personalizado pro seu negócio, sem compromisso.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Olá Clodoaldo! Vi seu catálogo de produtos e queria ajuda pra escolher o melhor pro meu negócio.")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition"
        >
          <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
        </a>
      </div>

      {/* PIX Modal */}
      {pixModal && (
        <PixModal product={pixModal} onClose={() => setPixModal(null)} onCopyPix={copyPixKey} copied={copied} />
      )}
    </section>
  );
}

function ProductCard({ product, onPix, whatsappLink }: { product: Product; onPix: () => void; whatsappLink: string }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-primary/40 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {/* Image */}
      {product.image_path && (
        <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={product.image_path}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-medium text-base sm:text-lg leading-tight">
            {product.icon || "✅"} {product.name}
          </h3>
          {product.is_recurring && (
            <span className="shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-500 dark:text-blue-300">
              assinatura
            </span>
          )}
        </div>

        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
        </div>

        {product.description && (
          <p className="text-xs text-muted-foreground mb-4 line-clamp-3 flex-1">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {product.price_label || formatBRL(product.price_cents)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={onPix}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
          >
            <QrCode className="h-4 w-4" /> Pagar com PIX
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-500/20 transition dark:text-emerald-400"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function PixModal({ product, onClose, onCopyPix, copied }: {
  product: Product;
  onClose: () => void;
  onCopyPix: () => void;
  copied: boolean;
}) {
  const pixKey = "6cf7994f-57e3-4ab3-9185-06d95b3291d6"; // C6 Bank aleatória (configurada no admin)
  const amount = product.price_cents / 100;
  const amountFormatted = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white">
          <h3 className="font-display text-lg font-bold">💰 Pagamento via PIX</h3>
          <p className="text-xs opacity-90 mt-1">{product.name}</p>
          <div className="text-2xl font-bold mt-2">{amountFormatted}</div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Chave PIX (C6 Bank — aleatória)
            </div>
            <div className="font-mono text-xs break-all">{pixKey}</div>
            <button
              onClick={onCopyPix}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar chave</>}
            </button>
          </div>

          <ol className="text-xs space-y-1.5 text-muted-foreground list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar via PIX — chave aleatória</li>
            <li>Cole a chave acima e confira o valor: <strong className="text-foreground">{amountFormatted}</strong></li>
            <li>Após pagar, me chame no WhatsApp abaixo pra eu confirmar e liberar o acesso</li>
          </ol>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Olá Clodoaldo! Acabei de pagar via PIX o produto: ${product.name} (${amountFormatted}). Segue o comprovante em anexo. Pode confirmar recebimento?`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition"
          >
            <MessageCircle className="h-4 w-4" /> Enviar comprovante no WhatsApp
          </a>

          <button
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
