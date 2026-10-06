import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { ProjectImage } from '@/data/projects';
import { cn } from 'cn';

const LIGHTBOX_NAV =
  'border border-[var(--border-cyan)] bg-[var(--bg-surface)] p-2 text-[var(--accent-cyan)] hover:bg-[color-mix(in_srgb,var(--bg-surface)_85%,var(--accent-cyan))] disabled:opacity-40';

type ProjectImageLightboxProps = {
  images: ProjectImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export default function ProjectImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: ProjectImageLightboxProps) {
  const viewableIndexes = useMemo(
    () => images.map((image, i) => (image.src ? i : -1)).filter((i) => i >= 0),
    [images],
  );

  const openPosition = Math.max(0, viewableIndexes.indexOf(index));
  const [api, setApi] = useState<CarouselApi>();
  const [slidePosition, setSlidePosition] = useState(openPosition);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const pos = viewableIndexes.indexOf(index);
    if (pos >= 0 && api.selectedScrollSnap() !== pos) {
      api.scrollTo(pos);
    }
  }, [api, index, viewableIndexes]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const pos = api.selectedScrollSnap();
      setSlidePosition(pos);
      const originalIndex = viewableIndexes[pos];
      if (originalIndex !== undefined) onIndexChange(originalIndex);
    };

    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onIndexChange, viewableIndexes]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        api?.scrollPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        api?.scrollNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [api, onClose]);

  if (viewableIndexes.length === 0) return null;

  const caption = images[viewableIndexes[slidePosition] ?? viewableIndexes[0]!]?.caption ?? '';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[color-mix(in_srgb,var(--bg-primary)_15%,#000)] p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen project capture"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[102] border border-[var(--border-cyan)] bg-[var(--bg-surface)] p-2 font-mono text-xs text-[var(--accent-cyan)]"
        aria-label="Close fullscreen view"
      >
        <X className="size-4" aria-hidden="true" />
      </button>

      <div
        className="relative z-[101] flex w-full max-w-[min(96vw,72rem)] flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <Carousel
          className="w-full touch-pan-y"
          opts={{ loop: true, startIndex: openPosition, duration: 25 }}
          setApi={setApi}
        >
          <CarouselContent className="-ml-0">
            {viewableIndexes.map((originalIndex) => {
              const image = images[originalIndex]!;
              const layout = image.layout ?? 'wide';
              return (
                <CarouselItem key={originalIndex} className="basis-full pl-0">
                  <figure className="flex min-h-[min(70vh,640px)] flex-col items-center justify-center px-10 sm:px-14">
                    <img
                      src={image.src}
                      alt={image.alt}
                      draggable={false}
                      className={cn(
                        'max-h-[min(78vh,880px)] w-auto max-w-full select-none',
                        layout === 'mobile' ? 'object-contain' : 'object-contain',
                      )}
                    />
                  </figure>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {viewableIndexes.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              className={cn(LIGHTBOX_NAV, 'absolute left-0 top-1/2 z-[102] -translate-y-1/2')}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              className={cn(LIGHTBOX_NAV, 'absolute right-0 top-1/2 z-[102] -translate-y-1/2')}
              aria-label="Next image"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <figcaption className="mt-2 border-t border-[var(--border-cyan)] px-2 py-2 text-center font-mono text-xs text-[var(--text-primary)]">
          {caption}
        </figcaption>
      </div>
    </div>
  );
}
