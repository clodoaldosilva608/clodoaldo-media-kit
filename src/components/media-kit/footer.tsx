"use client";

import Link from "next/link";
import { Instagram, Mail, MessageCircle, Youtube } from "lucide-react";
import { Logo } from "./logo";

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur mt-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 object-contain" loading="lazy" />
            <div>
              <div className="font-display text-sm">
                Clodoaldo <span className="text-primary">Silva</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Estratégia · Conteúdo · Resultados
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Plataforma comercial com parcerias, Ghost Services e produtos digitais para transformar autoridade em faturamento.
          </p>
        </div>

        <nav aria-label="Navegação">
          <div className="eyebrow mb-5">Explorar</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Início</Link></li>
            <li><Link href="/biblioteca" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Biblioteca Digital</Link></li>
            <li><Link href="/knowledge" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Knowledge Hub</Link></li>
            <li><Link href="/apps" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Ecossistema de Apps</Link></li>
            <li><a href="/#servicos" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Serviços</a></li>
            <li><a href="/#cases" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Cases</a></li>
            <li><Link href="/sobre" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Sobre</Link></li>
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <div className="eyebrow mb-5">Institucional</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">FAQ</Link></li>
            <li><Link href="/termos" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Termos de Serviço</Link></li>
            <li><Link href="/privacidade" className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Política de Privacidade</Link></li>
          </ul>
        </nav>

        <div>
          <div className="eyebrow mb-5">Contato</div>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="mailto:clodoaldosilva608@gmail.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded break-all">
                <Mail size={14} /> clodoaldosilva608@gmail.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/qr/AGB4UOBZXOSAE1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/clodoaldo_c_silva" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Instagram size={14} /> @clodoaldo_c_silva
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/@clodoald_c_silva" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <TikTokIcon /> @clodoald_c_silva
              </a>
            </li>
            <li>
              <a href="https://youtube.com/@clodoaldosilvaa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Youtube size={14} /> @clodoaldosilvaa
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Clodoaldo Silva. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
