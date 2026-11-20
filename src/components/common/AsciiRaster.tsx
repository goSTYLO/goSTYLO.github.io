import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useTypewriter';
import {
  DITHER_DEFAULTS,
  drawCells,
  needsPerFrameSample,
  pulseScale,
  sampleAmbient,
  sampleGlobe,
  sampleHexField,
  sampleImageData,
  sampleStarField,
  type Cell,
  type RasterMode,
  type ToneParams,
} from '@/lib/asciiRaster';

export type AsciiRasterProps = {
  mode: RasterMode;
  src?: string;
  cellSize?: number;
  coverage?: number;
  invert?: boolean;
  contrast?: number;
  density?: number;
  brightness?: number;
  animated?: boolean;
  animStyle?: 'pulse' | 'yaw';
  animIntensity?: number;
  animSpeed?: number;
  dprCap?: number;
  className?: string;
  fillVar?: string;
};

function cssColor(fillVar: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(fillVar).trim() || '#00e5ff';
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  w: number,
  h: number,
): void {
  const ir = img.width / img.height;
  const cr = w / h;
  let dw: number;
  let dh: number;
  let dx: number;
  let dy: number;
  if (ir > cr) {
    dh = h;
    dw = h * ir;
    dx = (w - dw) / 2;
    dy = 0;
  } else {
    dw = w;
    dh = w / ir;
    dx = 0;
    dy = (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function sampleFromImage(
  img: HTMLImageElement,
  w: number,
  h: number,
  cellSize: number,
  params: ToneParams,
): Cell[] {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(w));
  canvas.height = Math.max(1, Math.floor(h));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  drawCover(ctx, img, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return sampleImageData(data, canvas.width, canvas.height, cellSize, params);
}

function sampleStatic(mode: RasterMode, w: number, h: number, cellSize: number, params: ToneParams, img: HTMLImageElement | null): Cell[] {
  if (img && (mode === 'dither' || mode === 'characters' || mode === 'dots' || mode === 'rings')) {
    return sampleFromImage(img, w, h, cellSize, params);
  }
  if (mode === 'hexagons') return sampleHexField(w, h, cellSize, params);
  if (mode === 'stars') return sampleStarField(w, h, cellSize, params);
  return [];
}

export default function AsciiRaster({
  mode,
  src,
  cellSize = 9,
  coverage = DITHER_DEFAULTS.coverage,
  invert = DITHER_DEFAULTS.invert,
  contrast = DITHER_DEFAULTS.contrast,
  density = DITHER_DEFAULTS.density,
  brightness = DITHER_DEFAULTS.brightness,
  animated = true,
  animStyle = 'pulse',
  animIntensity = 60,
  animSpeed = 100,
  dprCap = 1.5,
  className = '',
  fillVar = '--accent-cyan',
}: AsciiRasterProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const params: ToneParams = { brightness, contrast, invert, coverage, density };
    let img: HTMLImageElement | null = null;
    let cells: Cell[] = [];
    let w = 0;
    let h = 0;
    let visible = true;
    let hidden = document.hidden;
    let raf = 0;
    let lastBg = 0;
    let start = performance.now();
    let cancelled = false;

    const size = () => {
      w = Math.max(1, wrap.clientWidth);
      h = Math.max(1, wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };

    const resample = () => {
      size();
      if (needsPerFrameSample(mode)) {
        cells = [];
        return;
      }
      cells = sampleStatic(mode, w, h, cellSize, params, img);
    };

    const paint = (timeSec: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const yaw = animStyle === 'yaw' || mode === 'globe' || mode === 'ambient' ? timeSec * 0.28 : 0;
      const pulse =
        animStyle === 'pulse' && !needsPerFrameSample(mode)
          ? pulseScale(timeSec, animSpeed, animIntensity)
          : 1;
      const frameCells = needsPerFrameSample(mode)
        ? mode === 'ambient'
          ? sampleAmbient(w, h, cellSize, yaw, params)
          : sampleGlobe(w, h, cellSize, yaw, params)
        : cells;
      drawCells(ctx, frameCells, mode, {
        cellSize,
        density,
        pulse,
        fill: cssColor(fillVar),
      });
    };

    const tick = (now: number) => {
      raf = 0;
      if (cancelled) return;
      const frozen = reduced || !animated;
      const timeSec = frozen ? 0 : (now - start) / 1000;
      const bgThrottle = dprCap <= 1;
      if (bgThrottle && now - lastBg < 33) {
        if (!frozen && visible && !hidden) raf = requestAnimationFrame(tick);
        return;
      }
      lastBg = now;
      paint(timeSec);
      if (!frozen && visible && !hidden) raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (raf || cancelled) return;
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      resample();
      kick();
    };

    resample();
    paint(0);

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) kick();
    });
    io.observe(wrap);

    const onVis = () => {
      hidden = document.hidden;
      if (!hidden) kick();
    };
    document.addEventListener('visibilitychange', onVis);

    const mo = new MutationObserver(() => kick());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    let loader: HTMLImageElement | null = null;
    if (src) {
      loader = new Image();
      loader.crossOrigin = 'anonymous';
      loader.onload = () => {
        if (cancelled) return;
        img = loader;
        resample();
        kick();
      };
      loader.src = src;
    }

    if (animated && !reduced) kick();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (loader) loader.onload = null;
    };
  }, [
    mode,
    src,
    cellSize,
    coverage,
    invert,
    contrast,
    density,
    brightness,
    animated,
    animStyle,
    animIntensity,
    animSpeed,
    dprCap,
    fillVar,
    reduced,
  ]);

  return (
    <div ref={wrapRef} className={`h-full w-full min-h-0 min-w-0 ${className}`.trim()}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
}
