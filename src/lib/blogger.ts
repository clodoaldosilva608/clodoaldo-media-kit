/** Blogger API v3 — usa API Key (não precisa de OAuth) */

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export async function listBlogPosts(blogUrl?: string): Promise<Array<{ id: string; title: string; url: string; published: string; content: string }>> {
  if (!blogUrl || !API_KEY) return [];

  const url = `https://www.googleapis.com/blogger/v3/blogs/byurl?url=${encodeURIComponent(blogUrl)}&key=${API_KEY}`;
  const resp = await fetch(url);
  const blogData = await resp.json();
  if (!blogData.id) return [];

  const postsUrl = `https://www.googleapis.com/blogger/v3/blogs/${blogData.id}/posts?key=${API_KEY}&maxResults=10`;
  const postsResp = await fetch(postsUrl);
  const postsData = await postsResp.json();

  return (postsData.items || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    published: item.published,
    content: item.content || "",
  }));
}
