"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/knowledge";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push(redirect);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push(redirect);
      }
    });
    unsub = sub.subscription;
    return () => {
      unsub?.unsubscribe();
    };
  }, [router, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: name || undefined },
          },
        });
        if (error) throw error;
        setMsg("Conta criada. Se o e-mail exigir confirmação, verifique sua caixa de entrada.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha na autenticação");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 backdrop-blur p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {mode === "signin" ? "Entrar na Knowledge Hub" : "Criar sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Acesse sua biblioteca premium."
              : "Comece a acompanhar seu progresso, notas e favoritos."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="voce@exemplo.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            {err && <p className="text-sm text-red-500">{err}</p>}
            {msg && <p className="text-sm text-emerald-500">{msg}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-gradient-orange px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-50"
            >
              {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Não tem conta?{" "}
                <button className="text-primary underline" onClick={() => setMode("signup")}>
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button className="text-primary underline" onClick={() => setMode("signin")}>
                  Entrar
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
