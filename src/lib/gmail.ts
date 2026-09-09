import { getValidAccessToken } from "./google-oauth";

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getValidAccessToken();
  if (!token) return { ok: false, error: "Google não conectado" };

  const rawEmail = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    html,
  ].join("\r\n");

  const encoded = Buffer.from(rawEmail).toString("base64url");

  const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!resp.ok) {
    const err = await resp.json();
    return { ok: false, error: err.error?.message || `Erro ${resp.status}` };
  }
  return { ok: true };
}
