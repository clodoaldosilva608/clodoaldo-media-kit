/**
 * Sistema padronizado de eventos de analytics.
 * Integra com GA4, Meta Pixel, GTM quando disponíveis.
 * Sanitiza PII automaticamente.
 */

export type AnalyticsEvent =
  | "page_view"
  | "entry_path_selected"
  | "quiz_started"
  | "quiz_completed"
  | "recommendation_viewed"
  | "recommendation_cta_clicked"
  | "service_viewed"
  | "checkout_started"
  | "lead_submitted"
  | "whatsapp_clicked"
  | "case_opened"
  | "download_started";

interface AnalyticsParams {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;

  const safeParams = sanitizeParams(params);

  // GA4
  if (typeof (window as any).gtag === "function") {
    try {
      (window as any).gtag("event", event, safeParams);
    } catch {}
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    try {
      const metaEvent = mapToMetaEvent(event);
      if (metaEvent) (window as any).fbq("trackCustom", metaEvent, safeParams);
    } catch {}
  }

  // GTM dataLayer
  if (Array.isArray((window as any).dataLayer)) {
    try {
      (window as any).dataLayer.push({ event, ...safeParams });
    } catch {}
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, safeParams);
  }
}

function sanitizeParams(params: AnalyticsParams): AnalyticsParams {
  const PII_KEYS = ["email", "phone", "whatsapp", "name", "cpf", "cnpj", "address"];
  const clean: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEYS.some((p) => key.toLowerCase().includes(p))) continue;
    clean[key] = value;
  }
  return clean;
}

function mapToMetaEvent(event: AnalyticsEvent): string | null {
  const map: Partial<Record<AnalyticsEvent, string>> = {
    quiz_started: "Lead",
    quiz_completed: "CompleteRegistration",
    checkout_started: "InitiateCheckout",
    lead_submitted: "Lead",
    whatsapp_clicked: "Contact",
    download_started: "Subscribe",
  };
  return map[event] ?? null;
}
