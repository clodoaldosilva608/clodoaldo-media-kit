import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Heart,
  ShieldCheck,
  ExternalLink,
  Trophy,
  Award,
  Star,
} from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import {
  FUNDING_TIERS,
  getApp,
  STATUS_LABEL,
  MONETIZATION_LABEL,
  type FundingTierId,
} from "@/lib/apps-catalog";
import { createFundingSession } from "@/lib/funding.functions";
import { listPublicSupporters } from "@/lib/supporters.functions";

const SITE_URL = "https://clodoaldo-silva.lovable.app";

export const Route = createFileRoute("/apoiar/$app")({
  head: ({ params }) => {
    const app = getApp(params.app);
    const title = app
      ? `Apoie ${app.name} e seja um Criador Parceiro | Clodoaldo Silva`
      : "Apoiar app | Clodoaldo Silva";
    const description = app
      ? `Construa o futuro conosco. Apoie o desenvolvimento de ${app.name} — ${app.tagline} — e tenha seu nome eternizado no Roll dos Criadores Parceiros.`
      : "Vaquinha de apoio ao desenvolvimento dos aplicativos do Clodoaldo Silva.";
    const url = `${SITE_URL}/apoiar/${params.app}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(app ? [{ property: "og:image", content: `${SITE_URL}${app.coverUrl}` }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: SupportPage,
});

function SupportPage() {
  const { app: slug } = Route.useParams();
  const app = getApp(slug);
  const navigate = useNavigate();
  const create = useServerFn(createFundingSession);
  const fetchSupporters = useServerFn(listPublicSupporters);

  const [tierId, setTierId] = useState<FundingTierId>("colaborador");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [publicDisplay, setPublicDisplay] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTier = FUNDING_TIERS.find((t) => t.id === tierId)!;

  useEffect(() => {
    setCustomAmount(String((selectedTier.defaultCents / 100).toFixed(2)));
  }, [tierId, selectedTier.defaultCents]);

  const supportersQ = useQuery({
    queryKey: ["supporters", slug],
    queryFn: () => fetchSupporters({ data: { app_slug: slug } }),
    enabled: Boolean(app),
    staleTime: 60_000,
  });

  if (!app) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-32 pb-20">
          <h1 className="font-display font-medium text-3xl">App não encontrado</h1>
          <Link to="/apps" className="mt-4 inline-flex items-center gap-2 text-primary">
            <ArrowLeft size={16} /> Ver todos os apps
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pct = Math.min(
    100,
    Math.round((app.fundingRaisedCents / app.fundingGoalCents) * 100),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const parsed = Number.parseFloat(customAmount.replace(",", "."));
      const amount_cents = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined;

      // Validação de faixa client-side (o server também valida/clampa).
      if (amount_cents !== undefined) {
        if (amount_cents < selectedTier.minCents) {
          setError(
            `Valor mínimo para o nível ${selectedTier.label} é R$ ${(selectedTier.minCents / 100).toFixed(2)}`,
          );
          setSubmitting(false);
          return;
        }
      }

      const result = await create({
        data: {
          app_slug: app.slug,
          tier_id: tierId,
          amount_cents,
          supporter_name: name,
          supporter_email: email,
          supporter_message: message || undefined,
          public_display: publicDisplay,
          
        },
      });
      if (result.url) {
        window.location.href = result.url;
      } else {
        navigate({ to: "/apoiar/$app", params: { app: app.slug } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar apoio");
      setSubmitting(false);
    }
  };

  const rolls = supportersQ.data ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20">
        <Link
          to="/apps"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Voltar para os apps
        </Link>

        {/* Hero */}
        <div className="mt-6 rounded-3xl border border-border bg-card/70 backdrop-blur shadow-card overflow-hidden">
          <div className={`relative aspect-[16/8] sm:aspect-[16/6] overflow-hidden bg-gradient-to-br ${app.gradient}`}>
            <img
              src={app.coverUrl}
              alt={`Capa de ${app.name}`}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {app.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background/60 border border-border px-2 py-0.5 rounded-full">
                {STATUS_LABEL[app.status]}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background/60 border border-border px-2 py-0.5 rounded-full">
                {MONETIZATION_LABEL[app.monetization]}
              </span>
            </div>
            <h1 className="mt-2 font-display font-medium text-2xl sm:text-4xl leading-tight">
              Construa o Futuro Conosco: Apoie {app.name} e Seja um Criador Parceiro
            </h1>
            <p className="mt-2 text-primary font-semibold text-sm sm:text-base">{app.tagline}</p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {app.description}
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Sua paixão por tecnologia e inovação pode transformar ideias em realidade. Cada
              contribuição acelera o desenvolvimento, aprimora funcionalidades e nos aproxima do
              lançamento oficial — e faz de você parte da história do app.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={app.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-3 min-h-11 text-sm font-semibold hover:border-primary/50"
              >
                Ver demo ao vivo <ExternalLink size={14} />
              </a>
              <span className="text-xs text-muted-foreground">
                Preço planejado: <span className="font-semibold text-foreground">{app.priceLabel}</span>
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background/40 p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Vaquinha do desenvolvimento</span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div
                className="h-3 rounded-full bg-background/60 overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full bg-gradient-orange" style={{ width: `${pct}%` }} aria-hidden="true" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>
                  <span className="font-bold text-foreground">
                    R$ {(app.fundingRaisedCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>{" "}
                  arrecadados
                </span>
                <span>
                  Meta: R${" "}
                  {(app.fundingGoalCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {rolls.length} {rolls.length === 1 ? "apoiador" : "apoiadores"} públicos até agora
              </div>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <section className="mt-10">
          <h2 className="font-display font-medium text-2xl sm:text-3xl">Escolha seu nível de apoio</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Todos os níveis incluem seu nome no <strong>Roll dos Criadores Parceiros</strong>.
            Pagamento seguro via Stripe.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {FUNDING_TIERS.map((tier) => {
              const selected = tierId === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setTierId(tier.id)}
                  aria-pressed={selected}
                  className={`text-left rounded-3xl border p-5 transition ${
                    selected
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border bg-card/60 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <TierIcon id={tier.id} />
                        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {tier.label}
                        </div>
                      </div>
                      <div className="mt-1 font-display text-2xl font-black text-gradient-orange">
                        {tier.priceLabel}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{tier.headline}</div>
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {selected && <Check size={14} />}
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Check size={14} className="text-primary mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-border bg-card/60 p-6 sm:p-8 space-y-5"
        >
          <h2 className="font-display font-medium text-xl">Seus dados</h2>

          <div>
            <label htmlFor="sAmount" className="block text-sm font-medium mb-1.5">
              Valor da contribuição (R$) — faixa {selectedTier.priceLabel}
            </label>
            <input
              id="sAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={selectedTier.minCents / 100}
              max={selectedTier.maxCents ? selectedTier.maxCents / 100 : undefined}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Você pode contribuir com um valor dentro da faixa do nível selecionado.
            </p>
          </div>

          <div>
            <label htmlFor="sName" className="block text-sm font-medium mb-1.5">
              Nome (como aparecerá no Roll) *
            </label>
            <input
              id="sName"
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="sEmail" className="block text-sm font-medium mb-1.5">
              E-mail *
            </label>
            <input
              id="sEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="sMsg" className="block text-sm font-medium mb-1.5">
              Mensagem pública (opcional)
            </label>
            <textarea
              id="sMsg"
              rows={3}
              maxLength={240}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Uma frase de apoio para o projeto"
              className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/40 p-4 text-sm">
            <input
              type="checkbox"
              checked={publicDisplay}
              onChange={(e) => setPublicDisplay(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-muted-foreground">
              Quero aparecer no Roll público de Criadores Parceiros.
            </span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              <Heart size={16} /> {submitting ? "Processando..." : "Apoiar agora"}
            </button>
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} /> Pagamento seguro via Stripe
            </span>
          </div>
        </form>

        {/* Roll embutido */}
        <section className="mt-12">
          <h2 className="font-display font-medium text-2xl">Já apoiaram este projeto</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reconhecimento público aos Criadores Parceiros deste app.
          </p>
          <div className="mt-5">
            {rolls.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background/30 p-8 text-center text-sm text-muted-foreground">
                Seja o primeiro a apoiar {app.name} e ter seu nome eternizado no Roll.
              </div>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {rolls.slice(0, 12).map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border border-border bg-card/60 p-3 flex items-center gap-3"
                  >
                    <TierIcon id={s.tier_id as FundingTierId} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{s.supporter_name}</div>
                      {s.supporter_message && (
                        <div className="text-xs text-muted-foreground truncate">
                          “{s.supporter_message}”
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-6">
            <Link
              to="/criadores-parceiros"
              search={{ app: app.slug }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-3 min-h-11 text-sm font-semibold hover:border-primary/50"
            >
              Ver Roll completo
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function TierIcon({ id }: { id: FundingTierId }) {
  const map: Record<FundingTierId, React.ReactNode> = {
    apoiador: <Heart size={16} className="text-primary" aria-hidden />,
    colaborador: <Star size={16} className="text-primary" aria-hidden />,
    "co-criador": <Award size={16} className="text-primary" aria-hidden />,
    visionario: <Trophy size={16} className="text-primary" aria-hidden />,
  };
  return <span className="inline-flex">{map[id]}</span>;
}
