import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, getConnectionStatus } from "@/lib/whatsapp-connection";

export async function POST(req: NextRequest) {
  try {
    const { phone, text } = await req.json();
    if (!phone || !text) {
      return NextResponse.json({ ok: false, error: "Missing phone or text" }, { status: 400 });
    }
    const result = await sendWhatsAppMessage(phone, text);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const status = getConnectionStatus();
  return NextResponse.json(status);
}
