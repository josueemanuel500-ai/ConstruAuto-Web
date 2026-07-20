import { useEffect } from 'react';

interface DocumentMeta {
  title: string;
  description: string;
  canonical: string;
}

const DEFAULT_META: DocumentMeta = {
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
};

/** Aplica title/description/canonical propios de una página y los restaura al salir de ella. */
export function useDocumentMeta(meta: DocumentMeta) {
  useEffect(() => {
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.canonical);

    return () => {
      document.title = DEFAULT_META.title;
      document.querySelector('meta[name="description"]')?.setAttribute('content', DEFAULT_META.description);
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', DEFAULT_META.canonical);
    };
  }, [meta.title, meta.description, meta.canonical]);
}
