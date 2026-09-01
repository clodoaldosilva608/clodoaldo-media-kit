import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Loader2, LogIn, Users } from "lucide-react";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";
import { getService } from "@/lib/services-catalog";
import { joinServiceQueue, type QueueStatus } from "@/lib/queue.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/fila/$service")({
  head: ({ params }) => {
    const service = getService(params.service);
    const title = service
      ? `Fila de espera — ${service.shortName} | Clodoaldo Silva`
      : "Fila de espera | Clodoaldo Silva";
    const description =
      "Reserve sua posição na fila de produção e siga para o checkout quando estiver pronto.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: QueuePage,
});

function QueuePage() {
  const { service: slug } = Route.useParams();
  const service = getService(slug);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const join = useServerFn(joinServiceQueue);

  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const reserve = useCallback(async () => {
    setJoining(true);
    setError(null);
    try {
      const result = await join({ data: { service: slug } });
      setStatus(result);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Não foi possível verificar a disponibilidade agora. Tente novamente.",
      );
    } finally {
      setJoining(false);
    }
  }, [join, slug]);

  useEffect(() => {
    if (!authLoading && user && !status && !joining && !error) void reserve();
  }, [authLoading, user, status, joining, error, reserve]);

  if (!service) {
    return (
      <Shell>
        <h1 className="font-display font-medium text-3xl">Serviço não encontrado</h1>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft size={16} /> Voltar
        </Link>
      </Shell>
    );
  }

  const monthLabel = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Shell>
      <Link
        to="/"
        hash="servicos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar para os serviços
      </Link>

      <div className="mt-6 rounded-3xl border border-border bg-card/70 backdrop-blur shadow-card overflow-hidden">
        <div className="aspect-[16/6] overflow-hidden bg-card">
          <img
            src={service.cover}
            alt={`Capa do serviço ${service.shortName}`}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            Disponibilidade
          </div>
          <h1 className="mt-2 font-display font-medium text-2xl sm:text-3xl">
            Fila de espera — {service.shortName}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            A produção é limitada por mês para manter o padrão de entrega. Reserve sua
            posição e siga para o checkout para confirmar a vaga.
          </p>

          {authLoading && (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} /> Verificando sua sessão...
            </div>
          )}

          {!authLoading && !user && (
            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="font-display font-medium text-lg">
                Entre para reservar sua posição
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A fila é pessoal: precisamos identificar você para guardar seu número e
                liberar o checkout na sequência correta.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/auth",
                    search: { redirect: `/fila/${slug}` } as never,
                  })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                <LogIn size={16} /> Entrar e reservar
              </button>
            </div>
          )}

          {!authLoading && user && (joining || (!status && !error)) && (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} /> Verificando disponibilidade...
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/10 p-6">
              <p className="text-sm">{error}</p>
              <button
                type="button"
                onClick={() => void reserve()}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2.5 min-h-10 text-sm font-semibold"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {status && !error && (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-border bg-background/40 p-6 sm:p-8 text-center">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Sua posição na fila
                </div>
                <div className="mt-3 font-display font-medium text-6xl text-gradient-orange leading-none">
                  #{status.position}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {status.availableNow
                    ? `Há vaga disponível para ${monthLabel}. Conclua o checkout para garantir sua produção neste ciclo.`
                    : `As vagas de ${monthLabel} estão preenchidas. Sua produção entra no próximo ciclo disponível.`}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<Users size={16} />}
                  label="Ocupação do mês"
                  value={`${Math.min(status.taken, status.monthlySlots)} de ${status.monthlySlots} vagas`}
                />
                <InfoCard
                  icon={<CalendarClock size={16} />}
                  label="Início estimado"
                  value={estimateStart(status)}
                />
              </div>

              <Link
                to="/checkout/$service"
                params={{ service: service.slug }}
                search={{ queue: status.queueId } as never}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-orange px-6 py-4 min-h-12 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow"
              >
                Continuar para o checkout <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                Sua posição fica reservada — você pode voltar a esta página quando quiser.
              </p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function estimateStart(status: QueueStatus) {
  const cyclesAhead = Math.ceil(status.position / Math.max(status.monthlySlots, 1)) - 1;
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + cyclesAhead);
  const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return cyclesAhead === 0 ? `${label} (ciclo atual)` : label;
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        {icon} {label}
      </div>
      <div className="mt-2 font-display font-medium text-lg">{value}</div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
