"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { X, Flame } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  headline: string;
  subtext: string;
  cta_label: string;
  cta_href: string;
  ends_at: string;
  starts_at: string | null;
  theme: string;
  position: string;
  active: boolean;
}

function timeLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("countdown_campaigns")
        .select("*")
        .eq("active", true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .gt("ends_at", nowIso)
        .order("ends_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (mounted && !error && data) {
        setCampaign(data);
      }
    })();
    const t = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      setCampaign(null);
    }
  }, []);

  // Check if dismissed for this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionDismissals = JSON.parse(sessionStorage.getItem("countdown_dismissed") || "{}");
      if (campaign && sessionDismissals[campaign.id]) {
        setDismissed(true);
      }
    }
  }, [campaign]);

  if (!campaign || dismissed) return null;

  const left = timeLeft(campaign.ends_at);
  if (!left) return null;

  const dismiss = () => {
    if (typeof window !== "undefined") {
      const sessionDismissals = JSON.parse(sessionStorage.getItem("countdown_dismissed") || "{}");
      sessionDismissals[campaign.id] = true;
      sessionStorage.setItem("countdown_dismissed", JSON.stringify(sessionDismissals));
    }
    setDismissed(true);
  };

  const themes: Record<string, string> = {
    fire: "bg-gradient-to-r from-red-600 via-orange-500 to-amber-500",
    dark: "bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-white/10",
    gold: "bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600",
    minimal: "bg-white border-b border-zinc-200",
  };

  const themeClass = themes[campaign.theme] || themes.fire;
  const isLight = campaign.theme === "minimal";

  return (
    <div className={`relative ${themeClass} ${isLight ? "text-zinc-900" : "text-white"}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-center sm:gap-4">
        <div className="flex items-center gap-2">
          {!isLight && <Flame className="h-4 w-4 animate-pulse" />}
          <span className="text-sm font-bold sm:text-base">{campaign.headline}</span>
        </div>
        {campaign.subtext && (
          <span className={`hidden text-xs sm:inline ${isLight ? "text-zinc-600" : "text-white/80"}`}>
            {campaign.subtext}
          </span>
        )}
        <div className="flex items-center gap-1">
          {[
            { v: left.d, l: "d" },
            { v: left.h, l: "h" },
            { v: left.m, l: "min" },
            { v: left.s, l: "s" },
          ].map((u, i) => (
            <div
              key={i}
              className={`flex min-w-[28px] flex-col items-center rounded-md px-1.5 py-0.5 ${
                isLight ? "bg-zinc-900 text-white" : "bg-black/30"
              }`}
            >
              <span className="font-mono text-xs font-bold tabular-nums">{String(u.v).padStart(2, "0")}</span>
              <span className={`text-[8px] uppercase ${isLight ? "text-zinc-400" : "text-white/60"}`}>{u.l}</span>
            </div>
          ))}
        </div>
        <a
          href={campaign.cta_href}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            isLight ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-white text-zinc-900 hover:bg-white/90"
          }`}
        >
          {campaign.cta_label}
        </a>
      </div>
      <button
        onClick={dismiss}
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition ${
          isLight ? "text-zinc-500 hover:bg-zinc-200" : "text-white/70 hover:bg-white/20"
        }`}
        aria-label="Fechar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
