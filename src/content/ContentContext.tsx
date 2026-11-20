import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildSeed } from '@/content/buildSeed';
import type { PortfolioContent } from '@/content/types';

type ContentValue = {
  content: PortfolioContent;
  setContent: (next: PortfolioContent) => void;
};

const ContentContext = createContext<ContentValue | null>(null);

async function loadContent(): Promise<PortfolioContent> {
  const blobUrl = import.meta.env.VITE_CONTENT_BLOB_URL;
  if (blobUrl) {
    try {
      const remote = await fetch(blobUrl, { cache: 'no-store' });
      if (remote.ok) return (await remote.json()) as PortfolioContent;
    } catch {
      /* seed or API below */
    }
  }
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    if (res.ok) return (await res.json()) as PortfolioContent;
  } catch {
    /* bundled seed */
  }
  return buildSeed();
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(() => buildSeed());

  useEffect(() => {
    let cancel = false;
    loadContent().then((next) => {
      if (!cancel) setContent(next);
    });
    return () => {
      cancel = true;
    };
  }, []);

  const value = useMemo(() => ({ content, setContent }), [content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside ContentProvider');
  return value;
}
