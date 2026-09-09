"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";

const NAV = [
  { href: "/#metricas", label: "Métricas" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/knowledge", label: "Knowledge Hub" },
  { href: "/apps", label: "Apps" },
  { href: "/#cases", label: "Cases" },
  { href: "/sobre", label: "Sobre" },
  { href: "/faq", label: "FAQ" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "header-blur"
          : "header-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Página inicial"
        >
          <Logo className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain" />
          <span className="hidden sm:block font-display text-xs sm:text-sm tracking-tight">
            Clodoaldo <span className="text-primary">Silva</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-6" aria-label="Principal">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Primary CTA — visible on all sizes (mobile-first) */}
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center rounded-full bg-gradient-orange px-3.5 sm:px-4 py-2 min-h-10 sm:min-h-11 text-[11px] sm:text-xs font-bold text-primary-foreground shadow-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sm:hidden">Quiz</span>
            <span className="hidden sm:inline">Fazer o quiz</span>
          </Link>
          <Link
            href="/biblioteca"
            className="hidden md:inline-flex items-center justify-center px-4 py-2.5 min-h-11 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            E-books
          </Link>
          <a
            href="/#servicos"
            className="hidden lg:inline-flex items-center justify-center rounded-full border border-primary/60 px-5 py-2.5 min-h-11 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Contratar
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="xl:hidden inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu-panel xl:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <nav className="px-4 sm:px-5 py-4 flex flex-col gap-0" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="mobile-nav-link py-3 min-h-12 text-base font-medium text-foreground/90 border-b border-border/40 last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link
                href="/biblioteca"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 min-h-12 text-sm font-semibold"
              >
                Ver Biblioteca
              </Link>
              <a
                href="/#servicos"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-primary/60 px-5 py-3 min-h-12 text-sm font-semibold sm:col-span-2"
              >
                Adquirir Serviços
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
