/**
 * WhatsApp Connection Manager using Baileys.
 *
 * Features:
 * - QR Code generation for connection
 * - Send text messages
 * - Receive messages (webhook)
 * - Daily limit (30 messages/day)
 * - Connection state management
 * - Persistent auth (reconnect without QR after first scan)
 */

import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as fs from "fs";
import * as path from "path";

// Connection state
let sock: any = null;
let connectionStatus: "disconnected" | "connecting" | "connected" | "qr_ready" = "disconnected";
let currentQR: string | null = null;
let messagesToday: { count: number; date: string } = { count: 0, date: "" };
const DAILY_LIMIT = 30;

// Auth state directory — use /tmp on Vercel (serverless), local dir in dev
const AUTH_DIR = process.env.VERCEL ? path.join("/tmp", "whatsapp_auth") : path.join(process.cwd(), "whatsapp_auth");
if (!fs.existsSync(AUTH_DIR)) {
  try { fs.mkdirSync(AUTH_DIR, { recursive: true }); } catch {}
}

// Callbacks for incoming messages
type MessageHandler = (message: { from: string; text: string; timestamp: number; fromMe: boolean }) => void;
let messageHandlers: MessageHandler[] = [];

export function onMessage(handler: MessageHandler) {
  messageHandlers.push(handler);
}

export function getConnectionStatus() {
  // Reset daily count if new day
  const today = new Date().toISOString().slice(0, 10);
  if (messagesToday.date !== today) {
    messagesToday = { count: 0, date: today };
  }
  return {
    status: connectionStatus,
    qr: currentQR,
    messagesToday: messagesToday.count,
    dailyLimit: DAILY_LIMIT,
  };
}

export async function connectWhatsApp() {
  if (sock && connectionStatus === "connected") {
    return { status: "already_connected" };
  }

  connectionStatus = "connecting";

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Clodoaldo Admin", "Chrome", "1.0.0"],
      defaultQueryTimeoutMs: 60000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        connectionStatus = "qr_ready";
        console.log("[whatsapp] QR Code generated, waiting for scan");
      }

      if (connection === "close") {
        currentQR = null;
        connectionStatus = "disconnected";
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log("[whatsapp] Connection closed, reconnecting...");
          setTimeout(() => connectWhatsApp(), 3000);
        } else {
          console.log("[whatsapp] Connection closed (logged out)");
          // Clean auth state
          if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(AUTH_DIR, { recursive: true });
          }
        }
      } else if (connection === "open") {
        currentQR = null;
        connectionStatus = "connected";
        console.log("[whatsapp] Connected successfully!");
      }
    });

    sock.ev.on("messages.upsert", async (m: any) => {
      try {
        const msgs = m.messages || [];
        for (const msg of msgs) {
          if (!msg.message) continue;

          const from = msg.key.remoteJid || "";
          const fromMe = msg.key.fromMe || false;
          const timestamp = msg.messageTimestamp || Date.now();

          // Extract text
          let text = "";
          if (msg.message.conversation) {
            text = msg.message.conversation;
          } else if (msg.message.extendedTextMessage?.text) {
            text = msg.message.extendedTextMessage.text;
          } else if (msg.message.imageMessage?.caption) {
            text = msg.message.imageMessage.caption;
          }

          if (!text) continue;

          // Only process messages from others (not fromMe) or process both
          const phone = from.replace(/@s\.whatsapp\.net$/, "").replace(/@g\.us$/, "");

          const messageData = {
            from: phone,
            text,
            timestamp: typeof timestamp === "number" ? timestamp * 1000 : Date.now(),
            fromMe,
          };

          console.log(`[whatsapp] Message ${fromMe ? "sent" : "received"} from ${phone}: ${text.slice(0, 80)}`);

          // Notify all handlers
          for (const handler of messageHandlers) {
            try {
              handler(messageData);
            } catch (e) {
              console.error("[whatsapp] Handler error:", e);
            }
          }
        }
      } catch (e) {
        console.error("[whatsapp] Message processing error:", e);
      }
    });

    return { status: "connecting" };
  } catch (e: any) {
    console.error("[whatsapp] Connection error:", e.message);
    connectionStatus = "disconnected";
    return { status: "error", error: e.message };
  }
}

export async function sendWhatsAppMessage(phone: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!sock || connectionStatus !== "connected") {
    return { ok: false, error: "WhatsApp não conectado" };
  }

  // Check daily limit
  const today = new Date().toISOString().slice(0, 10);
  if (messagesToday.date !== today) {
    messagesToday = { count: 0, date: today };
  }
  if (messagesToday.count >= DAILY_LIMIT) {
    return { ok: false, error: `Limite diário de ${DAILY_LIMIT} mensagens atingido` };
  }

  try {
    // Normalize phone number
    let jid = phone.replace(/\D/g, "");
    if (!jid.endsWith("@s.whatsapp.net")) {
      jid += "@s.whatsapp.net";
    }

    await sock.sendMessage(jid, { text });
    messagesToday.count++;
    console.log(`[whatsapp] Message sent to ${phone} (${messagesToday.count}/${DAILY_LIMIT} today)`);
    return { ok: true };
  } catch (e: any) {
    console.error("[whatsapp] Send error:", e.message);
    return { ok: false, error: e.message };
  }
}

export async function disconnectWhatsApp() {
  if (sock) {
    try {
      await sock.logout();
    } catch {}
    sock = null;
    connectionStatus = "disconnected";
    currentQR = null;
    // Clean auth state
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
    console.log("[whatsapp] Disconnected and auth cleared");
  }
  return { ok: true };
}

// Auto-connect on startup (if auth exists)
export async function autoConnect() {
  const authFiles = fs.existsSync(AUTH_DIR) ? fs.readdirSync(AUTH_DIR) : [];
  if (authFiles.length > 0) {
    console.log("[whatsapp] Auth files found, auto-connecting...");
    await connectWhatsApp();
  }
}
