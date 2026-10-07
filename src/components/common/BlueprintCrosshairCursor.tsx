import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const STIFFNESS = 0.12;
const DAMPING = 0.74;
const SETTLE_EPS = 0.35;
const VELOCITY_EPS = 0.08;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isPressPointer(type: string) {
  return type === 'touch' || type === 'pen';
}

export default function BlueprintCrosshairCursor() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [rings, setRings] = useState<number[]>([]);
  const nodeRef = useRef<HTMLDivElement>(null);
  const ringCounterRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const touchActiveRef = useRef(false);
  const mouseOverRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setMounted(true);

    const setVisibleState = (next: boolean) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setVisible(next);
      if (!next) {
        velRef.current = { x: 0, y: 0 };
      }
    };

    const applyTransform = () => {
      const el = nodeRef.current;
      if (!el) return;
      const { x, y } = posRef.current;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const step = () => {
      rafRef.current = null;
      if (!visibleRef.current) return;

      const { x: tx, y: ty } = targetRef.current;
      let { x, y } = posRef.current;
      let { x: vx, y: vy } = velRef.current;

      vx += (tx - x) * STIFFNESS;
      vy += (ty - y) * STIFFNESS;
      vx *= DAMPING;
      vy *= DAMPING;
      x += vx;
      y += vy;

      posRef.current = { x, y };
      velRef.current = { x: vx, y: vy };
      applyTransform();

      const settled =
        Math.hypot(tx - x, ty - y) < SETTLE_EPS && Math.hypot(vx, vy) < VELOCITY_EPS;
      if (!settled) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    const ensureLoop = () => {
      if (rafRef.current === null && visibleRef.current) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    const setTarget = (clientX: number, clientY: number, snap = false) => {
      targetRef.current = { x: clientX, y: clientY };
      if (snap) {
        posRef.current = { x: clientX, y: clientY };
        velRef.current = { x: 0, y: 0 };
        applyTransform();
      }
      ensureLoop();
    };

    const syncVisibility = () => {
      setVisibleState(mouseOverRef.current || touchActiveRef.current);
    };

    const firePress = () => {
      setPressed(true);
      setReleasing(false);
      ringCounterRef.current += 1;
      const id = ringCounterRef.current;
      setRings((prev) => [...prev, id]);
    };

    const fireRelease = () => {
      setPressed(false);
      setReleasing(true);
    };

    const onPointerDown = (e: PointerEvent) => {
      firePress();

      if (isPressPointer(e.pointerType)) {
        touchActiveRef.current = true;
        setTarget(e.clientX, e.clientY, true);
        syncVisibility();
        return;
      }

      if (e.pointerType === 'mouse') {
        mouseOverRef.current = true;
        setTarget(e.clientX, e.clientY);
        syncVisibility();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        mouseOverRef.current = true;
        setTarget(e.clientX, e.clientY);
        syncVisibility();
        return;
      }
      if (isPressPointer(e.pointerType) && touchActiveRef.current) {
        setTarget(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      fireRelease();
      if (isPressPointer(e.pointerType)) {
        touchActiveRef.current = false;
        syncVisibility();
      }
    };

    const onMouseLeaveDocument = () => {
      mouseOverRef.current = false;
      syncVisibility();
    };

    const onPointerCancel = (e: PointerEvent) => {
      fireRelease();
      if (isPressPointer(e.pointerType)) {
        touchActiveRef.current = false;
        syncVisibility();
      }
    };

    const opts = { passive: true } as const;
    window.addEventListener('pointerdown', onPointerDown, opts);
    window.addEventListener('pointermove', onPointerMove, opts);
    window.addEventListener('pointerup', onPointerUp, opts);
    window.addEventListener('pointercancel', onPointerCancel, opts);
    document.documentElement.addEventListener('mouseleave', onMouseLeaveDocument);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.documentElement.removeEventListener('mouseleave', onMouseLeaveDocument);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const removeRing = (id: number) => {
    setRings((prev) => prev.filter((ringId) => ringId !== id));
  };

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      <div
        ref={nodeRef}
        className="absolute left-0 top-0 will-change-transform transition-opacity duration-150"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="relative flex size-5 items-center justify-center">
          {rings.map((id) => (
            <span
              key={id}
              aria-hidden="true"
              className="crosshair-ping-ring pointer-events-none absolute left-1/2 top-1/2"
              onAnimationEnd={() => removeRing(id)}
            />
          ))}
          <Plus
            className={cn(
              'relative size-5 text-[var(--crosshair)]',
              pressed ? 'crosshair-plus-pressed' : 'crosshair-plus-idle',
              !pressed && releasing && 'crosshair-plus-release',
            )}
            strokeWidth={2}
            onAnimationEnd={() => setReleasing(false)}
          />
        </div>
      </div>
    </div>
  );
}
