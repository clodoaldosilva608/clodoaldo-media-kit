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
    // Verifica se Cal.com está configurado (endpoint público, sem auth)
    fetch("/api/public/calendar")
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

        {/* Cal.com embed + WhatsApp button (ambos sempre visíveis) */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : calcomUrl ? (
          <div className="space-y-4">
            {/* Cal.com embed */}
            <div className="rounded-2xl border border-zinc-200 overflow-hidden dark:border-zinc-800">
              <iframe
                src={calcomUrl}
                className="w-full"
                style={{ height: "600px", border: "none" }}
                title="Agendamento — Clodoaldo Silva"
              />
            </div>

            {/* Botão WhatsApp (sempre visível abaixo do Cal.com) */}
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
                  <h3 className="font-bold text-foreground">Prefere agendar pelo WhatsApp?</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mande seus horários disponíveis e eu confirmo em minutos.
                  </p>
                </div>
                <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
              </div>
            </a>
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
