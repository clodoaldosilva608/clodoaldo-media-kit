import { Youtube, Play, ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SectionHeader } from "./metrics";

export const YOUTUBE_URL = "https://youtube.com/@clodoaldosilvaa";
export const YOUTUBE_HANDLE = "@clodoaldosilvaa";

export function YouTubeSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="youtube" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="07"
          eyebrow="Canal no YouTube"
          title="Acompanhe bastidores e estratégias em vídeo"
          subtitle="Conteúdos longos, análises e bastidores da rotina de criação. Inscreva-se para não perder nenhum lançamento."
        />

        <div
          ref={ref}
          className="reveal mt-12 grid gap-6 lg:grid-cols-5 items-stretch"
        >
          <div className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#FF0000]/15 via-card/70 to-card/40 p-8 sm:p-10 shadow-card">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#FF0000]/25 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-glow">
                <Youtube size={28} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-2xl sm:text-3xl font-black leading-tight">
                Clodoaldo Silva no YouTube
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Vídeos sobre estratégia de conteúdo, posicionamento, performance e bastidores reais de quem vive de criar. Toda semana novos episódios.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF0000] px-6 py-3.5 min-h-11 text-sm font-semibold text-white shadow-glow hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition"
                  aria-label="Inscrever-se no canal do YouTube"
                >
                  <Youtube size={18} aria-hidden="true" />
                  Inscrever-se no canal
                </a>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3.5 min-h-11 text-sm font-semibold hover:bg-card transition"
                >
                  <Play size={16} aria-hidden="true" />
                  Assistir agora
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8 shadow-card flex flex-col justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {YOUTUBE_HANDLE}
              </div>
              <h4 className="mt-2 font-display text-xl font-black leading-tight">
                O que você encontra no canal
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Estratégias detalhadas de conteúdo</li>
                <li>• Bastidores de campanhas reais</li>
                <li>• Análises de criadores e marcas</li>
                <li>• Tutoriais práticos para creators</li>
              </ul>
            </div>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FF0000]/40 bg-[#FF0000]/10 px-5 py-3 min-h-11 text-sm font-semibold text-foreground hover:bg-[#FF0000]/20 transition"
            >
              <Youtube size={16} aria-hidden="true" /> Seguir no YouTube
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
