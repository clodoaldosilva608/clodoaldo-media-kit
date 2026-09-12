"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PageViewTracker — registra page_view no banco analytics_events
 * a cada navegação. Não depende de pixel externo nem cookie consent.
 *
 * Leve: 1 POST request por page view, sem PII.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin pages (não rastrear tráfego interno do admin)
    if (pathname?.startsWith("/admin")) return;
    // Skip API routes
    if (pathname?.startsWith("/api/")) return;

    const track = async () => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "page_view",
            path: pathname,
            props: {
              referrer: typeof document !== "undefined" ? document.referrer : null,
            },
          }),
          // Use keepalive so the request isn't cancelled on page unload
          keepalive: true,
        });
      } catch {
        // Silent fail — tracking is non-critical
      }
    };

    // Small delay to not block initial render
    const t = setTimeout(track, 100);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
