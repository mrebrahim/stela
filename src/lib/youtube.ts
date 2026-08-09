export function youtubeIdFrom(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (u.hostname.endsWith('youtube.com') || u.hostname.endsWith('youtube-nocookie.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      // /embed/<id>  /shorts/<id>  /live/<id>
      if (['embed', 'shorts', 'live'].includes(parts[0]) && parts[1]) return parts[1];
    }
    return null;
  } catch { return null; }
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}
