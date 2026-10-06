import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Types `text` from scratch whenever `resetKey` changes. */
export function useTypewriter(text: string, resetKey: string, charDelayMs: number) {
  const instant = usePrefersReducedMotion();
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setCharIndex(0);
  }, [resetKey, text]);

  useEffect(() => {
    if (instant) return;
    if (charIndex >= text.length) return;
    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), charDelayMs);
    return () => window.clearTimeout(timer);
  }, [instant, charIndex, text.length, charDelayMs]);

  const display = instant ? text : text.slice(0, charIndex);
  const complete = instant || charIndex >= text.length;

  return { display, complete };
}
