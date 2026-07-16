export interface YTPlayerVars {
  autoplay?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
}

export interface YTPlayerEvent {
  data: number;
}

export interface YTPlayerOptions {
  videoId?: string;
  playerVars?: YTPlayerVars;
  events?: {
    onStateChange?: (e: YTPlayerEvent) => void;
  };
}

export interface YTPlayerInstance {
  destroy: () => void;
  loadVideoById: (id: string) => void;
}

export interface YTNamespace {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayerInstance;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

/** Carga (una sola vez) el script oficial de YouTube IFrame Player API. */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });

  return apiPromise;
}
