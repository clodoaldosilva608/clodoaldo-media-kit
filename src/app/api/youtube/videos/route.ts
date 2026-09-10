import { NextResponse } from "next/server";
import { getLatestVideos } from "@/lib/youtube";

export async function GET() {
  try {
    const videos = await getLatestVideos(6);
    return NextResponse.json({ videos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, videos: [] }, { status: 500 });
  }
}
