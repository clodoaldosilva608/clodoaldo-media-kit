import { NextResponse } from "next/server";
import { connectWhatsApp, autoConnect } from "@/lib/whatsapp-connection";

// Allow up to 60 seconds for QR generation
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await connectWhatsApp();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await autoConnect();
    return NextResponse.json({ status: "auto_connect_attempted" });
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e.message });
  }
}
