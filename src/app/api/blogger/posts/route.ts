import { NextRequest, NextResponse } from "next/server";
import { listBlogPosts } from "@/lib/blogger";

export async function GET(req: NextRequest) {
  try {
    const blogUrl = req.nextUrl.searchParams.get("url") || "";
    const posts = await listBlogPosts(blogUrl);
    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, posts: [] }, { status: 500 });
  }
}
