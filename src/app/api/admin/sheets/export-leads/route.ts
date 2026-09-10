import { NextResponse } from "next/server";
import { exportLeadsToSheet } from "@/lib/google-sheets";
import { getMeucorrePool } from "@/lib/meucorre-db";

export async function POST() {
  try {
    const client = await getMeucorrePool().connect();
    const result = await client.query("SELECT * FROM public.clodoaldo_prospects ORDER BY created_at DESC LIMIT 500");
    client.release();

    const sheet = await exportLeadsToSheet(result.rows);
    if (sheet.error) {
      return NextResponse.json({ error: sheet.error }, { status: 500 });
    }
    return NextResponse.json({ url: sheet.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
