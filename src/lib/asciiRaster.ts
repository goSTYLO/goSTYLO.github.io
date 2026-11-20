/** Canvas2D ASCII raster math. The node check imports this file directly. */

export type RasterMode =
  | 'dither'
  | 'characters'
  | 'dots'
  | 'hexagons'
  | 'rings'
  | 'stars'
  | 'globe'
  | 'ambient';

export type CellKind = 'dither' | 'hex' | 'dot' | 'globe' | 'star';

export type ToneParams = {
  brightness: number;
  contrast: number;
  invert: boolean;
  coverage: number;
  density: number;
};

export type Cell = {
  col: number;
  row: number;
  x: number;
  y: number;
  lum: number;
  kind: CellKind;
};

export const CHAR_SET = ' .:-=+*#%@';

export const DITHER_DEFAULTS: ToneParams = {
  brightness: 0,
  contrast: 158,
  invert: false,
  coverage: 100,
  density: 20,
};

/** Bayer 4×4 (standard ordered-dither matrix). */
export const BAYER_4: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function luminanceRgb(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** contrast 100 = identity. Recipe dither uses 158. brightness is −100…100. */
export function applyTone(lum: number, params: Pick<ToneParams, 'brightness' | 'contrast' | 'invert'>): number {
  let v = clamp01(lum + params.brightness / 100);
  v = clamp01((v - 0.5) * (params.contrast / 100) + 0.5);
  return params.invert ? 1 - v : v;
}

export function bayerThreshold(col: number, row: number): number {
  const v = BAYER_4[row & 3]?.[col & 3] ?? 0;
  return (v + 0.5) / 16;
}

export function bayerShouldDraw(lum: number, col: number, row: number): boolean {
  return lum > bayerThreshold(col, row);
}

export function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function coverageSkip(col: number, row: number, coverage: number): boolean {
  if (coverage >= 100) return false;
  if (coverage <= 0) return true;
  return hash2(col + 1, row + 1) > coverage / 100;
}

export function charForLum(lum: number): string {
  const i = Math.min(CHAR_SET.length - 1, Math.max(0, Math.floor(lum * CHAR_SET.length)));
  return CHAR_SET[i] ?? ' ';
}

export function markScale(density: number): number {
  return 0.35 + (density / 100) * 0.55;
}

export function pulseScale(timeSec: number, speed: number, intensity: number): number {
  const amp = (intensity / 100) * 0.35;
  return 1 + Math.sin(timeSec * (speed / 100) * 2.2) * amp;
}

/**
 * Unit-disk sphere. `nx`,`ny` are in −1…1 from the globe center.
 * Returns null outside the disk (back-face still shaded via Lambert).
 */
export function globeLuminance(nx: number, ny: number, yaw: number): number | null {
  const r2 = nx * nx + ny * ny;
  if (r2 > 1) return null;
  const nz = Math.sqrt(1 - r2);
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const x = nx * cos - nz * sin;
  const z = nx * sin + nz * cos;
  const y = ny;
  const ndotl = Math.max(0, x * 0.35 + y * 0.25 + z * 0.9);
  const lon = Math.atan2(x, z);
  const lat = Math.asin(Math.max(-1, Math.min(1, y)));
  const grid =
    (Math.abs(Math.sin(lon * 6)) < 0.12 ? 0.28 : 0) + (Math.abs(Math.sin(lat * 8)) < 0.12 ? 0.18 : 0);
  return clamp01(0.12 + ndotl * 0.72 + grid);
}

export function sampleImageData(
  pixels: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  cellSize: number,
  params: ToneParams,
): Cell[] {
  const cols = Math.max(1, Math.floor(width / cellSize));
  const rows = Math.max(1, Math.floor(height / cellSize));
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (coverageSkip(col, row, params.coverage)) continue;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;
      const x0 = col * cellSize;
      const y0 = row * cellSize;
      const x1 = Math.min(width, x0 + cellSize);
      const y1 = Math.min(height, y0 + cellSize);
      for (let y = y0; y < y1; y += 1) {
        let i = (y * width + x0) * 4;
        for (let x = x0; x < x1; x += 1) {
          rSum += pixels[i] ?? 0;
          gSum += pixels[i + 1] ?? 0;
          bSum += pixels[i + 2] ?? 0;
          count += 1;
          i += 4;
        }
      }
      if (count === 0) continue;
      const lum = applyTone(luminanceRgb(rSum / count, gSum / count, bSum / count), params);
      if (lum < 0.04) continue;
      cells.push({
        col,
        row,
        x: x0 + cellSize / 2,
        y: y0 + cellSize / 2,
        lum,
        kind: 'dither',
      });
    }
  }
  return cells;
}

