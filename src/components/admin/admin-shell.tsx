"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  ShoppingCart,
  ListOrdered,
  Users,
  FileText,
  Tags,
  BarChart3,
  Ticket,
  MessageSquareQuote,
  Timer,
  Code2,
  MessageCircle,
  UserPlus,
  Mail,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Handshake,
  RotateCcw,
  Users2,
  ClipboardCheck,
  Activity,
  Coins,
  History,
  TrendingUp,
  Package,
  Phone,
  Mic,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  group: "overview" | "vendas" | "marketing" | "config";
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard, group: "overview" },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart, group: "vendas" },
  { href: "/admin/recuperacao", label: "Recuperação", icon: RotateCcw, group: "vendas" },
  { href: "/admin/leads-crm", label: "Leads CRM", icon: Users2, group: "vendas" },
  { href: "/admin/fluxo-atendimento", label: "Fluxo de Atendimento", icon: ListOrdered, group: "vendas" },
  { href: "/admin/voz", label: "Voz do Clodoaldo", icon: Mic, group: "vendas" },
  { href: "/admin/queue", label: "Fila de Espera", icon: ListOrdered, group: "vendas" },
  { href: "/admin/leads", label: "Leads", icon: Users, group: "vendas" },
  { href: "/admin/briefings", label: "Briefings", icon: FileText, group: "vendas" },
  { href: "/admin/offers", label: "Ofertas", icon: Tags, group: "vendas" },
  { href: "/admin/produtos", label: "Catálogo de Produtos", icon: Package, group: "vendas" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, group: "vendas" },
  { href: "/admin/vendas-semana", label: "Vendas da Semana", icon: TrendingUp, group: "vendas" },
  { href: "/admin/parceiros", label: "Parceiros", icon: Handshake, group: "marketing" },
  { href: "/admin/aprovacoes", label: "Portal de Aprovação", icon: ClipboardCheck, group: "marketing" },
  { href: "/admin/coupons", label: "Cupons", icon: Ticket, group: "marketing" },
  { href: "/admin/testimonials", label: "Depoimentos", icon: MessageSquareQuote, group: "marketing" },
  { href: "/admin/countdown", label: "Contagem Regressiva", icon: Timer, group: "marketing" },
  { href: "/admin/pixels", label: "Pixels & Ads", icon: Code2, group: "marketing" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle, group: "marketing" },
  { href: "/admin/whatsapp-setup", label: "WA Business Setup", icon: Phone, group: "marketing" },
  { href: "/admin/affiliates", label: "Afiliados", icon: UserPlus, group: "marketing" },
  { href: "/admin/email", label: "E-mail Marketing", icon: Mail, group: "marketing" },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard, group: "marketing" },
  { href: "/admin/notifications", label: "Notificações", icon: Bell, group: "config" },
  { href: "/admin/settings", label: "Configurações", icon: Settings, group: "config" },
  { href: "/admin/health", label: "Saúde Operacional", icon: Activity, group: "config" },
  { href: "/admin/financeiro", label: "Reconciliação", icon: Coins, group: "config" },
  { href: "/admin/auditoria", label: "Logs de Auditoria", icon: History, group: "config" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  overview: "Visão Geral",
  vendas: "Vendas & Clientes",
  marketing: "Marketing & Conversão",
  config: "Sistema",
};

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login?redirect=/admin");
        return;
      }
      const u = data.session.user;
      if (!active) return;
      setUser({ email: u.email, name: (u.user_metadata?.name as string) || u.email });

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!!role);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!synced) return;
    const t = setTimeout(() => setSynced(true), 5000);
    return () => clearTimeout(t);
  }, [synced]);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm">Verificando permissões…</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-rose-500/30 bg-rose-950/30 p-8 text-center">
          <h1 className="text-xl font-bold text-rose-200">Acesso negado</h1>
          <p className="mt-2 text-sm text-rose-300/80">
            Sua conta não tem permissão de administrador. Solicite acesso ao titular do projeto.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-500/30"
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  const grouped = (["overview", "vendas", "marketing", "config"] as NavItem["group"][]).map((g) => ({
    group: g,
    items: NAV.filter((n) => n.group === g),
  }));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0d0d14] lg:flex lg:flex-col">
        <SidebarContent
          pathname={pathname}
          grouped={grouped}
          user={user}
          onLogout={async () => {
            await supabase.auth.signOut();
            router.replace("/");
          }}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/5 bg-[#0d0d14] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-zinc-400 hover:bg-white/5"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              grouped={grouped}
              user={user}
              onLogout={async () => {
                await supabase.auth.signOut();
                router.replace("/");
              }}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-[#0a0a0f]/95 px-4 py-3 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-base font-semibold tracking-tight text-white lg:text-lg">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 sm:flex">
              <span className={`h-1.5 w-1.5 rounded-full ${synced ? "bg-emerald-400" : "bg-amber-400"} ${synced ? "" : "animate-pulse"}`} />
              {synced ? "Sincronizado" : "Sincronizando…"}
            </div>
            <div className="hidden text-[11px] font-medium text-zinc-400 md:block">
              {now?.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </div>
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5 sm:flex"
            >
              Ver site <ExternalLink className="h-3 w-3" />
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 py-1 pl-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[11px] font-bold text-emerald-950">
                {(user?.name || user?.email || "A")[0].toUpperCase()}
              </div>
              <span className="hidden text-xs font-medium text-zinc-200 sm:block">
                {user?.name || user?.email?.split("@")[0]}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  grouped,
  user,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  grouped: { group: NavItem["group"]; items: NavItem[] }[];
  user: { email?: string; name?: string } | null;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">Clodoaldo Admin</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Painel de controle</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {grouped.map(({ group, items }) => (
          <div key={group} className="mb-5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {GROUP_LABELS[group]}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-300" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="mb-2 rounded-lg bg-white/[0.03] p-3">
          <div className="truncate text-xs font-medium text-zinc-300">{user?.name || user?.email}</div>
          <div className="truncate text-[10px] text-zinc-500">{user?.email}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair da conta
        </button>
      </div>
    </>
  );
}
