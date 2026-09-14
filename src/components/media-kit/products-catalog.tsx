"use client";

import { useEffect, useState } from "react";
import { MessageCircle, QrCode, Loader2, Copy, Check, ChevronRight, ChevronLeft, Building2, ArrowLeft } from "lucide-react";

/**
 * Products Catalog — Seção da landing page que mostra os 9 produtos
 * do método Gabriel Miranda, com botão "Pagar com PIX" e "Falar no WhatsApp".
 *
 * Modal PIX tem 2 passos:
 *   1. Lista de bancos disponíveis (cards clicáveis)
 *   2. Chave PIX do banco escolhido + valor + botão copiar + comprovante WhatsApp
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

interface PixKey {
  id: string;
  label: string;
  type: string;
  typeLabel: string;
  value: string;
  bank: string | null;
  merchantName: string;
  merchantCity: string;
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

// Emoji por banco (fallback pra bancos não identificados)
const BANK_EMOJIS: Record<string, string> = {
  "nubank": "💜",
  "c6": "🏛️",
  "c6 bank": "🏛️",
  "itau": "🟠",
  "itáu": "🟠",
  "bradesco": "🔴",
  "santander": "🔴",
  "bb": "🟡",
  "banco do brasil": "🟡",
  "caixa": "🔵",
  "inter": "🟠",
  "ninter": "🟠",
  "banco inter": "🟠",
  "mercadopago": "🟡",
  "mercado pago": "🟡",
  "mercadolivre": "🟡",
  "picpay": "🟢",
  "pagseguro": "🟠",
  "stone": "🟢",
  "safra": "🔵",
  "original": "🔵",
  "xpinvestimentos": "⚫",
};

function getBankEmoji(bank: string | null): string {
  if (!bank) return "🏦";
  const key = bank.toLowerCase().trim();
  return BANK_EMOJIS[key] || "🏦";
}

/**
 * Mapeamento de imagens extras por produto (whatsapp_sku → array de paths das imagens extras).
 * Cada produto do catálogo tem uma imagem principal (do banco) + N imagens extras
 * de marketing/mockup que aparecem como galeria clicável.
 */
const EXTRA_PRODUCT_IMAGES: Record<string, string[]> = {
  "site-profissional": [
    "/assets/produtos/novas/site-profissional.jpg",
    "/assets/produtos/novas/site-profissional-v2.jpg",
    "/assets/produtos/novas/site-profissional-v3.jpg",
    "/assets/produtos/novas/site-profissional-v4.jpg",
  ],
  "seo-local": [
    "/assets/produtos/novas/seo-local.jpg",
    "/assets/produtos/novas/seo-local-v2.jpg",
  ],
  "google-meu-negocio": [
    "/assets/produtos/novas/google-meu-negocio.jpg",
    "/assets/produtos/novas/google-meu-negocio-v2.jpg",
    "/assets/produtos/novas/google-meu-negocio-v3.jpg",
    "/assets/produtos/novas/google-meu-negocio-v4.jpg",
  ],
  "integracao-whatsapp": [
    "/assets/produtos/novas/integracao-whatsapp.jpg",
    "/assets/produtos/novas/integracao-whatsapp-v2.jpg",
  ],
  "cardapio-digital-qr": [
    "/assets/produtos/novas/cardapio-digital-qr.jpg",
  ],
  "edicao-cardapio": [
    "/assets/produtos/novas/edicao-cardapio.jpg",
  ],
  "artes-redes-sociais": [
    "/assets/produtos/novas/artes-redes-sociais.jpg",
  ],
  "pacote-recorrencia-mensal": [
    "/assets/produtos/novas/pacote-recorrencia-mensal.jpg",
  ],
  "produtos-digitais-sob-medida": [
    "/assets/produtos/novas/produtos-digitais-sob-medida.jpg",
  ],
};

export function ProductsCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pixModal, setPixModal] = useState<Product | null>(null);

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

      {/* PIX Modal (2 passos) */}
      {pixModal && (
        <PixModal product={pixModal} onClose={() => setPixModal(null)} />
      )}
    </section>
  );
}

