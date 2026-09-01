"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Gift, ShoppingCart } from "lucide-react";
import {
  getService,
  requiresQueue,
  SERVICES,
  type ServiceSlug,
} from "@/lib/services-catalog";

interface CheckoutClientProps {
  slug: string;
  queueId?: string;
}

type Step = "questions" | "upsell" | "review" | "contact";

export function CheckoutClient({ slug, queueId }: CheckoutClientProps) {
  const router = useRouter();
  const service = getService(slug);

  const [step, setStep] = useState<Step>("questions");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [addons, setAddons] = useState<ServiceSlug[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsell = service?.upsell ? SERVICES[service.upsell] : null;

  const total = useMemo(() => {
    if (!service) return 0;
    const addonsTotal = addons.reduce(
      (sum, s) => sum + (SERVICES[s]?.priceCents ?? 0),
      0,
    );
    return service.priceCents + addonsTotal;
  }, [service, addons]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-32 pb-20 flex-1">
          <h1 className="font-display font-medium text-3xl">Item não encontrado</h1>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-primary">
            <ArrowLeft size={16} /> Voltar
          </Link>
        </main>
      </div>
    );
  }

  // Se exige fila e não tem queueId, redireciona
  if (requiresQueue(service.slug) && !queueId) {
    if (typeof window !== "undefined") {
      router.replace(`/fila/${service.slug}`);
    }
    return null;
  }

  const validateQuestions = () => {
    for (const q of service.questions) {
      if (q.required && !answers[q.name]?.trim()) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service.slug,
          addons,
          answers,
          customer_email: email,
          customer_name: name,
          queue_id: queueId,
        }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Erro ao processar");
      if (result.url) {
        window.location.href = result.url;
      } else {
        router.push(`/checkout/sucesso?order=${result.orderId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar");
      setSubmitting(false);
    }
  };

  const showQuestions = service.questions.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft size={16} /> Voltar para o site
        </Link>

        <div className="mt-6 rounded-3xl border border-border bg-card/70 backdrop-blur shadow-card overflow-hidden">
          <div className="aspect-[16/6] overflow-hidden bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.cover}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              {service.tag}
            </div>
            <h1 className="mt-2 font-display font-medium text-2xl sm:text-3xl">
              {service.shortName}
            </h1>
            <div className="mt-2 font-display font-medium text-2xl text-gradient-orange">
              {service.priceLabel}
            </div>

            <StepIndicator step={step} hasQuestions={showQuestions} />

            {step === "questions" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!showQuestions || validateQuestions()) {
                    setStep(upsell ? "upsell" : "review");
                  }
                }}
                className="mt-6 space-y-5"
              >
                <h2 className="font-display font-medium text-lg">
                  {showQuestions ? "Conte sobre seu projeto" : "Resumo rápido"}
                </h2>
                {showQuestions ? (
                  service.questions.map((q) => (
                    <div key={q.name}>
                      <label htmlFor={q.name} className="block text-sm font-medium mb-1.5">
                        {q.label}
                        {q.required && <span className="text-primary"> *</span>}
                      </label>
                      {q.type === "textarea" ? (
                        <textarea
                          id={q.name}
                          required={q.required}
                          placeholder={q.placeholder}
                          value={answers[q.name] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.name]: e.target.value }))}
                          rows={3}
                          className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      ) : q.type === "select" ? (
                        <select
                          id={q.name}
                          required={q.required}
                          value={answers[q.name] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.name]: e.target.value }))}
                          className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Selecione...</option>
                          {q.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={q.name}
                          type="text"
                          required={q.required}
                          placeholder={q.placeholder}
                          value={answers[q.name] ?? ""}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.name]: e.target.value }))}
                          className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted-foreground leading-relaxed">
                    Este item pode seguir direto para revisão e pagamento. Se quiser, você poderá complementar detalhes depois pelo e-mail ou WhatsApp.
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-orange px-6 py-3.5 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </form>
            )}

            {step === "upsell" && upsell && (
              <div className="mt-6 space-y-5">
                <h2 className="font-display font-medium text-lg">
                  {upsell.kind === "ebook"
                    ? "Leve também este material complementar"
                    : "Que tal amplificar sua campanha?"}
                </h2>
                <div className="rounded-2xl border border-border bg-background/40 p-5">
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={upsell.cover}
                      alt=""
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-primary">
                        {upsell.kind === "ebook" ? "Upsell digital" : "Add-on recomendado"}
                      </div>
                      <div className="font-display font-medium mt-1">{upsell.shortName}</div>
                      <p className="text-sm text-muted-foreground mt-1">{upsell.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-display font-medium text-gradient-orange">
                          + {upsell.priceLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddons((a) =>
                              a.includes(upsell.slug)
                                ? a.filter((s) => s !== upsell.slug)
                                : [...a, upsell.slug],
                            )
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 min-h-10 text-sm font-semibold border transition ${
                            addons.includes(upsell.slug)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {addons.includes(upsell.slug) ? (
                            <>
                              <Check size={14} /> Adicionado
                            </>
                          ) : (
                            "Adicionar"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("questions")}
                    className="flex-1 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold hover:bg-card"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground"
                  >
                    Continuar <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="mt-6 space-y-5">
                <h2 className="font-display font-medium text-lg">Revise seu pedido</h2>
                <div className="rounded-2xl border border-border divide-y divide-border">
                  <div className="flex justify-between gap-3 p-4">
                    <span className="text-sm">{service.shortName}</span>
                    <span className="text-sm font-semibold whitespace-nowrap">{service.priceLabel}</span>
                  </div>
                  {addons.map((s) => {
                    const a = SERVICES[s];
                    return (
                      <div key={s} className="flex justify-between gap-3 p-4">
                        <span className="text-sm">
                          {a.kind === "ebook" ? "E-book complementar" : "Add-on"}: {a.shortName}
                        </span>
                        <span className="text-sm font-semibold whitespace-nowrap">{a.priceLabel}</span>
                      </div>
                    );
                  })}
                  {service.bonusEbooks?.map((bonus) => (
                    <div key={bonus.title} className="flex items-start justify-between gap-3 p-4 bg-primary/5">
                      <div className="flex items-start gap-2">
                        <Gift size={16} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold">Bônus incluso: {bonus.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{bonus.description}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-primary whitespace-nowrap">
                        incluso
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between p-4 bg-card/60">
                    <span className="font-display font-medium">Total</span>
                    <span className="font-display font-medium text-gradient-orange text-xl whitespace-nowrap">
                      R$ {(total / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(upsell ? "upsell" : "questions")}
                    className="flex-1 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep("contact")}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground"
                  >
                    Ir para pagamento <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === "contact" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit();
                }}
                className="mt-6 space-y-5"
              >
                <h2 className="font-display font-medium text-lg">Seus dados</h2>
                <div>
                  <label htmlFor="cName" className="block text-sm font-medium mb-1.5">
                    Nome completo *
                  </label>
                  <input
                    id="cName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="cEmail" className="block text-sm font-medium mb-1.5">
                    E-mail *
                  </label>
                  <input
                    id="cEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                {service.scarcityLabel && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary font-medium">
                    {service.scarcityLabel}
                  </div>
                )}
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="flex-1 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {submitting ? "Processando..." : "Pagar com Kiwify"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Pagamento seguro processado pela Kiwify (PIX, cartão, boleto). Após a confirmação, você receberá o item contratado e eventuais bônus liberados automaticamente.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ step, hasQuestions }: { step: Step; hasQuestions: boolean }) {
  const steps: Step[] = ["questions", "upsell", "review", "contact"];
  const labels: Record<Step, string> = {
    questions: hasQuestions ? "Briefing" : "Resumo",
    upsell: "Upsell",
    review: "Revisão",
    contact: "Pagamento",
  };
  const idx = steps.indexOf(step);
  return (
    <div
      className="mt-6 flex items-center gap-2 overflow-x-auto"
      role="progressbar"
      aria-valuenow={idx + 1}
      aria-valuemin={1}
      aria-valuemax={4}
    >
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 shrink-0">
          <div
            className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${
              i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs ${i === idx ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
            {labels[s]}
          </span>
          {i < steps.length - 1 && <div className="w-4 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}
