import { useCallback, useEffect, useState } from 'react';

export interface YoutubeVideo {
  id: string;
  title: string;
  thumb: string;
  date: string;
}

/** Playlist de YouTube (Entregas). Con API key + playlist ID usa la API; si no, cae a IDs manuales separados por comas. */
export function useYoutubePlaylist() {
  const apiKey = (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)?.trim() ?? '';
  const playlistId = (import.meta.env.VITE_YOUTUBE_PLAYLIST_ID as string | undefined)?.trim() ?? '';
  const videoIds = (import.meta.env.VITE_YOUTUBE_VIDEO_IDS as string | undefined)?.trim() ?? '';

  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const load = useCallback(
    (pageToken?: string) => {
      if (!apiKey || !playlistId) {
        const ids = videoIds.split(',').map((v) => v.trim()).filter(Boolean);
        const vids: YoutubeVideo[] = ids.map((id, i) => ({
          id,
          title: 'Entrega ConstruAuto #' + (i + 1),
          thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg',
          date: '',
        }));
        setVideos(vids);
        setNextPageToken(null);
        setLoading(false);
        setError('');
        setCurrent((prev) => prev || vids[0]?.id || null);
        return;
      }

      setLoading(true);
      setError('');
      const url =
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=9&playlistId=' +
        encodeURIComponent(playlistId) +
        '&key=' +
        encodeURIComponent(apiKey) +
        (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');

      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) {
            setLoading(false);
            setError(d.error.message || 'No se pudo cargar la lista de videos.');
            return;
          }
          const items: YoutubeVideo[] = (d.items || [])
            .filter(
              (it: { snippet?: { resourceId?: { videoId?: string }; title?: string } }) =>
                it.snippet?.resourceId?.videoId && it.snippet.title !== 'Private video' && it.snippet.title !== 'Deleted video',
            )
            .map((it: { snippet: { resourceId: { videoId: string }; title: string; thumbnails?: Record<string, { url: string }>; publishedAt: string } }) => {
              const sn = it.snippet;
              const th = sn.thumbnails || {};
              const t = th.maxres || th.high || th.medium || th.default || { url: '' };
              let date = '';
              try {
                date = new Date(sn.publishedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
              } catch {
                /* ignore */
              }
              return { id: sn.resourceId.videoId, title: sn.title, thumb: t.url || '', date };
            });
          setVideos((prev) => (pageToken ? prev.concat(items) : items));
          setNextPageToken(d.nextPageToken || null);
          setLoading(false);
          setCurrent((prev) => prev || items[0]?.id || null);
        })
        .catch(() => {
          setLoading(false);
          setError('No se pudo conectar con YouTube. Revisa tu conexión o la clave de API.');
        });
    },
    [apiKey, playlistId, videoIds],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, playlistId, videoIds]);

  const loadMore = () => {
    if (!loading && nextPageToken) load(nextPageToken);
  };

  return {
    videos,
    hasMore: !!nextPageToken || loading,
    loading,
    error,
    current,
    setCurrent,
    playing,
    setPlaying,
    loadMore,
  };
}
