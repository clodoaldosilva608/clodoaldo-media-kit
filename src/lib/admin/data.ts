/**
 * Admin data fetching helpers — uses server-side API route that bypasses RLS.
 */

export async function fetchAdminData<T = any>(type: string, limit = 500): Promise<T[]> {
  try {
    const resp = await fetch(`/api/admin/data?type=${encodeURIComponent(type)}&limit=${limit}`, {
      cache: "no-store",
    });
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function adminInsert(table: string, payload: any): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const resp = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, action: "insert", payload }),
    });
    const json = await resp.json();
    if (!resp.ok) return { ok: false, error: json.error };
    return { ok: true, data: json.data };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function adminUpdate(table: string, id: string, payload: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const resp = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, action: "update", id, payload }),
    });
    const json = await resp.json();
    if (!resp.ok) return { ok: false, error: json.error };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function adminDelete(table: string, id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const resp = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, action: "delete", id }),
    });
    const json = await resp.json();
    if (!resp.ok) return { ok: false, error: json.error };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function adminUpsert(table: string, payload: any): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const resp = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, action: "upsert", payload }),
    });
    const json = await resp.json();
    if (!resp.ok) return { ok: false, error: json.error };
    return { ok: true, data: json.data };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// Format helpers
export function brl(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function pct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return "0%";
  return `${n.toFixed(digits)}%`;
}

export function num(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return new Intl.NumberFormat("pt-BR").format(n);
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "agora";
  if (sec < 3600) return `${Math.floor(sec / 60)}min atrás`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h atrás`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusColor(status: string): "default" | "success" | "warning" | "danger" | "info" | "muted" {
  const map: Record<string, "default" | "success" | "warning" | "danger" | "info" | "muted"> = {
    pending: "warning",
    paid: "success",
    completed: "success",
    approved: "success",
    active: "success",
    waiting: "info",
    new: "info",
    refunded: "danger",
    failed: "danger",
    canceled: "danger",
    cancelled: "danger",
    blocked: "danger",
    rejected: "danger",
    draft: "muted",
    inactive: "muted",
    archived: "muted",
  };
  return map[status?.toLowerCase()] || "default";
}
