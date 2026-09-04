"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Sparkles, Mail, Lock, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // If already logged in, redirect to admin
  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Verify admin role
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (role) {
          router.replace(redirectTo);
        }
      }
      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Verify admin role after sign in
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (roleData) {
            router.replace(redirectTo);
          } else {
            setError("Esta conta não tem permissão de administrador.");
            await supabase.auth.signOut();
            setBusy(false);
          }
        }
      });
      unsub = sub.subscription;
    })();
    return () => {
      unsub?.unsubscribe();
    };
  }, [router, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        setError("Email ou senha incorretos.");
        setBusy(false);
        return;
      }
      // onAuthStateChange will handle redirect / role check
      setInfo("Verificando permissões…");
    } catch (err: any) {
      setError(err?.message || "Erro ao entrar");
      setBusy(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Digite seu email para receber o link de acesso.");
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (magicError) {
        setError(magicError.message);
        setBusy(false);
        return;
      }
      setInfo("Link mágico enviado! Verifique seu email para acessar o painel.");
      setBusy(false);
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar link");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 shadow-xl shadow-emerald-500/30 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Clodoaldo <span className="text-emerald-400">Admin</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Painel administrativo — acesso restrito</p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin" />
                <span>{info}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
                </>
              ) : (
                <>Entrar</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">ou</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Magic link */}
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={busy}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] transition disabled:opacity-50"
          >
            ✨ Enviar link mágico por email
          </button>

          {/* Help text */}
          <p className="mt-5 text-center text-[11px] text-zinc-500 leading-relaxed">
            Acesso exclusivo para administradores autorizados.<br />
            Não tem conta?{" "}
            <a
              href="mailto:clodoaldosilva608@gmail.com?subject=Solicitar acesso admin"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Solicite acesso
            </a>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
