import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { createKnowledgeCheckout } from "@/lib/knowledge.functions";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  knowledgeSlug: string;
  title: string;
  priceCents: number;
  currency: string;
  autoTrigger?: boolean;
}

export function PaywallCard({ knowledgeSlug, title, priceCents, currency, autoTrigger }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const checkout = useServerFn(createKnowledgeCheckout);
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const price = (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  async function buy() {
    if (loading) return;
    if (!session) {
      const redirect = `${location.pathname}?buy=1`;
      void navigate({ to: "/auth", search: { redirect } });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await checkout({
        data: { knowledge_slug: knowledgeSlug },
      });
      if (res.url) window.location.href = res.url;
      else throw new Error("Checkout indisponível");
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      const lower = message.toLowerCase();
      if (lower.includes("unauthorized") || lower.includes("authorization")) {
        setErr("Sua sessão expirou. Entre novamente para continuar.");
      } else if (lower.includes("stripe") && lower.includes("configured")) {
        setErr("Pagamentos indisponíveis no momento. Tente novamente em instantes.");
      } else if (lower.includes("503")) {
        setErr("Pagamentos temporariamente indisponíveis. Tente novamente em instantes.");
      } else if (lower.includes("gratuito")) {
        setErr("Este conteúdo é gratuito — recarregue a página para acessar.");
      } else if (lower.includes("já") || lower.includes("existing")) {
        setErr("Este item já está liberado na sua conta. Atualize a página.");
      } else {
        setErr("Falha ao iniciar o checkout. Tente novamente.");
      }
      setBusy(false);
    }
  }


  // Auto-trigger checkout after login redirect (?buy=1).
  useEffect(() => {
    if (!autoTrigger) return;
    if (loading || !session) return;
    void buy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTrigger, loading, session]);

  return (
    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/5 to-primary/15 p-6 sm:p-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
        <Lock size={14} /> Conteúdo premium
      </div>
      <h3 className="mt-4 font-display text-xl sm:text-2xl font-bold text-foreground">
        Desbloqueie {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
        Acesse todos os capítulos, checklists, prompts e templates. Compra única — acesso vitalício ao conteúdo.
      </p>
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="text-3xl font-display font-medium text-foreground">{price}</div>
        <button
          onClick={buy}
          disabled={busy || loading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-orange px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-50"
        >
          <Sparkles size={16} />
          {busy ? "Redirecionando..." : session ? "Desbloquear agora" : "Entrar e desbloquear"}
        </button>
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
    </div>
  );
}
