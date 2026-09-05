/**
 * Structured logging utility.
 *
 * Emits single-line JSON logs (one per call) that Vercel captures and
 * forwards to its log drain. Easy to search/filter in the Vercel dashboard
 * or any downstream log aggregator (Datadog, Logflare, etc.).
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("order_created", { orderId: "abc", totalCents: 4990 });
 *   logger.warn("coupon_expired", { code: "PROMO10" });
 *   logger.error("webhook_failed", { error: "invalid signature" });
 *
 * Avoid using console.log/error directly — those produce unstructured
 * output that's hard to grep in production logs.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function emit(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    level,
    event,
    ts: new Date().toISOString(),
    ...context,
  };
  const line = JSON.stringify(payload);
  if (level === "error") process.stderr.write(line + "\n");
  else process.stdout.write(line + "\n");
}

export const logger = {
  debug(event: string, context: LogContext = {}) {
    if (process.env.LOG_LEVEL === "debug") emit("debug", event, context);
  },
  info(event: string, context: LogContext = {}) {
    emit("info", event, context);
  },
  warn(event: string, context: LogContext = {}) {
    emit("warn", event, context);
  },
  error(event: string, context: LogContext = {}) {
    emit("error", event, context);
  },
};