function gridCells(
  width: number,
  height: number,
  cellSize: number,
  params: ToneParams,
  kind: CellKind,
  lumAt: (col: number, row: number, x: number, y: number) => number | null,
): Cell[] {
  const cols = Math.max(1, Math.floor(width / cellSize));
  const rows = Math.max(1, Math.floor(height / cellSize));
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (coverageSkip(col, row, params.coverage)) continue;
      const ox = kind === 'hex' && row % 2 === 1 ? cellSize * 0.5 : 0;
      const x = col * cellSize + cellSize / 2 + ox;
      const y = row * cellSize + cellSize / 2;
      const lum = lumAt(col, row, x, y);
      if (lum == null || lum < 0.04) continue;
      cells.push({ col, row, x, y, lum: applyTone(lum, params), kind });
    }
  }
  return cells;
}

export function sampleGlobe(
  width: number,
  height: number,
  cellSize: number,
  yaw: number,
  params: ToneParams,
  cx = width / 2,
  cy = height / 2,
  radius = Math.min(width, height) * 0.46,
): Cell[] {
  return gridCells(width, height, cellSize, params, 'globe', (_c, _r, x, y) =>
    globeLuminance((x - cx) / radius, (y - cy) / radius, yaw),
  );
}

export function sampleHexField(width: number, height: number, cellSize: number, params: ToneParams): Cell[] {
  return gridCells(width, height, cellSize, params, 'hex', (col, row) => 0.28 + hash2(col, row) * 0.72);
}

export function sampleStarField(width: number, height: number, cellSize: number, params: ToneParams): Cell[] {
  const cx = width / 2;
  const cy = height / 2;
  return gridCells(width, height, cellSize, params, 'star', (col, row, x, y) => {
    const spark = hash2(col, row);
    const radial = 1 - Math.min(1, Math.hypot((x - cx) / width, (y - cy) / height) * 1.5);
    if (spark < 0.55 && radial < 0.4) return null;
    return radial * 0.45 + spark * 0.55;
  });
}

export function sampleAmbient(
  width: number,
  height: number,
  cellSize: number,
  yaw: number,
  params: ToneParams,
): Cell[] {
  const gx = width * 0.62;
  const gy = height * 0.48;
  const radius = Math.min(width, height) * 0.38;
  const cols = Math.max(1, Math.floor(width / cellSize));
  const rows = Math.max(1, Math.floor(height / cellSize));
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const ox = row % 2 === 1 ? cellSize * 0.5 : 0;
      const x = col * cellSize + cellSize / 2 + ox;
      const y = row * cellSize + cellSize / 2;
      const globe = globeLuminance((x - gx) / radius, (y - gy) / radius, yaw);
      if (globe != null) {
        cells.push({ col, row, x, y, lum: applyTone(globe, params), kind: 'globe' });
        continue;
      }
      if (coverageSkip(col, row, params.coverage)) continue;
      const spark = hash2(col, row);
      if (spark < 0.42) continue;
      cells.push({
        col,
        row,
        x,
        y,
        lum: applyTone(0.2 + spark * 0.55, params),
        kind: spark > 0.78 ? 'dot' : 'hex',
      });
    }
  }
  return cells;
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.32;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function primitive(mode: RasterMode, kind: CellKind): RasterMode {
  if (mode === 'ambient') {
    if (kind === 'globe' || kind === 'dot') return 'dots';
    if (kind === 'hex') return 'hexagons';
    return 'stars';
  }
  if (mode === 'globe') return 'dots';
  return mode;
}

export function drawCells(
  ctx: CanvasRenderingContext2D,
  cells: Cell[],
  mode: RasterMode,
  opts: { cellSize: number; density: number; pulse: number; fill: string },
): void {
  const base = opts.cellSize * markScale(opts.density) * opts.pulse;
  ctx.fillStyle = opts.fill;
  ctx.strokeStyle = opts.fill;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(6, opts.cellSize * opts.pulse)}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.lineWidth = 1;

  for (const cell of cells) {
    const prim = primitive(mode, cell.kind);
    const r = base * (0.25 + cell.lum * 0.75);
    ctx.globalAlpha = 0.25 + cell.lum * 0.75;
    if (prim === 'dither') {
      if (!bayerShouldDraw(cell.lum, cell.col, cell.row)) continue;
      const s = Math.max(1, r);
      ctx.fillRect(cell.x - s / 2, cell.y - s / 2, s, s);
    } else if (prim === 'characters') {
      ctx.fillText(charForLum(cell.lum), cell.x, cell.y);
    } else if (prim === 'dots') {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, Math.max(0.6, r * 0.45), 0, Math.PI * 2);
      ctx.fill();
    } else if (prim === 'hexagons') {
      hexPath(ctx, cell.x, cell.y, Math.max(1.2, r * 0.55));
      ctx.fill();
    } else if (prim === 'rings') {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, Math.max(1.2, r * 0.5), 0, Math.PI * 2);
      ctx.stroke();
      if (cell.lum > 0.55) {
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, Math.max(0.6, r * 0.25), 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (prim === 'stars') {
      starPath(ctx, cell.x, cell.y, Math.max(1.4, r * 0.6));
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function needsPerFrameSample(mode: RasterMode): boolean {
  return mode === 'globe' || mode === 'ambient';
}
