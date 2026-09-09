import { getValidAccessToken } from "./google-oauth";

export async function createEvent(input: {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail?: string;
}): Promise<{ id?: string; htmlLink?: string; error?: string }> {
  const token = await getValidAccessToken();
  if (!token) return { error: "Google não conectado" };

  const event: any = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.startDateTime, timeZone: "America/Sao_Paulo" },
    end: { dateTime: input.endDateTime, timeZone: "America/Sao_Paulo" },
    conferenceData: { createRequest: { requestId: Date.now().toString(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
  };
  if (input.attendeeEmail) {
    event.attendees = [{ email: input.attendeeEmail }];
  }

  const resp = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  const data = await resp.json();
  if (!resp.ok) return { error: data.error?.message || `Erro ${resp.status}` };
  return { id: data.id, htmlLink: data.htmlLink };
}
