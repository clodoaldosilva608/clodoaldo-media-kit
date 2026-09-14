"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QUIZ_QUESTIONS } from "@/components/quiz/quiz-config";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Lock, Mail, Phone, User, Clock, AlertCircle } from "lucide-react";

type Step = "intro" | "questions" | "lead" | "result";

interface OfferDetail {
  slug: string;
  name?: string;
  price_label?: string;
  description?: string;
  cta_label?: string;
  cta_href?: string;
  audience?: string;
  deliverables?: string[];
  category?: string;
  // Campos opcionais pedidos pelo brief (Passo 4)
  exclusions?: string[];        // "O que NÃO está incluído"
  indicative_timeline?: string; // "Prazo indicativo"
  bonus?: string[];             // "Bônus"
}

interface QuizResult {
  result_id: string | null;
  lead_id: string | null;
  profile_key: string;
  profile_label: string;
  primary_offer: { slug: string; name: string; reasons: { question: string; answer: string; weight: number; priority: number }[] };
  secondary_offer: { slug: string; name: string } | null;
  score_breakdown: { ranked: { slug: string; score: number; maxPriority: number }[] };
}

export function QuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("intro");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [computing, setComputing] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [offers, setOffers] = useState<Record<string, OfferDetail>>({});
  const [lead, setLead] = useState({ name: "", email: "", phone: "", consent: true });
  const [error, setError] = useState<string | null>(null);

  // UTM params
  const utm = {
    source: searchParams.get("utm_source") || undefined,
    medium: searchParams.get("utm_medium") || undefined,
    campaign: searchParams.get("utm_campaign") || undefined,
  };
  const affiliateSlug = searchParams.get("ref");

  // Load all offers for the result screen
  useEffect(() => {
    fetch("/api/admin/data?type=offers&limit=50", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, OfferDetail> = {};
        (d.data || []).forEach((o: any) => {
          map[o.slug] = o;
        });
        setOffers(map);
      })
      .catch(() => {});
  }, []);

  // Start quiz: create session
  const startQuiz = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const resp = await fetch("/api/quiz/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...utm }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro ao iniciar quiz");
      setSessionId(data.sessionId);
      setStep("questions");
      // Track PageView-style event
      if (typeof window !== "undefined" && (window as any).trackEvent) {
        (window as any).trackEvent("Lead", { content_name: "quiz_started" });
      }
    } catch (e: any) {
      setError(e.message || "Erro ao iniciar quiz");
    } finally {
      setSaving(false);
    }
  }, [utm]);

  // Save answer and advance
  const selectAnswer = useCallback(
    async (questionId: string, answerValue: string, answerLabel: string) => {
      if (!sessionId) return;
      setSaving(true);
      setError(null);
      setAnswers((a) => ({ ...a, [questionId]: answerValue }));

      // Save to DB (fire and forget on advance, but await for safety)
      try {
        await fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            question_id: questionId,
            answer_value: answerValue,
            answer_label: answerLabel,
          }),
        });
      } catch (e) {
        // ignore — we still want to advance
      }

      setSaving(false);

      // Advance or go to lead capture
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setStep("lead");
      }
    },
    [sessionId, currentQuestion],
  );

  // Go back
  const goBack = useCallback(() => {
    if (step === "lead") {
      setStep("questions");
      setCurrentQuestion(QUIZ_QUESTIONS.length - 1);
    } else if (step === "questions" && currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
    } else if (step === "questions" && currentQuestion === 0) {
      setStep("intro");
    }
  }, [step, currentQuestion]);

  // Submit lead + compute result
  const submitLead = useCallback(async () => {
    if (!sessionId) return;
    if (!lead.name.trim() || !lead.email.trim()) {
      setError("Preencha pelo menos nome e email");
      return;
    }
    setComputing(true);
    setError(null);
    try {
      const resp = await fetch("/api/quiz/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          answers,
          lead: {
            name: lead.name.trim(),
            email: lead.email.trim().toLowerCase(),
            phone: lead.phone.trim() || undefined,
            consent_contact: lead.consent,
            preferred_channel: "email",
          },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro ao computar resultado");
      setResult(data);
      setStep("result");
      // Track Purchase-like conversion event
      if (typeof window !== "undefined" && (window as any).trackEvent) {
        (window as any).trackEvent("CompleteRegistration", {
          content_name: "quiz_completed",
          value: 0,
          currency: "BRL",
        });
      }
    } catch (e: any) {
      setError(e.message || "Erro ao computar resultado");
    } finally {
      setComputing(false);
    }
  }, [sessionId, answers, lead]);

  // === Render ===

  if (step === "intro") {
    return <IntroScreen onStart={startQuiz} saving={saving} error={error} />;
  }

  if (step === "questions") {
    const q = QUIZ_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
    return (
      <QuizShell progress={progress} onBack={goBack} currentStep={currentQuestion + 1} totalSteps={QUIZ_QUESTIONS.length}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{q.emoji}</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{q.title}</h1>
          {q.subtitle && <p className="mt-2 text-sm text-zinc-400">{q.subtitle}</p>}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.options.map((opt) => {
            const isSelected = answers[q.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectAnswer(q.id, opt.value, opt.label)}
                disabled={saving}
                className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                  isSelected
                    ? "border-emerald-500/50 bg-emerald-500/15 text-white shadow-lg shadow-emerald-500/10"
                    : "border-white/8 bg-white/[0.03] text-zinc-200 hover:border-emerald-500/30 hover:bg-white/[0.06]"
                } ${saving ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
              >
                <span className="text-2xl shrink-0">{opt.emoji}</span>
                <span className="flex-1 text-sm font-medium leading-tight">{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
        {saving && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Salvando resposta…
          </div>
        )}
        {error && <div className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300">{error}</div>}
      </QuizShell>
    );
  }

  if (step === "lead") {
    const progress = 100;
    return (
      <QuizShell progress={progress} onBack={goBack} currentStep={QUIZ_QUESTIONS.length + 1} totalSteps={QUIZ_QUESTIONS.length + 1}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Veja seu resultado</h1>
          <p className="mt-2 text-sm text-zinc-400">Precisamos do seu contato para liberar as ofertas recomendadas + bônus</p>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              required
              placeholder="Nome completo *"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="email"
              required
              placeholder="Email *"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="tel"
              placeholder="WhatsApp (opcional)"
              value={lead.phone}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <label className="flex items-start gap-2 px-1 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={lead.consent}
              onChange={(e) => setLead({ ...lead, consent: e.target.checked })}
              className="mt-0.5 h-3.5 w-3.5 accent-emerald-500"
            />
            <span>Aceito receber dicas, novidades e ofertas do Clodoaldo Silva. Não compartilho meus dados com terceiros.</span>
          </label>
        </div>
        {error && <div className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300">{error}</div>}
        <button
          onClick={submitLead}
          disabled={computing}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
        >
          {computing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analisando suas respostas…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Ver meu resultado
            </>
          )}
        </button>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Dados seguros
          </span>
          <span>•</span>
          <span>Sem cartão de crédito</span>
          <span>•</span>
          <span>Cancele quando quiser</span>
        </div>
      </QuizShell>
    );
  }

  if (step === "result" && result) {
    return <ResultScreen result={result} offers={offers} affiliateSlug={affiliateSlug} onRetake={() => router.push("/quiz")} />;
  }

  return null;
}

function QuizShell({
  children,
  progress,
  onBack,
  currentStep,
  totalSteps,
}: {
  children: React.ReactNode;
  progress: number;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </button>
            <span className="text-xs font-semibold text-zinc-400">
              {currentStep} <span className="text-zinc-600">/</span> {totalSteps}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">{children}</main>
    </div>
  );
}

function IntroScreen({ onStart, saving, error }: { onStart: () => void; saving: boolean; error: string | null }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="mb-3 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
          Quiz gratuito · 2 minutos
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Descubra o melhor caminho para o seu crescimento
        </h1>
        <p className="mt-4 text-base text-zinc-400 leading-relaxed">
          Responda 5 perguntas rápidas e receba uma recomendação personalizada com base no seu momento, objetivos e orçamento. No final, você recebe:
        </p>
        <div className="mt-6 grid gap-2 text-left text-sm">
          {[
            { icon: "🎯", text: "Sua oferta ideal (entre 14 disponíveis)" },
            { icon: "🎁", text: "Bônus exclusivos para seu perfil" },
            { icon: "📊", text: "Plano de ação para os próximos 30 dias" },
            { icon: "💬", text: "Acesso direto ao Clodoaldo via WhatsApp" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
              <span className="text-xl">{b.icon}</span>
              <span className="text-zinc-200">{b.text}</span>
              <Check className="ml-auto h-4 w-4 text-emerald-400" />
            </div>
          ))}
        </div>
        <button
          onClick={onStart}
          disabled={saving}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-base font-bold text-emerald-950 shadow-xl shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando…
            </>
          ) : (
            <>
              Começar agora <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
        <p className="mt-4 text-[11px] text-zinc-500">
          🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
        </p>
        {error && <div className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300">{error}</div>}
      </div>
    </div>
  );
}

function ResultScreen({
  result,
  offers,
  affiliateSlug,
  onRetake,
}: {
  result: QuizResult;
  offers: Record<string, OfferDetail>;
  affiliateSlug: string | null;
  onRetake: () => void;
}) {
  const primary = offers[result.primary_offer.slug] || { slug: result.primary_offer.slug, name: result.primary_offer.name };
  const secondary = result.secondary_offer ? offers[result.secondary_offer.slug] : null;
  const primaryHref = appendAffiliate(sanitizeCtaHref(primary.cta_href, primary.slug), affiliateSlug);
  const secondaryHref = secondary ? appendAffiliate(sanitizeCtaHref(secondary.cta_href, secondary.slug), affiliateSlug) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950">
            <Check className="h-7 w-7" />
          </div>
          <div className="mb-2 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            {result.profile_label}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Sua recomendação está pronta 🎉</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Baseado nas suas respostas, esta é a melhor oferta para o seu momento.
          </p>
        </div>

        {/* Primary offer */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.02] p-6 sm:p-8 mb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Oferta recomendada</div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">{primary.name}</h2>
              {primary.price_label && (
                <div className="mt-2 text-lg font-bold text-emerald-300">{primary.price_label}</div>
              )}
            </div>
            <div className="shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
              ★ Top match
            </div>
          </div>

          {primary.description && <p className="text-sm text-zinc-300 leading-relaxed mb-4">{primary.description}</p>}

          {primary.deliverables && primary.deliverables.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">O que você recebe</div>
              <div className="grid gap-1.5">
                {primary.deliverables.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {primary.audience && (
            <div className="mb-5 rounded-xl bg-white/[0.03] p-3 text-xs text-zinc-400">
              <strong className="text-zinc-300">Ideal para:</strong> {primary.audience}
            </div>
          )}

          {/* Prazo indicativo — Passo 4 do brief */}
          {primary.indicative_timeline && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
              <Clock className="h-5 w-5 shrink-0 text-amber-400" />
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Prazo indicativo</div>
                <div className="text-xs text-amber-200/90 mt-0.5">{primary.indicative_timeline}</div>
              </div>
            </div>
          )}

          {/* Bônus — Passo 4 do brief */}
          {primary.bonus && primary.bonus.length > 0 && (
            <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                <Sparkles className="h-3.5 w-3.5" /> Bônus inclusos
              </div>
              <div className="grid gap-1">
                {primary.bonus.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-violet-200/90">
                    <span className="shrink-0 text-violet-400">+</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* O que NÃO está incluído — Passo 4 do brief (transparência) */}
          {primary.exclusions && primary.exclusions.length > 0 && (
            <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                <AlertCircle className="h-3.5 w-3.5" /> O que NÃO está incluído
              </div>
              <div className="grid gap-1">
                {primary.exclusions.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-rose-200/80">
                    <span className="shrink-0 text-rose-400">−</span>
                    {e}
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-rose-500/10 text-[10px] text-rose-300/60 italic">
                Transparência total: se precisar de algum desses, me chama pra conversar.
              </div>
            </div>
          )}

          <a
            href={primaryHref}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-base font-bold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-emerald-500"
          >
            {primary.cta_label || "Quero este"} <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Secondary offer */}
        {secondary && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6 mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">Também recomendado</div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">{secondary.name}</h3>
                {secondary.price_label && (
                  <div className="mt-1 text-sm font-semibold text-emerald-300">{secondary.price_label}</div>
                )}
                {secondary.description && (
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">{secondary.description}</p>
                )}
              </div>
              <a
                href={secondaryHref}
                className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
              >
                Ver →
              </a>
            </div>
          </div>
        )}

        {/* Other options */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6 mb-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Quer ver todas as opções?</h3>
          <p className="mb-4 text-xs text-zinc-400">
            Acesse o catálogo completo de serviços, e-books e apps do ecossistema Clodoaldo Silva.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/#servicos"
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/5"
            >
              Serviços
            </Link>
            <Link
              href="/biblioteca"
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/5"
            >
              Biblioteca
            </Link>
            <Link
              href="/apps"
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/5"
            >
              Apps
            </Link>
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6 mb-6">
          <h3 className="mb-4 text-sm font-semibold text-white">O que acontece agora?</h3>
          <div className="space-y-3">
            {[
              { n: 1, t: "Você recebeu sua recomendação", done: true },
              { n: 2, t: "Clique na oferta recomendada para garantir sua vaga", done: false },
              { n: 3, t: "O Clodoaldo entra em contato pelo email/WhatsApp", done: false },
              { n: 4, t: "Você recebe o material + bônus em até 24h após pagamento", done: false },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    s.done ? "bg-emerald-500 text-emerald-950" : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {s.done ? <Check className="h-3.5 w-3.5" /> : s.n}
                </span>
                <span className={s.done ? "text-zinc-300" : "text-zinc-200"}>{s.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={onRetake} className="text-xs font-medium text-zinc-500 hover:text-zinc-300">
            ↻ Refazer quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function appendAffiliate(href: string, slug: string | null): string {
  if (!slug) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}ref=${encodeURIComponent(slug)}`;
}

/**
 * Sanitizes the cta_href from the offers table to ensure it never points to
 * a non-existent route. Known-bad patterns are replaced with safe fallbacks.
 *
 * - /briefing?oferta=X  → /#contato (briefing page doesn't exist)
 * - /fila/X             → /checkout/X (queue disabled, direct checkout)
 * - empty/undefined     → /checkout/{slug} as fallback
 */
function sanitizeCtaHref(href: string | undefined | null, slug: string): string {
  if (!href || typeof href !== "string" || href.trim() === "") {
    return `/checkout/${slug}`;
  }
  // Replace /briefing?oferta=X with /#contato
  if (href.startsWith("/briefing")) {
    return "/#contato";
  }
  // Replace /fila/X with /checkout/X
  if (href.startsWith("/fila/")) {
    return href.replace("/fila/", "/checkout/");
  }
  return href;
}
