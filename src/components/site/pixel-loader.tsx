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
  }
}

export function PixelLoader() {
  const [pixels, setPixels] = useState<PixelConfig[]>([]);
  const [trackedEvents, setTrackedEvents] = useState<Set<string>>(new Set());

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

  // Initialize each pixel script
  useEffect(() => {
    if (typeof window === "undefined" || pixels.length === 0) return;

    pixels.forEach((p) => {
      if (p.provider === "meta" && !window.fbq) {
        // Meta Pixel base code
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
        window.gtag("config", p.pixel_id);
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
            a.parentNode.insertBefore(o, a);
          };
          ttq.load(p.pixel_id);
          ttq.page();
        })(window, document, "ttq");
      }
    });
  }, [pixels]);

  // Helper to track events (exposed globally)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__pixelTrackedEvents = trackedEvents;
    (window as any).trackEvent = (eventName: string, data?: Record<string, any>) => {
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
  }, [pixels, trackedEvents]);

  return null;
}
