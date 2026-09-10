import { NextRequest, NextResponse } from "next/server";
import { createEvent } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const { summary, description, startDateTime, endDateTime, attendeeEmail } = await req.json();
    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: "summary, startDateTime, endDateTime obrigatórios" }, { status: 400 });
    }
    const result = await createEvent({ summary, description, startDateTime, endDateTime, attendeeEmail });
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
