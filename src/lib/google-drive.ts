import { getValidAccessToken } from "./google-oauth";

export async function uploadFile(name: string, content: Buffer, mimeType: string): Promise<{ id?: string; url?: string; error?: string }> {
  const token = await getValidAccessToken();
  if (!token) return { error: "Google não conectado" };

  const metadata = { name };
  const boundary = "foo_bar_baz";
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;

  const fullBody = Buffer.concat([Buffer.from(body), content, Buffer.from(`\r\n--${boundary}--`)]);

  const resp = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: fullBody,
  });
  const data = await resp.json();
  if (!resp.ok) return { error: data.error?.message || `Erro ${resp.status}` };
  return { id: data.id, url: `https://drive.google.com/file/d/${data.id}/view` };
}
