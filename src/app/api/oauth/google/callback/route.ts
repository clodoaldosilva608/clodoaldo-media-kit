import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, saveTokens } from "@/lib/google-oauth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`https://clodoaldo-media-kit.vercel.app/admin/aprovacoes?google_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect("https://clodoaldo-media-kit.vercel.app/admin/aprovacoes?google_error=no_code");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.access_token) {
      return NextResponse.redirect(`https://clodoaldo-media-kit.vercel.app/admin/aprovacoes?google_error=${encodeURIComponent(tokens.error_description || tokens.error || "token_exchange_failed")}`);
    }

    // Get user email from token info
    let userEmail = "";
    try {
      const infoResp = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
      if (infoResp.ok) {
        const info = await infoResp.json();
        userEmail = info.email || "";
      }
    } catch {}

    tokens.user_email = userEmail;
    await saveTokens(tokens);

    const redirectUrl = userEmail
      ? `https://clodoaldo-media-kit.vercel.app/admin/aprovacoes?google_connected=1&google_email=${encodeURIComponent(userEmail)}`
      : "https://clodoaldo-media-kit.vercel.app/admin/aprovacoes?google_connected=1";
    return NextResponse.redirect(redirectUrl);
  } catch (e: any) {
    return NextResponse.redirect(`https://clodoaldo-media-kit.vercel.app/admin/aprovacoes?google_error=${encodeURIComponent(e.message)}`);
  }
}
