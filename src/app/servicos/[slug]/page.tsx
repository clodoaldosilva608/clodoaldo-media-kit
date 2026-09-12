import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight,
  HelpCircle, Shield, Sparkles,
} from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { SERVICES, type ServiceSlug } from "@/lib/services-catalog";
import { getServiceDetail } from "@/lib/service-details";
import { serializeSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES[slug as ServiceSlug];
  if (!service) return {};
  return {
    title: `${service.name} — Serviço | Clodoaldo Silva`,
    description: service.description,
    alternates: { canonical: `https://clodoaldo-media-kit.vercel.app/servicos/${slug}` },
    openGraph: {
      title: `${service.name} — Clodoaldo Silva`,
      description: service.description,
      url: `https://clodoaldo-media-kit.vercel.app/servicos/${slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = SERVICES[slug as ServiceSlug];
  if (!service) notFound();
  const detail = getServiceDetail(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "Person", name: "Clodoaldo Silva", url: "https://clodoaldo-media-kit.vercel.app" },
    areaServed: "BR",
    offers: { "@type": "Offer", price: service.priceCents / 100, priceCurrency: "BRL", availability: "https://schema.org/InStock" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(jsonLd) }} />
      <Header />
      <main className="mx-auto max-w-4xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <Link href="/#servicos" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowRight size={14} className="rotate-180" /> Voltar para serviços
        </Link>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{service.tag}</div>
        <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl leading-tight">{service.name}</h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">{service.description}</p>

        <div className="mt-8 rounded-3xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Investimento {service.priceCents > 0 ? "a partir de" : ""}</div>
            <div className="mt-1 font-display font-bold text-3xl sm:text-4xl">{service.priceLabel}</div>
            <p className="mt-2 text-xs text-muted-foreground max-w-md">
              {service.priceCents > 0 ? "Valor base. Variáveis como escopo ampliado, urgência ou número de revisões extras podem alterar o orçamento final — sempre alinhado antes de iniciar." : "Valor fixo."}
            </p>
          </div>
          <Link href={`/checkout/${service.slug}`} className="pulse-cta shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-4 min-h-12 text-sm sm:text-base font-bold text-primary-foreground shadow-glow">
            <Sparkles size={18} /> {service.ctaLabel}
          </Link>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <InfoCard icon={Clock} title="Prazo estimado" value={detail.estimatedDays} />
          <InfoCard icon={RefreshCw} title="Revisões inclusas" value={detail.revisions} />
        </div>

        <Section title="Problema que resolve">
          <p className="text-base text-foreground/90 leading-relaxed">{detail.problem}</p>
        </Section>
        <Section title="Para quem é indicado">
          <p className="text-base text-foreground/90 leading-relaxed">{detail.audience}</p>
        </Section>
        <Section title="O que está incluso">
          <ul className="space-y-2">
            {detail.deliverables.map((d, i) => (
              <li key={i} className="flex gap-3 text-sm sm:text-base text-foreground/90">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500 mt-0.5" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Section>
        {detail.notIncluded.length > 0 && (
          <Section title="O que NÃO está incluso">
            <ul className="space-y-2">
              {detail.notIncluded.map((d, i) => (
                <li key={i} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                  <XCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Precisa de algum item acima? Posso orçar separadamente — é só me chamar no WhatsApp.</p>
          </Section>
        )}
        <Section title="Como funciona a contratação">
          <ol className="space-y-3">
            {detail.hiringProcess.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-border bg-background/40 p-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                <div className="text-sm text-foreground/90 leading-relaxed pt-1">{step}</div>
              </li>
            ))}
          </ol>
        </Section>
        <Section title="Perguntas frequentes">
          <div className="space-y-3">
            {detail.faq.map((item, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card/60 overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer font-display font-semibold text-sm sm:text-base list-none">
                  <span className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-primary shrink-0" />
                    {item.q}
                  </span>
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </Section>
        <Section title="Política de cancelamento e reembolso">
          <div className="rounded-2xl border border-border bg-background/40 p-5 flex gap-3">
            <Shield size={20} className="shrink-0 text-primary mt-0.5" />
            <p className="text-sm text-foreground/90 leading-relaxed">{detail.refundPolicy}</p>
          </div>
        </Section>

        <div className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 text-center">
          <h2 className="font-display font-bold text-2xl">Pronto para começar?</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{service.bullets[0]}. Avance para o checkout — leva menos de 5 minutos.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={`/checkout/${service.slug}`} className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow">
              <Sparkles size={16} /> {service.ctaLabel}
            </Link>
            <a href={`https://wa.me/5581920051068?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20${encodeURIComponent(service.name)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3.5 min-h-11 text-sm font-semibold hover:border-primary/50">
              Tirar dúvidas no WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon size={14} /> {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display font-semibold text-xl sm:text-2xl mb-4">{title}</h2>
      {children}
    </section>
  );
}
