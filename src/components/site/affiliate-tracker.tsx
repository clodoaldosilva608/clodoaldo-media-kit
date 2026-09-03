"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

/**
 * Tracks affiliate clicks (?ref=SLUG) on every page load.
 * Stores the affiliate slug in localStorage so it can be used at checkout.
 */
export function AffiliateTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname_starts_admin()) return;

    // If a ref is present in the URL, register the click and store it
    if (ref) {
      // Store in localStorage for 30 days
      const data = {
        slug: ref,
        at: new Date().toISOString(),
        path: window.location.pathname,
        utm: {
          source: searchParams.get("utm_source"),
          medium: searchParams.get("utm_medium"),
          campaign: searchParams.get("utm_campaign"),
        },
      };
      localStorage.setItem("affiliate_ref", JSON.stringify(data));

      // Fire-and-forget: register click via API
      fetch("/api/affiliates/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
  }, [ref, searchParams]);

  return null;
}

function pathname_starts_admin() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}
