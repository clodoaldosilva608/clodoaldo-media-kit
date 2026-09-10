import { getValidAccessToken } from "./google-oauth";

export async function createSpreadsheet(title: string): Promise<{ id?: string; url?: string; error?: string }> {
  const token = await getValidAccessToken();
  if (!token) return { error: "Google não conectado" };

  const resp = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { title } }),
  });
  const data = await resp.json();
  if (!resp.ok) return { error: data.error?.message || `Erro ${resp.status}` };
  return { id: data.spreadsheetId, url: data.spreadsheetUrl };
}

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]): Promise<{ ok: boolean; error?: string }> {
  const token = await getValidAccessToken();
  if (!token) return { ok: false, error: "Google não conectado" };

  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });
  if (!resp.ok) {
    const err = await resp.json();
    return { ok: false, error: err.error?.message };
  }
  return { ok: true };
}

export async function exportLeadsToSheet(leads: any[]): Promise<{ url?: string; error?: string }> {
  const token = await getValidAccessToken();
  if (!token) return { error: "Google não conectado" };

  const title = `Leads Clodoaldo — ${new Date().toLocaleDateString("pt-BR")}`;
  const sheet = await createSpreadsheet(title);
  if (sheet.error || !sheet.id) return { error: sheet.error };

  const headers = ["Nome", "Nicho", "Cidade", "Telefone", "WhatsApp", "Website", "Rating", "Status", "Criado em"];
  const rows = leads.map((l) => [
    l.name || "", l.niche || "", l.city || "", l.phone || "", l.whatsapp || "",
    l.website || "", l.rating || "", l.status || "", l.created_at ? new Date(l.created_at).toLocaleString("pt-BR") : "",
  ]);

  await appendToSheet(sheet.id, "A1", [headers, ...rows]);
  return { url: sheet.url };
}
