"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie-consent-v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin")) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, at: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Cookies e privacidade</h4>
            <p className="mt-1 text-xs text-zinc-400">
              Usamos cookies essenciais para o funcionamento do site e, com sua autorização, tecnologias de analytics e marketing para melhorar sua experiência.
              Seus dados de compra nunca são compartilhados com anunciantes.{" "}
              <Link href="/privacidade" className="text-emerald-400 hover:text-emerald-300">
                Saiba mais
              </Link>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={accept}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                Aceitar
              </button>
              <button
                onClick={decline}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/5"
              >
                Recusar
              </button>
            </div>
          </div>
          <button
            onClick={decline}
            className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            aria-label="Recusar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
