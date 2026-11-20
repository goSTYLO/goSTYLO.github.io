import type { CSSProperties } from 'react';
import AsciiRaster from '@/components/common/AsciiRaster';
import BlueprintCard from '@/components/common/BlueprintCard';
import { useContent } from '@/content/ContentContext';
import { DITHER_DEFAULTS, type RasterMode } from '@/lib/asciiRaster';

const ADAM_SRC = '/ascii/creation-of-adam-hands.jpg';
/** Half of `main`’s `max-w-7xl` (80rem). Stickers sit in the leftover viewport gutter. */
const COLUMN_HALF = '40rem';
const GUTTER_GAP = '0.5rem';

type Frame = 'square' | 'wide' | 'tall';

type Sticker = {
  tag: string;
  mode: RasterMode;
  src?: string;
  caption?: string;
  animStyle: 'pulse' | 'yaw';
  cellSize: number;
  coverage: number;
  density: number;
  contrast: number;
  frame: Frame;
  side: 'left' | 'right';
  widthRem: number;
  className: string;
};

const FRAME_CLASS: Record<Frame, string> = {
  square: 'aspect-square',
  wide: 'aspect-[16/10]',
  tall: 'aspect-[3/4]',
};

function projectImage(projects: { id: string; images: { src: string }[] }[], id: string, index = 0): string | undefined {
  const src = projects.find((project) => project.id === id)?.images[index]?.src;
  return src || undefined;
}

/** Park outside `max-w-7xl`. Goes negative (clipped by the overlay) when the gutter is too narrow. */
function gutterStyle(side: 'left' | 'right', widthRem: number): CSSProperties {
  const inset = `calc(50% - min(${COLUMN_HALF}, 50%) - ${widthRem}rem - ${GUTTER_GAP})`;
  return { width: `${widthRem}rem`, ...(side === 'left' ? { left: inset } : { right: inset }) };
}

export default function AsciiPlates() {
  const { content } = useContent();
  const portrait = content.profile.portraitUrl;
  const serbisyo = projectImage(content.projects, 'serbisyo', 0);
  const serbisyoPhone = projectImage(content.projects, 'serbisyo', 1);
  const rescue = projectImage(content.projects, 'rescue-link', 0);

  const stickers: Sticker[] = [
    {
      tag: '[ADAM]',
      mode: 'dither',
      src: ADAM_SRC,
      caption: '[PD]',
      animStyle: 'pulse',
      cellSize: 8,
      coverage: DITHER_DEFAULTS.coverage,
      density: DITHER_DEFAULTS.density,
      contrast: DITHER_DEFAULTS.contrast,
      frame: 'wide',
      side: 'right',
      widthRem: 7.5,
      className: 'top-[calc(100dvh+1.25rem)] rotate-1',
    },
    {
      tag: '[SUBJECT]',
      mode: 'dither',
      src: portrait,
      animStyle: 'pulse',
      cellSize: 8,
      coverage: 100,
      density: 22,
      contrast: 140,
      frame: 'tall',
      side: 'left',
      widthRem: 5.5,
      className: 'top-[calc(100dvh+1.25rem)] -rotate-1',
    },
    {
      tag: '[GLOBE]',
      mode: 'globe',
      animStyle: 'yaw',
      cellSize: 7,
      coverage: 100,
      density: 36,
      contrast: 120,
      frame: 'square',
      side: 'right',
      widthRem: 5.75,
      className: 'top-[38%] rotate-1',
    },
    {
      tag: '[SERBISYO]',
      mode: 'dither',
      src: serbisyo,
      animStyle: 'pulse',
      cellSize: 8,
      coverage: 100,
      density: 22,
      contrast: 145,
      frame: 'wide',
      side: 'left',
      widthRem: 7.25,
      className: 'top-[52%] -rotate-1',
    },
    {
      tag: '[RESCUE]',
      mode: 'dither',
      src: rescue,
      animStyle: 'pulse',
      cellSize: 8,
      coverage: 100,
      density: 22,
      contrast: 145,
      frame: 'wide',
      side: 'right',
      widthRem: 7.25,
      className: 'top-[66%] rotate-1',
    },
    {
      tag: '[PHONE]',
      mode: 'dither',
      src: serbisyoPhone,
      animStyle: 'pulse',
      cellSize: 7,
      coverage: 100,
      density: 24,
      contrast: 140,
      frame: 'tall',
      side: 'left',
      widthRem: 5.25,
      className: 'top-[80%] rotate-1',
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden lg:block" aria-hidden="true">
      {stickers
        .filter((sticker) => sticker.mode === 'globe' || sticker.src)
        .map((sticker) => (
          <div
            key={sticker.tag}
            data-ascii-sticker={sticker.tag}
            className={`absolute ${sticker.className}`}
            style={gutterStyle(sticker.side, sticker.widthRem)}
          >
            <BlueprintCard className="!p-1.5 bg-[color-mix(in_srgb,var(--bg-surface)_90%,transparent)]">
              <p className="font-mono text-[8px] tracking-wide text-[var(--text-muted)]">{sticker.tag}</p>
              <div className={`mt-0.5 w-full ${FRAME_CLASS[sticker.frame]}`}>
                <AsciiRaster
                  mode={sticker.mode}
                  src={sticker.src}
                  cellSize={sticker.cellSize}
                  coverage={sticker.coverage}
                  density={sticker.density}
                  contrast={sticker.contrast}
                  invert={false}
                  animated
                  animStyle={sticker.animStyle}
                  animIntensity={60}
                  animSpeed={100}
                  dprCap={1.5}
                />
              </div>
              {sticker.caption ? (
                <p className="mt-0.5 font-mono text-[7px] tracking-wide text-[var(--text-muted)]">{sticker.caption}</p>
              ) : null}
            </BlueprintCard>
          </div>
        ))}
    </div>
  );
}
