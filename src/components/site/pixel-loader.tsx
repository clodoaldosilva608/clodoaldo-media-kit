"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

interface PixelConfig {
  id: string;
  provider: string;
  pixel_id: string;
  active: boolean;
  send_events: string[];
}

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    gtag?: any;
    dataLayer?: any[];
    ttq?: any;
    Tatari?: any;
    __pixelTrackedEvents?: Set<string>;
    __cookieConsent?: { accepted: boolean; at: string } | null;
  }
}

const CONSENT_KEY = "cookie-consent-v1";

function readConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return !!parsed.accepted;
  } catch {
    return null;
  }
}

export function PixelLoader() {
  const [pixels, setPixels] = useState<PixelConfig[]>([]);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [trackedEvents, setTrackedEvents] = useState<Set<string>>(new Set());

  // Load pixel configs from DB (only if there are any)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("pixel_config")
        .select("id, provider, pixel_id, active, send_events")
        .eq("active", true);
      if (mounted) setPixels(data || []);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Watch for cookie consent (LGPD compliance — auditoria P0-D)
  // Pixels só carregam após o usuário aceitar cookies.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const c = readConsent();
      setConsent(c);
      window.__cookieConsent = c === null ? null : { accepted: c, at: new Date().toISOString() };
    };
    check();
    // Re-check every 2s (cookie banner can be accepted at any time)
    const interval = setInterval(check, 2000);
    const onStorage = (e: StorageEvent) => { if (e.key === CONSENT_KEY) check(); };
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Initialize each pixel script — APENAS se consent === true
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (consent !== true) return; // aguardar aceite
    if (pixels.length === 0) return;

    pixels.forEach((p) => {
      if (p.provider === "meta" && !window.fbq) {
        (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = true;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        window.fbq("init", p.pixel_id);
        if (p.send_events?.includes("PageView")) {
          window.fbq("track", "PageView");
        }
      }

      if (p.provider === "ga4" && !window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer!.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", p.pixel_id, { anonymize_ip: true });
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${p.pixel_id}`;
        document.head.appendChild(s);
      }

      if (p.provider === "google_ads" && !window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer!.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", p.pixel_id);
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${p.pixel_id}`;
        document.head.appendChild(s);
      }

      if (p.provider === "tiktok" && !window.ttq) {
        (function (w: any, d, t) {
          w.TiktokAnalyticsObject = t;
          var ttq = (w[t] = w[t] || []);
          ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
          ttq.setAndDefer = function (e: any, n: any) {
            e[n] = function () {
              e.push([n].concat(Array.prototype.slice.call(arguments, 0)));
            };
          };
          for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
          ttq.load = function (e: any, n: any) {
            var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i = ttq._i || {};
            ttq._i[e] = [];
            ttq._t = ttq._t || {};
            ttq._t[e] = +new Date();
            ttq._o = ttq._o || {};
            ttq._o[e] = n || {};
            var o = d.createElement("script");
            o.type = "text/javascript";
            o.async = true;
            o.src = r + "?sdkid=" + e + "&lib=" + t;
            var a = d.getElementsByTagName("script")[0];
            if (a && a.parentNode) a.parentNode.insertBefore(o, a);
          };
          ttq.load(p.pixel_id);
          ttq.page();
        })(window, document, "ttq");
      }
    });
  }, [pixels, consent]);

  // Helper to track events (exposed globally) — bloqueado se sem consent
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__pixelTrackedEvents = trackedEvents;
    (window as any).trackEvent = (eventName: string, data?: Record<string, any>) => {
      if (consent !== true) return; // LGPD: não trackear sem consentimento
      pixels.forEach((p) => {
        if (!p.send_events?.includes(eventName)) return;
        if (p.provider === "meta" && window.fbq) {
          window.fbq("trackCustom", eventName, data);
        } else if ((p.provider === "ga4" || p.provider === "google_ads") && window.gtag) {
          window.gtag("event", eventName, data);
        } else if (p.provider === "tiktok" && window.ttq) {
          window.ttq.track(eventName, data);
        }
      });
    };
  }, [pixels, trackedEvents, consent]);

  return null;
}
