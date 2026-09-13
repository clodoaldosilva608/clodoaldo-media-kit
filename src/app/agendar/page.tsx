"use client";

import { useEffect, useState } from "react";
import {
  Calendar, Clock, CheckCircle2, Loader2, MessageCircle, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const WHATSAPP_PHONE = "5581920051068";

/**
 * Página de agendamento (/agendar)
 *
 * 3 opções de agendamento:
 * 1. Cal.com embed (se configurado — URL do evento)
 * 2. Google Calendar link (cria evento diretamente)
 * 3. WhatsApp direto (combina horário manualmente)
 *
 * Configuração Cal.com:
 * - Criar conta grátis em https://cal.com
 * - Criar evento "Consultoria - 30min"
 * - Pegar URL do evento: https://cal.com/clodoaldo-silva/consultoria
 * - Configurar CALCOM_EVENT_URL no Vercel
 */
export default function AgendarPage() {
  const [calcomUrl, setCalcomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se Cal.com está configurado
    fetch("/api/admin/calendar")
      .then(r => r.json())
      .then(d => {
        setCalcomUrl(d.calcom_url || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <Link href="/" className="text-sm font-bold text-primary">Clodoaldo Silva</Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium mb-2">
            Agende sua consultoria
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            30 minutos por WhatsApp ou videochamada. Sem compromisso, sem custo.
            Vamos analisar seu funil e definir os próximos passos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-xs font-bold">30 min</div>
            <div className="text-[10px] text-muted-foreground">duração</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-xs font-bold">R$ 0</div>
            <div className="text-[10px] text-muted-foreground">gratuito</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <MessageCircle className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-xs font-bold">WhatsApp</div>
            <div className="text-[10px] text-muted-foreground">ou video</div>
          </div>
        </div>

        {/* Cal.com embed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : calcomUrl ? (
          <div className="rounded-2xl border border-zinc-200 overflow-hidden dark:border-zinc-800">
            <iframe
              src={calcomUrl}
              className="w-full"
              style={{ height: "600px", border: "none" }}
              title="Agendamento — Clodoaldo Silva"
            />
          </div>
        ) : (
          <>
            {/* Cal.com não configurado — mostra alternativas */}
            <div className="space-y-4">
              {/* Opção 1: WhatsApp direto */}
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Olá Clodoaldo! Quero agendar uma consultoria. Tenho disponibilidade nos seguintes horários:")}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 transition hover:bg-emerald-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                    <MessageCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Agendar pelo WhatsApp</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mande seus horários disponíveis e eu confirmo em minutos.
                      Mais rápido e flexível.
                    </p>
                  </div>
                  <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                </div>
              </a>

              {/* Opção 2: Google Calendar */}
              <a
                href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZaaZSZv2f1KQbQ3g5kqVdRP8X8gE2mN0oJaG3Jq4H9vqJ5lP4zT3rL2sK6nV5xW8yA1bC4dE7fG0hI3jK6mN9oP2qR5sT8uV1wX4yZ0aB3cD6eF9gH2iJ5kL8mN1oP4qR7sT0uV3wX6yZ9aB2cD5eF8gH1iJ4kL7mN0oP3qR6sT9uV2wX5yZ8aB1cD4eF7gH0iJ3kL6mN9oP2qR5sT8uV1wX4yZ"
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-blue-500/40 bg-blue-500/10 p-6 transition hover:bg-blue-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Google Calendar</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Escolha um horário diretamente na minha agenda do Google.
                      Confirmação automática.
                    </p>
                  </div>
                  <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                </div>
              </a>

              {/* Setup Cal.com (instruções pra mim mesmo) */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
                <h3 className="text-sm font-bold text-amber-300 mb-2">💡 Configurar Cal.com (opcional)</h3>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Crie conta grátis em <a href="https://cal.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">cal.com</a></li>
                  <li>Crie evento "Consultoria — 30min"</li>
                  <li>Conecte seu Google Calendar</li>
                  <li>Pegue a URL do evento (ex: cal.com/clodoaldo/consultoria)</li>
                  <li>Configure env var <code className="rounded bg-black/20 px-1">CALCOM_EVENT_URL</code> no Vercel</li>
                  <li>Recarregue esta página — o embed aparece automaticamente</li>
                </ol>
              </div>
            </div>
          </>
        )}

        {/* What to expect */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-display text-base font-medium mb-4">O que esperar da consultoria</h3>
          <ul className="space-y-3">
            {[
              "Análise do seu funil atual (onde o lead entra, onde morre)",
              "Identificação dos gargalos de conversão",
              "Plano de ação personalizado para seu negócio",
              "Dicas de SEO local e Google Meu Negócio",
              "Sem venda agressiva — você decide se faz sentido",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
