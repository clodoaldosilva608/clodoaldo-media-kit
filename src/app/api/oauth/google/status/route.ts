import { NextResponse } from "next/server";
import { isConnected, getConnectedEmail } from "@/lib/google-oauth";

export async function GET() {
  const connected = await isConnected();
  const email = connected ? await getConnectedEmail() : null;
  return NextResponse.json({ connected, email });
}
