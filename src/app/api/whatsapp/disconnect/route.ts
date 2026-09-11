import { NextResponse } from "next/server";
import { disconnectWhatsApp } from "@/lib/whatsapp-connection";

export async function POST() {
  const result = await disconnectWhatsApp();
  return NextResponse.json(result);
}
