"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PageViewTracker — registra page_view no banco analytics_events
 * a cada navegação. Também trackeia view_item em /produtos/[slug].
 *
 * Eventos:
 * - page_view: toda navegação
 * - view_item: quando abre /produtos/[slug]
 * - whatsapp_click / initiate_checkout: disparados via window.trackEvent()
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin pages (não rastrear tráfego interno do admin)
    if (pathname?.startsWith("/admin")) return;
    // Skip API routes
    if (pathname?.startsWith("/api/")) return;

    const track = async (event: string, props: Record<string, any> = {}) => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, path: pathname, props }),
          keepalive: true,
        });
      } catch {}
    };

    // page_view em toda navegação
    track("page_view", { referrer: typeof document !== "undefined" ? document.referrer : null });

    // view_item em páginas de produto
    if (pathname?.startsWith("/produtos/")) {
      const slug = pathname.split("/")[2];
      if (slug) track("view_item", { offer_slug: slug });
    }

    // Expõe trackEvent globalmente pra botões usarem
    if (typeof window !== "undefined") {
      (window as any).trackEvent = (event: string, props: Record<string, any> = {}) => {
        track(event, props);
        // Também dispara pra GA4 e Meta Pixel se configurados
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", event, props);
        }
        if (typeof (window as any).fbq === "function") {
          const metaMap: Record<string, string> = {
            page_view: "PageView",
            view_item: "ViewContent",
            initiate_checkout: "InitiateCheckout",
            lead: "Lead",
            purchase: "Purchase",
            whatsapp_click: "Contact",
          };
          (window as any).fbq("track", metaMap[event] || "CustomEvent", props);
        }
      };
    }
  }, [pathname]);

  return null;
}
