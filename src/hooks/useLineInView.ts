import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useTypewriter';

/** Tracks whether a single line/block intersects the viewport (no generation counter). */
export function useLineInView() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return { ref, visible: reducedMotion || visible };
}
