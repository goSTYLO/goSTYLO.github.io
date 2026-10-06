import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useTypewriter';

/** Re-triggers typing each time the element enters the viewport (clears while off-screen). */
export function useInViewRetype(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const wasIntersecting = useRef(false);
  const [inView, setInView] = useState(reducedMotion);
  const [typingGeneration, setTypingGeneration] = useState(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        if (intersecting && !wasIntersecting.current) {
          setTypingGeneration((generation) => generation + 1);
        }
        wasIntersecting.current = intersecting;
        setInView(intersecting);
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px', ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return {
    ref,
    inView: reducedMotion || inView,
    typingGeneration: reducedMotion ? 1 : typingGeneration,
  };
}

/** @deprecated Use useInViewRetype */
export const useInViewOnce = useInViewRetype;
