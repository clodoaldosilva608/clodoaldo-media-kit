import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/lib/whatsapp-connection";

export async function GET() {
  const status = getConnectionStatus();
  return NextResponse.json(status);
}
