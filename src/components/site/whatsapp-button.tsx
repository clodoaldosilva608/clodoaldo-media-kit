"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { MessageCircle, X } from "lucide-react";

interface WhatsAppConfig {
  phone: string;
  display_name: string;
  welcome_message: string;
  position: string;
  active: boolean;
}

export function WhatsAppButton() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("phone, display_name, welcome_message, position, active")
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (mounted && !error && data) {
        setConfig(data);
        setTimeout(() => {
          if (!dismissed && mounted) setShowTooltip(true);
        }, 5000);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dismissed]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      setConfig(null);
    }
  }, []);

  if (!config) return null;

  const link = `https://wa.me/${config.phone.replace(/\D/g, "")}?text=${encodeURIComponent(config.welcome_message)}`;
  const positionClass = config.position === "bottom-left" ? "left-4" : "right-4";

  return (
    <div className={`floating-action-stack fixed bottom-4 ${positionClass} z-30 flex flex-col items-end gap-2`}>
      {showTooltip && !dismissed && (
        <div className="relative max-w-[260px] rounded-2xl rounded-br-sm border border-white/10 bg-white p-3 shadow-2xl">
          <button
            onClick={() => {
              setShowTooltip(false);
              setDismissed(true);
            }}
            className="absolute right-1 top-1 rounded-full p-1 text-zinc-400 hover:bg-zinc-100"
            aria-label="Fechar"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
              <MessageCircle className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-900">{config.display_name}</span>
          </div>
          <p className="text-[11px] text-zinc-600">{config.welcome_message}</p>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block rounded-lg bg-emerald-500 px-3 py-1.5 text-center text-[11px] font-semibold text-white hover:bg-emerald-600"
          >
            Iniciar conversa
          </a>
        </div>
      )}
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        onClick={() => setShowTooltip(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-600"
        aria-label={config.display_name}
      >
        <span className="absolute h-14 w-14 animate-ping rounded-full bg-emerald-500 opacity-20" />
        <MessageCircle className="relative h-7 w-7" />
      </a>
    </div>
  );
}
