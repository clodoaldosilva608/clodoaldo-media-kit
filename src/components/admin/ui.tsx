"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  accent = "emerald",
  hint,
}: {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  accent?: "emerald" | "blue" | "amber" | "rose" | "violet" | "cyan";
  hint?: string;
}) {
  const accents: Record<string, { bg: string; text: string; ring: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-300", ring: "ring-emerald-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-300", ring: "ring-blue-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-300", ring: "ring-amber-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-300", ring: "ring-rose-500/20" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-300", ring: "ring-violet-500/20" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-300", ring: "ring-cyan-500/20" },
  };
  const a = accents[accent] || accents.emerald;
  const TrendIcon = delta === undefined ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta === undefined ? "text-zinc-500" : delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-zinc-500";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 lg:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
          <div className="mt-1.5 truncate text-2xl font-bold tracking-tight text-white lg:text-[28px]">{value}</div>
          {hint && <div className="mt-1 truncate text-[11px] text-zinc-500">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1", a.bg, a.text, a.ring)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {(delta !== undefined || deltaLabel) && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px]">
          <span className={cn("flex items-center gap-0.5 font-semibold", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {delta !== undefined ? `${delta > 0 ? "+" : ""}${delta}%` : ""}
          </span>
          {deltaLabel && <span className="text-zinc-500">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function Widget({
  title,
  action,
  children,
  className,
  icon,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-5", className)}>
      <header className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          {icon}
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  className?: string;
}) {
  const variants = {
    default: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/20",
    success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
    danger: "bg-rose-500/15 text-rose-300 ring-rose-500/20",
    info: "bg-blue-500/15 text-blue-300 ring-blue-500/20",
    muted: "bg-white/5 text-zinc-400 ring-white/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  steps,
  hint,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  steps?: string[];
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      {icon && <div className="mb-3 text-zinc-500">{icon}</div>}
      <h4 className="text-sm font-semibold text-zinc-300">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>}
      {steps && steps.length > 0 && (
        <ol className="mt-4 max-w-md space-y-1.5 text-left text-xs text-zinc-400">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-300">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
      {hint && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1.5 text-[10px] text-amber-200/80">
          💡 {hint}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: "today" | "week" | "month" | "all";
  onChange: (v: "today" | "week" | "month" | "all") => void;
}) {
  const items: { key: typeof value; label: string }[] = [
    { key: "today", label: "Hoje" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mês" },
    { key: "all", label: "Tudo" },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-white/5 bg-white/[0.03] p-0.5">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-medium transition",
            value === it.key
              ? "bg-emerald-500/20 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
              : "text-zinc-400 hover:text-zinc-200",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Button({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    default: "bg-white/5 text-zinc-200 hover:bg-white/10 ring-1 ring-inset ring-white/10",
    primary: "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20",
    ghost: "text-zinc-300 hover:bg-white/5",
    danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 ring-1 ring-inset ring-rose-500/20",
    outline: "border border-white/10 text-zinc-200 hover:bg-white/5",
  };
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-zinc-400", className)}>{children}</label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-emerald-500" : "bg-white/10",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
      {label && <span className="text-xs text-zinc-300">{label}</span>}
    </label>
  );
}
