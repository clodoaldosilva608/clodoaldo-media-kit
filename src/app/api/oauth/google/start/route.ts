import { NextResponse } from "next/server";
import { getOAuthUrl } from "@/lib/google-oauth";

export async function GET() {
  return NextResponse.redirect(getOAuthUrl());
}