function ProductCard({ product, onPix, whatsappLink }: { product: Product; onPix: () => void; whatsappLink: string }) {
  // Galeria de imagens: imagem principal do produto (do banco) + imagens extras (do mapeamento)
  const extraImages = EXTRA_PRODUCT_IMAGES[product.whatsapp_sku || ""] || [];
  const images = [product.image_path, ...extraImages].filter(Boolean) as string[];
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-primary/40 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {/* Image gallery */}
      {images.length > 0 && (
        <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
          <img
            src={images[currentImage]}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
          {/* Gallery controls — só aparecem se tem mais de 1 imagem */}
          {images.length > 1 && (
            <>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); setCurrentImage(i); }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentImage
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Ver imagem ${i + 1}`}
                  />
                ))}
              </div>
              {/* Navigation arrows */}
              <button
                onClick={(e) => { e.preventDefault(); setCurrentImage((prev) => (prev - 1 + images.length) % images.length); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentImage((prev) => (prev + 1) % images.length); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Counter badge */}
              <div className="absolute top-2 right-2 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                {currentImage + 1}/{images.length}
              </div>
            </>
          )}
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
            onClick={() => { if (typeof window !== "undefined" && (window as any).trackEvent) (window as any).trackEvent("initiate_checkout", { offer_slug: product.whatsapp_sku }); onPix(); }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
          >
            <QrCode className="h-4 w-4" /> Pagar com PIX
          </button>
          <a
            onClick={() => { if (typeof window !== "undefined" && (window as any).trackEvent) (window as any).trackEvent("whatsapp_click", { offer_slug: product.whatsapp_sku }); }} href={whatsappLink}
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

function PixModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [step, setStep] = useState<"choose-bank" | "show-key">("choose-bank");
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedKey, setSelectedKey] = useState<PixKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [asaasConfigured, setAsaasConfigured] = useState(false);
  const [asaasLoading, setAsaasLoading] = useState(false);
  const [asaasPayment, setAsaasPayment] = useState<any>(null);

  const amount = product.price_cents / 100;
  const amountFormatted = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    fetch("/api/public/pix-keys")
      .then(r => r.json())
      .then(d => {
        setPixKeys(d.keys || []);
        setLoadingKeys(false);
      })
      .catch(() => setLoadingKeys(false));

    // Verifica se Asaas está configurado (endpoint público, sem auth)
    fetch("/api/public/payment-config")
      .then(r => r.json())
      .then(d => setAsaasConfigured(d.asaas_configured || false))
      .catch(() => {});
  }, []);

  function chooseBank(key: PixKey) {
    setSelectedKey(key);
    setStep("show-key");
    setCopied(false);
  }

  function copyPixKey() {
    if (!selectedKey) return;
    navigator.clipboard.writeText(selectedKey.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function payWithAsaas() {
    setAsaasLoading(true);
    try {
      const resp = await fetch("/api/public/asaas-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_sku: product.whatsapp_sku,
          customer_name: "Cliente Site",
          customer_email: "cliente@exemplo.com",
          customer_cpf: "11144477735",
        }),
      });
      const json = await resp.json();
      if (json.pix_copy_paste || json.payment_link || json.pix_qr_code) {
        setAsaasPayment(json);
      } else if (json.error) {
        setAsaasPayment({ error: json.error });
      } else {
        setAsaasPayment({ error: "Erro desconhecido ao gerar PIX" });
      }
    } catch (e: any) {
      setAsaasPayment({ error: e.message });
    }
    setAsaasLoading(false);
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">💰 Pagamento via PIX</h3>
              <p className="text-xs opacity-90 mt-1">{product.name}</p>
              <div className="text-2xl font-bold mt-2">{amountFormatted}</div>
            </div>
            {step === "show-key" && (
              <button
                onClick={() => setStep("choose-bank")}
                className="rounded-lg bg-white/20 px-3 py-2 text-xs font-bold hover:bg-white/30 transition"
                title="Voltar pra lista de bancos"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Body — Passo 1: Escolher banco */}
        {step === "choose-bank" && (
          <div className="p-5">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Passo 1 de 2
              </div>
              <div className="font-bold text-base">Escolha o banco pra pagar</div>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione o banco onde você vai fazer o PIX. Cada banco tem uma chave diferente.
              </p>
            </div>

            {/* Asaas PIX automático (se configurado) */}
            {asaasConfigured && !asaasPayment && (
              <button
                onClick={payWithAsaas}
                disabled={asaasLoading}
                className="flex items-center gap-3 w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-left transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl">⚡</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-emerald-300">PIX Automático (Asaas)</div>
                  <div className="text-[11px] text-muted-foreground">QR Code + Copia e Cola — confirmação automática</div>
                </div>
                {asaasLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
              </button>
            )}

            {/* Asaas payment result */}
            {asaasPayment && (
              <div className="space-y-3">
                {asaasPayment.error ? (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    ⚠ {asaasPayment.error}
                  </div>
                ) : (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">✅ PIX gerado — {asaasPayment.value ? 'R$ ' + asaasPayment.value : amountFormatted}</div>
                  {asaasPayment.pix_copy_paste && (
                    <>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 mt-2">PIX Copia e Cola</div>
                      <div className="font-mono text-[10px] break-all rounded bg-black/20 p-2">{asaasPayment.pix_copy_paste}</div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(asaasPayment.pix_copy_paste); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      >
                        {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                      </button>
                    </>
                  )}
                  {asaasPayment.pix_qr_code && (
                    <img src={asaasPayment.pix_qr_code} alt="QR Code PIX" className="mx-auto mt-2 rounded-lg" width={200} height={200} />
                  )}
                  {asaasPayment.payment_link && (
                    <a href={asaasPayment.payment_link} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs font-bold text-emerald-600 underline">
                      Abrir página de pagamento →
                    </a>
                  )}
                  <div className="mt-2 text-[10px] text-emerald-300">
                    💡 Pagamento confirmado automaticamente. Você receberá email de confirmação.
                  </div>
                </div>
                )}
                <button onClick={() => setAsaasPayment(null)} className="text-xs text-muted-foreground hover:text-foreground">← Voltar pra lista de bancos</button>
              </div>
            )}

            {loadingKeys ? (
              <div className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-2">Carregando bancos…</p>
              </div>
            ) : pixKeys.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Nenhuma chave PIX configurada. Por favor, fale comigo no WhatsApp pra combinar pagamento.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {pixKeys.map((key) => (
                  <button
                    key={key.id}
                    onClick={() => chooseBank(key)}
                    className="flex items-center gap-3 w-full rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-emerald-500/40 hover:bg-emerald-500/5 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xl">
                      {getBankEmoji(key.bank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">
                        {key.bank || key.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {key.typeLabel}: <code className="font-mono">{maskKey(key.value, key.type)}</code>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {pixKeys.length > 0 && (
              <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] p-3 text-[11px] text-blue-600 dark:text-blue-300">
                💡 <strong>Dica:</strong> você pode pagar de qualquer banco, não precisa ter conta no banco que escolher. As chaves são diferentes apenas pra organização.
              </div>
            )}
          </div>
        )}

        {/* Body — Passo 2: Chave PIX do banco escolhido */}
        {step === "show-key" && selectedKey && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
                {getBankEmoji(selectedKey.bank)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm">{selectedKey.bank || selectedKey.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  Tipo: {selectedKey.typeLabel} · {selectedKey.merchantName} · {selectedKey.merchantCity}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Chave PIX ({selectedKey.typeLabel})
              </div>
              <div className="font-mono text-xs break-all">{selectedKey.value}</div>
              <button
                onClick={copyPixKey}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                {copied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar chave</>}
              </button>
            </div>

            <ol className="text-xs space-y-1.5 text-muted-foreground list-decimal list-inside">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar via PIX — <strong className="text-foreground">{selectedKey.typeLabel}</strong></li>
              <li>Cole a chave acima e confira o valor: <strong className="text-foreground">{amountFormatted}</strong></li>
              <li>Após pagar, me chame no WhatsApp abaixo pra eu confirmar e liberar o acesso</li>
            </ol>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Olá Clodoaldo! Acabei de pagar via PIX o produto: ${product.name} (${amountFormatted}). Banco escolhido: ${selectedKey.bank || selectedKey.label}. Segue o comprovante em anexo. Pode confirmar recebimento?`)}`}
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
        )}
      </div>
    </div>
  );
}

/** Mascara chave PIX parcial (ex: 6cf7994f-57e3-...-d6) — mostra só início e fim */
function maskKey(value: string, type: string): string {
  if (!value) return "";
  // Pra brcode (PIX Copia e Cola), mostra só primeiros 20 chars
  if (type === "brcode") return value.slice(0, 20) + "…";
  if (value.length <= 12) return value;
  // Pra email, mostra início@fim
  if (type === "email" && value.includes("@")) {
    const [user, domain] = value.split("@");
    return user.slice(0, 3) + "…@" + domain;
  }
  // Pra phone, CPF, aleatória — mostra primeiros 4 + últimos 4
  return value.slice(0, 4) + "…" + value.slice(-4);
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
