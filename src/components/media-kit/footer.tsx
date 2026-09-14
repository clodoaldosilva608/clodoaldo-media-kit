"use client";

import Link from "next/link";
import { Instagram, Mail, MessageCircle, Youtube, Lock, Link2, ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

/**
 * Footer link — animação de hover com:
 * - Cor transicionando pra primary
 * - Seta ArrowUpRight que aparece deslizando da esquerda
 * - Underline animado que cresce da esquerda pra direita
 */
function FooterLink({
  href,
  children,
  external = false,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  icon?: React.ReactNode;
}) {
  const isExternal = external || href.startsWith("http");
  const LinkComponent = isExternal ? "a" : Link;
  const linkProps = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <li>
      <LinkComponent
        {...(linkProps as any)}
        className="footer-link group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {icon && (
          <span className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 text-primary/70 group-hover:text-primary">
            {icon}
          </span>
        )}
        <span className="relative">
          {children}
          {/* Underline animado: w-0 no desktop (cresce no hover), w-full no mobile (sempre visível) */}
          <span className="absolute -bottom-0.5 left-0 h-px w-full max-w-0 bg-primary/40 transition-all duration-300 group-hover:max-w-full group-hover:bg-primary footer-underline-mobile" />
        </span>
        {/* Seta: oculta no desktop (aparece no hover), visível no mobile */}
        <ArrowUpRight
          size={12}
          className="shrink-0 text-primary/50 transition-all duration-200 footer-arrow-desktop group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary"
        />
      </LinkComponent>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur mt-8 sm:mt-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-12 grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9 sm:h-10 sm:w-10 object-contain" loading="lazy" />
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
          <ul className="space-y-2.5 text-sm">
            <FooterLink href="/">Início</FooterLink>
            <FooterLink href="/quiz">Quiz de Recomendação</FooterLink>
            <FooterLink href="/biblioteca">Biblioteca Digital</FooterLink>
            <FooterLink href="/knowledge">Knowledge Hub</FooterLink>
            <FooterLink href="/apps">Ecossistema de Apps</FooterLink>
            <FooterLink href="/#servicos">Serviços</FooterLink>
            <FooterLink href="/#cases">Cases</FooterLink>
            <FooterLink href="/sobre">Sobre</FooterLink>
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <div className="eyebrow mb-5">Institucional</div>
          <ul className="space-y-2.5 text-sm">
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/termos">Termos de Serviço</FooterLink>
            <FooterLink href="/privacidade">Política de Privacidade</FooterLink>
            <li>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-muted-foreground/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded text-xs transition-colors duration-200"
                title="Acesso restrito ao painel administrativo"
              >
                <Lock size={11} /> Admin
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <div className="eyebrow mb-5">Contato</div>
          <ul className="space-y-2.5 text-sm">
            <FooterLink href="mailto:clodoaldosilva608@gmail.com" external icon={<Mail size={14} />}>
              <span className="break-all">clodoaldosilva608@gmail.com</span>
            </FooterLink>
            <FooterLink
              href="https://wa.me/5581920051068?text=Ol%C3%A1!%20Vim%20do%20site%20do%20Clodoaldo%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es."
              external
              icon={<MessageCircle size={14} />}
            >
              WhatsApp
            </FooterLink>
            <FooterLink
              href="https://www.instagram.com/clodoaldo_c_silva"
              external
              icon={<Instagram size={14} />}
            >
              @clodoaldo_c_silva
            </FooterLink>
            <FooterLink
              href="https://www.tiktok.com/@clodoald_c_silva"
              external
              icon={<TikTokIcon size={14} />}
            >
              @clodoald_c_silva
            </FooterLink>
            <FooterLink
              href="https://youtube.com/@clodoaldosilvaa"
              external
              icon={<Youtube size={14} />}
            >
              @clodoaldosilvaa
            </FooterLink>
            <FooterLink
              href="https://bio.site/clodoadosilva"
              external
              icon={<Link2 size={14} />}
            >
              Site de Biografia
            </FooterLink>
            <FooterLink
              href="https://linktr.ee/clodoaldo608"
              external
              icon={<Link2 size={14} />}
            >
              Linktree
            </FooterLink>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 text-center">
          <p className="text-sm font-display font-bold text-foreground leading-tight">
            Transformando ideias em resultados reais desde 2016.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © Clodoaldo Silva. Todos Os Direitos Reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
