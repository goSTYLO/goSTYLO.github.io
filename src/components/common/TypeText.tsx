import { useEffect, useRef } from 'react';

import { useTypewriter } from '@/hooks/useTypewriter';

type TypeTextProps = {
  text: string;
  active: boolean;
  charDelayMs?: number;
  className?: string;
  showCursor?: boolean;
  /** Restarts typing when changed (e.g. carousel caption index). */
  resetKey?: string;
  onComplete?: () => void;
};

export default function TypeText({
  text,
  active,
  charDelayMs = 2,
  className,
  showCursor = false,
  resetKey = 'run',
  onComplete,
}: TypeTextProps) {
  const { display, complete } = useTypewriter(text, active ? resetKey : 'idle', charDelayMs);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
  }, [resetKey, active]);

  useEffect(() => {
    if (!active || !complete || !onComplete || completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [active, complete, onComplete]);

  return (
    <span className={className}>
      {display}
      {showCursor && active && !complete ? <span className="terminal-cursor">▌</span> : null}
    </span>
  );
}
