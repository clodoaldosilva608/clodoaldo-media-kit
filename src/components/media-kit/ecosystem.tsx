"use client";

import Link from "next/link";
import { ArrowRight, AppWindow, Sparkles, Users } from "lucide-react";
import { APPS, APP_CATEGORIES, STATUS_LABEL } from "@/lib/apps-catalog";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";
import { AppsCarousel } from "@/components/apps/apps-carousel";

const FEATURED = APP_CATEGORIES
  .map((cat) => APPS.find((a) => a.category === cat && a.featured) ?? APPS.find((a) => a.category === cat))
  .filter((a): a is (typeof APPS)[number] => Boolean(a))
  .slice(0, 8);

export function Ecosystem() {
  const totalApps = APPS.length;
  const launched = APPS.filter((a) => a.status === "lancado").length;
  const inDev = APPS.filter((a) => a.status !== "lancado").length;

  return (
    <section id="ecossistema" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="05"
          eyebrow="Ecossistema de Produtos"
          title="Empreendedor Tech e criador de produtos"
          subtitle={`Clodoaldo Silva não é só criador de conteúdo — é desenvolvedor de ${totalApps} aplicativos em 8 categorias, de autoconhecimento a saúde farmacêutica.`}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard label="Apps no ecossistema" value={String(totalApps)} icon={<AppWindow className="text-primary" size={20} />} />
          <StatCard label="Já disponíveis" value={String(launched)} icon={<Sparkles className="text-primary" size={20} />} />
          <StatCard label="Em construção" value={String(inDev)} icon={<Users className="text-primary" size={20} />} />
        </div>

        <div className="mt-12">
          <AppsCarousel
            title="Vitrine de Destaques"
            subtitle="Capas premium do ecossistema — clique em qualquer app para ver a prévia."
          />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((app) => (
            <FeaturedCard key={app.slug} app={app} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Programa Criadores Parceiros</div>
              <h3 className="mt-2 font-display font-medium text-2xl sm:text-3xl leading-tight">
                Ajude a construir os próximos apps e tenha seu nome eternizado
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                4 níveis de apoio, do R$ 25 ao R$ 301+, com recompensas que vão de acesso vitalício
                Pro à mentoria 1:1 e influência no roadmap.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href="/criadores-parceiros"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Ver o Roll <ArrowRight size={14} />
              </Link>
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 min-h-11 text-sm font-semibold"
              >
                Explorar apps
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Ver todos os {totalApps} apps <ArrowRight size={16} />
          </Link>
          <Link
            href="/apps#categorias"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3.5 min-h-11 text-sm font-semibold"
          >
            Explorar {APP_CATEGORIES.length} categorias
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <div className="font-display text-3xl font-black text-gradient-orange">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function FeaturedCard({ app }: { app: (typeof APPS)[number] }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <article
      ref={ref}
      className="reveal group overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur shadow-card flex flex-col hover:border-primary/50 transition"
    >
      <Link
        href={`/apps#${app.slug}`}
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${app.gradient}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.coverUrl}
          alt={`Capa de ${app.name}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-foreground bg-background/70 border border-border px-2 py-0.5 rounded-full">
          {STATUS_LABEL[app.status]}
        </span>
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{app.category}</div>
        <h3 className="mt-1 font-display text-lg font-black leading-tight">{app.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed flex-1">{app.tagline}</p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/apoiar/${app.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-orange px-4 py-2.5 min-h-10 text-xs font-semibold text-primary-foreground"
          >
            Apoiar
          </Link>
          <Link
            href={`/apps#${app.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-border px-3 py-2.5 min-h-10 text-xs font-semibold"
          >
            Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
