import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export interface CoverflowSlide {
  src?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  /** HUD plate face when not using an image. */
  content?: React.ReactNode;
  /** Monospace bracket chips shown in caption when showCaption is on. */
  skills?: string[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  navButtonClassName?: string;
  onSelectedChange?: (index: number) => void;
  /** Ms of idle time before advancing one slide; repeats while idle. Pass `0` to disable. */
  autoAdvanceAfterMs?: number;
}

const NAV_DEFAULT =
  'rounded-none border border-[var(--border-cyan)] bg-[var(--bg-surface)] p-1.5 text-[var(--accent-cyan)] hover:bg-[color-mix(in_srgb,var(--bg-surface)_85%,var(--accent-cyan))]';

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = 'clamp(148px, 22vw, 260px)',
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = 'Cover carousel',
  className,
  cardClassName,
  navButtonClassName,
  onSelectedChange,
  autoAdvanceAfterMs = 5000,
}: CoverflowCarouselProps) {
  const count = slides.length;
  const reducedMotion = usePrefersReducedMotion();
  const effectiveRotate = reducedMotion ? 0 : rotate;
  const effectiveDepth = reducedMotion ? 0 : depth;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);
  const idleTimerRef = React.useRef<number | null>(null);

  const [selected, setSelected] = React.useState(0);

  const clearIdleAdvance = React.useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const notifySelected = React.useCallback(
    (index: number) => {
      setSelected(index);
      onSelectedChange?.(index);
    },
    [onSelectedChange],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(effectiveRotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-effectiveDepth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, effectiveDepth, effectiveRotate, fade, falloff, gap, loop]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      notifySelected(indexAt(target));

      if (reducedMotion) {
        posRef.current = target;
        paint();
        return;
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, notifySelected, paint, reducedMotion],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const nudgeRef = React.useRef(nudge);
  nudgeRef.current = nudge;

  const scheduleIdleAdvance = React.useCallback(() => {
    clearIdleAdvance();
    if (autoAdvanceAfterMs <= 0 || reducedMotion || count < 2) return;

    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
      if (dragRef.current) {
        scheduleIdleAdvance();
        return;
      }
      nudgeRef.current(1);
      scheduleIdleAdvance();
    }, autoAdvanceAfterMs);
  }, [autoAdvanceAfterMs, clearIdleAdvance, count, reducedMotion]);

  const noteUserActivity = React.useCallback(() => {
    if (autoAdvanceAfterMs <= 0) return;
    scheduleIdleAdvance();
  }, [autoAdvanceAfterMs, scheduleIdleAdvance]);

  React.useEffect(() => {
    scheduleIdleAdvance();
    return () => clearIdleAdvance();
  }, [scheduleIdleAdvance, clearIdleAdvance]);

  React.useEffect(() => {
    if (autoAdvanceAfterMs <= 0) return;
    const onVisibility = () => {
      if (document.hidden) clearIdleAdvance();
      else scheduleIdleAdvance();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [autoAdvanceAfterMs, clearIdleAdvance, scheduleIdleAdvance]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    clearIdleAdvance();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) notifySelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
    noteUserActivity();
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];
  const navClass = cn(NAV_DEFAULT, navButtonClassName);

  return (
    <div
      className={cn('w-full', className)}
      style={{ ['--cf-card' as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              noteUserActivity();
              nudge(-1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              noteUserActivity();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] active:cursor-grabbing"
          style={{
            perspective: reducedMotion ? 'none' : `calc(var(--cf-card) * ${perspective})`,
            touchAction: 'pan-y',
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: 'var(--cf-card)',
              transformStyle: reducedMotion ? 'flat' : 'preserve-3d',
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}${slide.title ? `: ${slide.title}` : ''}`}
                className={cn(
                  'absolute left-1/2 top-0 aspect-square overflow-hidden rounded-none border border-[var(--border-cyan)] bg-[var(--bg-surface)] will-change-transform',
                  cardClassName,
                )}
                style={{ width: 'var(--cf-card)' }}
              >
                {slide.content ??
                  (slide.src ? (
                    <img
                      src={slide.src}
                      alt={slide.alt ?? ''}
                      draggable={false}
                      className="h-full w-full select-none object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--text-muted)]">
                      {slide.alt ?? 'Slide'}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => {
                noteUserActivity();
                nudge(-1);
              }}
              className={cn('absolute left-0 top-1/2 z-[200] -translate-y-1/2', navClass)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => {
                noteUserActivity();
                nudge(1);
              }}
              className={cn('absolute right-0 top-1/2 z-[200] -translate-y-1/2', navClass)}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div key={selected} className="mt-4 px-2">
          <p className="font-mono text-xs text-[var(--accent-cyan)]">[{active.title}]</p>
          {active.subtitle && (
            <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">{active.subtitle}</p>
          )}
          {active.skills && active.skills.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {active.skills.map((skill) => (
                <li
                  key={skill}
                  className="border border-[var(--border-cyan)] px-2 py-1 font-mono text-[11px] text-[var(--text-primary)]"
                >
                  [{skill}]
                </li>
              ))}
            </ul>
          )}
          {active.meta && active.meta.length > 0 && (
            <dl className="mt-6 w-full max-w-md font-mono text-[11px]">
              {active.meta.map((row) => (
                <div key={row.label} className="flex justify-between border-b border-[var(--border-cyan)] py-1.5">
                  <dt className="text-[var(--text-muted)]">{row.label}</dt>
                  <dd className="text-[var(--text-primary)]">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                'size-2 rounded-full bg-[var(--accent-cyan)] transition-opacity',
                index === selected ? 'opacity-100' : 'opacity-30',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
