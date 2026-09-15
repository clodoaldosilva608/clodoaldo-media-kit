import Link from "next/link";
import { Sparkles, ArrowRight, Gift, Clock, Target } from "lucide-react";

/**
 * Quiz CTA section — placed prominently on the homepage to drive quiz conversions.
 */
export function QuizCTASection() {
  return (
    <section className="relative overflow-hidden" id="quiz-cta">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-12 sm:py-16 md:py-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-5 sm:p-8 md:p-12 backdrop-blur-sm text-zinc-100">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                <Sparkles className="h-3 w-3" /> Quiz gratuito · 2 minutos
              </div>
              <h2 className="mt-3 sm:mt-4 font-display font-medium text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight">
                Não sabe por onde começar?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                Responda 5 perguntas rápidas e receba uma <strong className="text-white">recomendação personalizada</strong> com a oferta ideal para o seu momento — entre 14 serviços, e-books e apps disponíveis.
              </p>
              <ul className="mt-4 sm:mt-5 space-y-2 text-sm">
                {[
                  { icon: Target, text: "Oferta certa para seu objetivo e orçamento" },
                  { icon: Gift, text: "Bônus exclusivos liberados no resultado" },
                  { icon: Clock, text: "Apenas 2 minutos, sem cartão de crédito" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-300">
                    <item.icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="leading-tight">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/quiz"
                className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 sm:px-6 py-3 sm:py-3.5 min-h-12 text-xs sm:text-sm font-bold text-primary-foreground shadow-lg transition hover:scale-105"
              >
                Fazer o quiz agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: visual preview */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">2 / 5</span>
                </div>
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                </div>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-sm font-bold text-zinc-100">Qual seu maior objetivo?</div>
                </div>
                <div className="space-y-2">
                  {[
                    { emoji: "📣", label: "Divulgar minha marca", active: true },
                    { emoji: "💸", label: "Vender um produto" },
                    { emoji: "✨", label: "Melhorar meu conteúdo" },
                    { emoji: "🌐", label: "Criar um site/página" },
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                        opt.active
                          ? "border-emerald-500/50 bg-emerald-500/15 text-white"
                          : "border-white/5 bg-white/[0.03] text-zinc-300"
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span className="flex-1">{opt.label}</span>
                      {opt.active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-950 shadow-lg">
                +900 already did it
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
