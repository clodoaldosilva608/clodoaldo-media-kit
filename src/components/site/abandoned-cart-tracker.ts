"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase-browser";

interface CartData {
  session_id: string;
  user_id?: string;
  service_slug: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  addons?: any[];
  answers?: Record<string, any>;
  total_cents?: number;
  coupon_code?: string;
  affiliate_slug?: string;
}

/**
 * Tracks abandoned carts on checkout pages.
 * - Saves cart data to `abandoned_carts` table when user starts filling checkout.
 * - Updates the record as fields change.
 * - Marks as recovered when checkout completes (when order is created).
 */
export function useAbandonedCartTracker(cart: CartData | null) {
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!cart || !cart.session_id || !cart.service_slug) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;

    // Hash to avoid duplicate writes
    const hash = JSON.stringify({
      s: cart.session_id,
      n: cart.customer_name,
      e: cart.customer_email,
      p: cart.customer_phone,
      t: cart.total_cents,
      c: cart.coupon_code,
    });
    if (hash === lastSavedRef.current) return;
    lastSavedRef.current = hash;

    // Debounce: wait 3s before writing to avoid writing on every keystroke
    const debounceTimer = setTimeout(() => {
    if (hash === lastSavedRef.current) return;
    lastSavedRef.current = hash;

    (async () => {
      const payload = {
        session_id: cart.session_id,
        user_id: cart.user_id || null,
        service_slug: cart.service_slug,
        customer_name: cart.customer_name || null,
        customer_email: cart.customer_email || null,
        customer_phone: cart.customer_phone || null,
        addons: cart.addons || [],
        answers: cart.answers || {},
        total_cents: cart.total_cents || 0,
        coupon_code: cart.coupon_code || null,
        affiliate_slug: cart.affiliate_slug || null,
      };

      // Try to update existing by session_id; if not exists, insert
      const { data: existing } = await supabase
        .from("abandoned_carts")
        .select("id, session_id")
        .eq("session_id", cart.session_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("abandoned_carts")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("abandoned_carts").insert(payload);
      }
    })();
    }, 3000); // 3s debounce

    return () => clearTimeout(debounceTimer);
  }, [cart]);
}

/**
 * Generate or retrieve a persistent session ID for the visitor.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "session_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Get the stored affiliate slug from localStorage (set by AffiliateTracker).
 */
export function getStoredAffiliate(): { slug: string; at: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("affiliate_ref");
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 30 days
    if (Date.now() - new Date(data.at).getTime() > 30 * 86400000) {
      localStorage.removeItem("affiliate_ref");
      return null;
    }
    return { slug: data.slug, at: data.at };
  } catch {
    return null;
  }
}
