import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';

import TypeText from '@/components/TypeText';
import { useLineInView } from '@/hooks/useLineInView';
import { usePrefersReducedMotion } from '@/hooks/useTypewriter';

type TypingSequenceContextValue = {
  enabled: boolean;
  sessionKey: string;
  reducedMotion: boolean;
  registerLine: () => number;
  reportVisible: (index: number, visible: boolean) => void;
  onLineComplete: (index: number) => void;
  isLineComplete: (index: number) => boolean;
  nextPendingIndex: () => number;
  isLineVisible: (index: number) => boolean;
};

const TypingSequenceContext = createContext<TypingSequenceContextValue | null>(null);

type TypingSequenceProps = {
  enabled: boolean;
  sessionKey: string;
  children: ReactNode;
};

export function TypingSequence({ enabled, sessionKey, children }: TypingSequenceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lineCounter = useRef(0);
  const visibleRef = useRef<Record<number, boolean>>({});
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const [, setRevision] = useState(0);

  const bump = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    lineCounter.current = 0;
    visibleRef.current = {};
    setCompleted(new Set());
  }, [sessionKey]);

  useEffect(() => {
    if (enabled) return;
    setCompleted(new Set());
    bump();
  }, [enabled, bump]);

  const registerLine = useCallback(() => {
    const index = lineCounter.current;
    lineCounter.current += 1;
    return index;
  }, []);

  const reportVisible = useCallback(
    (index: number, visible: boolean) => {
      if (visibleRef.current[index] === visible) return;
      visibleRef.current[index] = visible;
      bump();
    },
    [bump],
  );

  const onLineComplete = useCallback((index: number) => {
    setCompleted((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const isLineComplete = useCallback((index: number) => completed.has(index), [completed]);

  const isLineVisible = useCallback((index: number) => visibleRef.current[index] === true, []);

  const nextPendingIndex = useCallback(() => {
    let index = 0;
    while (completed.has(index)) index += 1;
    return index;
  }, [completed]);

  const value = useMemo(
    () => ({
      enabled,
      sessionKey,
      reducedMotion,
      registerLine,
      reportVisible,
      onLineComplete,
      isLineComplete,
      nextPendingIndex,
      isLineVisible,
    }),
    [
      enabled,
      sessionKey,
      reducedMotion,
      registerLine,
      reportVisible,
      onLineComplete,
      isLineComplete,
      nextPendingIndex,
      isLineVisible,
    ],
  );

  return <TypingSequenceContext.Provider value={value}>{children}</TypingSequenceContext.Provider>;
}

type TypingLineProps = {
  text: string;
  charDelayMs?: number;
  className?: string;
  showCursor?: boolean;
  as?: ElementType;
};

export function TypingLine({
  text,
  charDelayMs = 2,
  className,
  showCursor = false,
  as: Component = 'div',
}: TypingLineProps) {
  const ctx = useContext(TypingSequenceContext);
  if (!ctx) throw new Error('TypingLine must be used within TypingSequence');

  const indexRef = useRef<number | null>(null);
  if (indexRef.current === null) {
    indexRef.current = ctx.registerLine();
  }
  const index = indexRef.current;

  const { ref, visible } = useLineInView();

  useEffect(() => {
    ctx.reportVisible(index, visible);
  }, [ctx, index, visible]);

  const pending = ctx.nextPendingIndex();
  const isComplete = ctx.isLineComplete(index);
  const isActive =
    ctx.enabled &&
    !ctx.reducedMotion &&
    pending === index &&
    visible &&
    !isComplete;

  const showFull = ctx.reducedMotion && ctx.enabled;

  return (
    <Component ref={ref} className={className}>
      {showFull || isComplete ? (
        text
      ) : isActive ? (
        <TypeText
          text={text}
          active
          charDelayMs={charDelayMs}
          showCursor={showCursor}
          resetKey={`${ctx.sessionKey}-${index}`}
          onComplete={() => ctx.onLineComplete(index)}
        />
      ) : null}
    </Component>
  );
}

type IndependentTypingLineProps = {
  text: string;
  enabled: boolean;
  resetKey: string;
  charDelayMs?: number;
  className?: string;
  showCursor?: boolean;
};

/** Carousel captions and other lines outside a TypingSequence queue. */
export function IndependentTypingLine({
  text,
  enabled,
  resetKey,
  charDelayMs = 2,
  className,
  showCursor = false,
}: IndependentTypingLineProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, visible } = useLineInView();
  const active = enabled && visible && !reducedMotion;

  if (reducedMotion && enabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={className}>
      <TypeText
        text={text}
        active={active}
        resetKey={resetKey}
        charDelayMs={charDelayMs}
        showCursor={showCursor}
      />
    </span>
  );
}
