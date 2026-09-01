"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import {
  GHOST_SERVICES,
  PARTNERSHIP_SERVICES,
  requiresQueue,
  type Service,
} from "@/lib/services-catalog";
import { SectionHeader } from "./metrics";

export function Services() {
  return (
    <section id="servicos" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="03"
          eyebrow="Serviços"
          title="Soluções para campanhas e escala digital"
          subtitle="Da parceria com aparição aos formatos Ghost Services, cada solução foi pensada para transformar atenção em resultado comercial."
        />

        <ServiceGroup
          title="Parcerias com aparição"
          description="Formatos com presença do Clodoaldo na campanha para gerar autoridade, alcance e conversão."
          services={PARTNERSHIP_SERVICES}
        />

        <ServiceGroup
          title="Ghost Services"
          description="Produtos mais acessíveis, rápidos e escaláveis para quem quer direção estratégica sem depender da aparição direta."
          services={GHOST_SERVICES}
        />
      </div>
    </section>
  );
}

function ServiceGroup({
  title,
  description,
  services,
}: {
  title: string;
  description: string;
  services: Service[];
}) {
  return (
    <div className="mt-14 first:mt-14">
      <div className="mb-6 max-w-2xl">
        <h3 className="font-display text-2xl sm:text-3xl font-black">{title}</h3>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">{description}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <article
      ref={ref}
      className={`reveal group relative rounded-3xl border bg-card/60 backdrop-blur overflow-hidden shadow-card hover:-translate-y-1 transition-all duration-300 ${
        service.highlight
          ? "border-primary/60 hover:border-primary"
          : "border-border hover:border-primary/50"
      }`}
    >
      {service.highlight && (
        <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
          <Sparkles size={11} /> Mais escolhido
        </div>
      )}
      <div className="aspect-[16/9] overflow-hidden bg-card relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.cover}
          alt={`Capa do serviço ${service.shortName}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent pointer-events-none" />
      </div>
      <div className="p-6 sm:p-7">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          {service.tag}
        </div>
        <h3 className="mt-1.5 font-display font-medium text-xl sm:text-2xl">
          {service.shortName}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {service.description}
        </p>
        <ul className="mt-4 space-y-1.5">
          {service.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
              <Check size={14} className="text-primary mt-1 shrink-0" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3 pt-5 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground">A partir de</div>
            <div className="font-display font-medium text-2xl text-gradient-orange leading-none">
              {service.priceLabel}
            </div>
          </div>
          <Link
            href={requiresQueue(service.slug) ? `/fila/${service.slug}` : `/checkout/${service.slug}`}
            className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition"
            aria-label={`${requiresQueue(service.slug) ? "Verificar disponibilidade" : service.ctaLabel} — ${service.shortName}`}
          >
            {requiresQueue(service.slug) ? "Verificar disponibilidade" : service.ctaLabel}
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
