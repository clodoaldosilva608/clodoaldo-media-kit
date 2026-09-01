"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Download, Instagram, Mail, Youtube } from "lucide-react";
import type { Service } from "@/lib/services-catalog";

const INSTAGRAM_URL = "https://www.instagram.com/clodoaldo_c_silva";
const YOUTUBE_URL = "https://youtube.com/@clodoaldosilvaa";

interface BibliotecaClientProps {
  item: Service;
}

export function BibliotecaClient({ item }: BibliotecaClientProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      // Chamada ao API route que insere o lead no Supabase (futuro).
      // Por enquanto, simula sucesso e libera o PDF.
      await new Promise((r) => setTimeout(r, 600));
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Não foi possível liberar o material.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus("idle");
          setError("");
        }}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
      >
        {item.ctaLabel}
        <ArrowRight size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-background/75 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Liberação do material</div>
                <h2 className="mt-2 font-display text-2xl font-black">{item.shortName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold"
              >
                Fechar
              </button>
            </div>

            {status === "done" ? (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="mt-4 font-display text-xl font-black">Acesso liberado</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Baixe o PDF agora e siga as redes para receber mais materiais, dicas e bastidores.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      <Download size={16} /> Baixar PDF agora
                    </a>
                  )}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <Instagram size={16} /> Seguir no Instagram
                  </a>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#FF0000]/40 bg-[#FF0000]/10 px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <Youtube size={16} /> Seguir no YouTube
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <BookOpen size={16} /> Continuar navegando
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preencha seus dados para liberar este material e entrar no ecossistema de conteúdos do Clodoaldo Silva.
                </p>
                <div>
                  <label htmlFor="lead-name" className="block text-sm font-medium mb-1.5">
                    Nome
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="lead-email" className="block text-sm font-medium mb-1.5">
                    E-mail *
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm"
                    placeholder="voce@email.com"
                  />
                </div>
                <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/40 p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className="text-muted-foreground">
                    Concordo em receber o material e comunicações relacionadas à Biblioteca Digital.
                  </span>
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!consent || status === "saving"}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-5 py-3 min-h-11 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                  >
                    <Mail size={16} /> {status === "saving" ? "Liberando..." : "Liberar material"}
                  </button>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 min-h-11 text-sm font-semibold"
                  >
                    <Instagram size={16} /> Seguir no Instagram
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
