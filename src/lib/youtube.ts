/** YouTube Data API v3 — usa API Key (não precisa de OAuth) */

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const CHANNEL_HANDLE = "clodoaldosilvaa";

export async function getChannelId(): Promise<string | null> {
  // Busca canal por handle
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${CHANNEL_HANDLE}&key=${API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  return data.items?.[0]?.id || null;
}

export async function getLatestVideos(maxResults = 6): Promise<Array<{ id: string; title: string; thumbnail: string; publishedAt: string; videoUrl: string }>> {
  const channelId = await getChannelId();
  if (!channelId) return [];

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&type=video&key=${API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();

  return (data.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}
