import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BlueprintCard from '@/components/BlueprintCard';
import ProjectImageLightbox from '@/components/ProjectImageLightbox';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { Project, ProjectImageLayout } from '@/data/projects';
import { cn } from 'cn';

const FOOTER_NAV =
  'shrink-0 rounded-none border border-[var(--border-cyan)] bg-[var(--bg-surface)] p-1.5 text-[var(--accent-cyan)] hover:bg-[color-mix(in_srgb,var(--bg-surface)_85%,var(--accent-cyan))] disabled:opacity-40';

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
};

function contextTag(project: Project): string {
  if (project.nda) return '[NDA: ACTIVE]';
  if (project.context === 'CAPSTONE') return '[CONTEXT: CAPSTONE]';
  return '[CONTEXT: ACADEMIC]';
}

function slideFrameClass(layout: ProjectImageLayout = 'wide') {
  if (layout === 'mobile') {
    return 'flex min-h-[300px] flex-col justify-end border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_92%,var(--accent-cyan))] p-3 sm:min-h-[360px] lg:min-h-[380px]';
  }
  return 'flex aspect-[4/3] flex-col justify-end border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_92%,var(--accent-cyan))] p-3 sm:aspect-[16/10]';
}

function SlideMedia({
  image,
  layout,
  nda,
  onOpen,
}: {
  image: Project['images'][number];
  layout: ProjectImageLayout;
  nda: boolean;
  onOpen: () => void;
}) {
  if (!image.src) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs text-[var(--text-muted)]">
        {nda ? '[VISUAL: REDACTED]' : '[IMG_PLACEHOLDER]'}
      </div>
    );
  }

  const media =
    layout === 'mobile' ? (
      <div className="relative mx-auto flex w-full max-w-[240px] flex-1 items-center justify-center sm:max-w-[280px]">
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[min(52vh,420px)] w-full object-contain object-center"
          loading="lazy"
        />
      </div>
    ) : (
      <img
        src={image.src}
        alt={image.alt}
        className="size-full min-h-0 flex-1 object-cover object-top"
        loading="lazy"
      />
    );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex min-h-0 flex-1 cursor-zoom-in flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
      aria-label={`View fullscreen: ${image.alt}`}
    >
      {media}
      <span className="pointer-events-none absolute bottom-2 right-2 border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-surface)_90%,transparent)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        [EXPAND]
      </span>
    </button>
  );
}

function ProjectCarousel({ project }: { project: Project }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  const caption = project.images[current]?.caption ?? '';
  const canScrollPrev = api?.canScrollPrev() ?? false;
  const canScrollNext = api?.canScrollNext() ?? false;

  const openLightbox = (index: number) => {
    if (project.images[index]?.src) setLightboxIndex(index);
  };

  return (
    <div className="w-full border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_92%,var(--accent-cyan))]">
      <Carousel className="w-full touch-pan-y" opts={{ loop: true, duration: 25 }} setApi={setApi}>
        <CarouselContent className="-ml-0">
          {project.images.map((image, index) => {
            const layout = image.layout ?? 'wide';
            return (
              <CarouselItem key={`${project.id}-slide-${index}`} className="pl-0">
                <div className={cn(slideFrameClass(layout), 'relative border-0 p-3 pb-0')}>
                  <SlideMedia
                    image={image}
                    layout={layout}
                    nda={project.nda}
                    onOpen={() => openLightbox(index)}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      <div className="flex items-stretch gap-2 border-t border-[var(--border-cyan)] px-2 py-2">
        <button
          type="button"
          className={FOOTER_NAV}
          disabled={!canScrollPrev}
          onClick={() => api?.scrollPrev()}
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p className="flex min-w-0 flex-1 items-center justify-center px-1 text-center font-mono text-[10px] leading-snug tracking-wide text-[var(--accent-cyan)]">
          {caption}
        </p>
        <button
          type="button"
          className={FOOTER_NAV}
          disabled={!canScrollNext}
          onClick={() => api?.scrollNext()}
          aria-label="Next slide"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {lightboxIndex !== null ? (
        <ProjectImageLightbox
          images={project.images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={(next) => {
            setLightboxIndex(next);
            api?.scrollTo(next);
          }}
        />
      ) : null}
    </div>
  );
}

function TelemetryStrip({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] tracking-wide text-[var(--text-muted)]">
      {project.sysRef ? (
        <span className="text-[var(--accent-cyan)]">[SYS_REF: {project.sysRef}]</span>
      ) : null}
      <span>[STATUS: {project.status}]</span>
      <span>{contextTag(project)}</span>
      {project.domains.map((d) => (
        <span key={d}>[{d}]</span>
      ))}
    </div>
  );
}

function RoleBlock({ project }: { project: Project }) {
  return (
    <div className="mt-3 border-l-2 border-[var(--accent-cyan)] pl-3">
      <p className="font-mono text-xs text-[var(--accent-cyan)]">[ROLE: {project.roleTag}]</p>
      <p className="mt-1 font-sans text-base font-medium text-[var(--text-primary)]">
        {project.roleTitle}
      </p>
      <p className="mt-1 font-sans text-sm text-[var(--text-muted)]">{project.roleSummary}</p>
    </div>
  );
}

function FeatureList({ project }: { project: Project }) {
  const visibleCount = project.nda ? project.features.length : 3;
  const preview = project.features.slice(0, visibleCount);
  const extra = project.nda ? [] : project.features.slice(visibleCount);
  const showArchSpecs = !project.nda && (extra.length > 0 || project.stack.length > 0);

  return (
    <div className="mt-4">
      <p className="font-mono text-[10px] text-[var(--text-muted)]">[CAPABILITIES]</p>
      <ul className="mt-2 list-inside list-disc space-y-1 font-sans text-sm text-[var(--text-primary)]">
        {preview.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {showArchSpecs ? (
        <details className="mt-3 font-mono text-xs text-[var(--text-muted)]">
          <summary className="cursor-pointer border border-[var(--border-cyan)] px-2 py-1 text-[var(--accent-cyan)] hover:bg-[color-mix(in_srgb,var(--bg-surface)_90%,var(--accent-cyan))]">
            [ARCH_SPECS]
          </summary>
          <div className="mt-3 space-y-3 border border-[var(--border-cyan)] p-3">
            {extra.length > 0 ? (
              <ul className="list-inside list-disc space-y-1 font-sans text-sm text-[var(--text-primary)]">
                {extra.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : null}
            <div>
              <p className="text-[var(--accent-cyan)]">[STACK]</p>
              <p className="mt-1 font-sans text-sm">{project.stack.join(' · ')}</p>
            </div>
            {project.hosting.length > 0 ? (
              <div>
                <p className="text-[var(--accent-cyan)]">[HOST]</p>
                <p className="mt-1 font-sans text-sm">{project.hosting.join(' · ')}</p>
              </div>
            ) : null}
          </div>
        </details>
      ) : !project.nda ? (
        <div className="mt-3 space-y-2 font-mono text-xs text-[var(--text-muted)]">
          <p>
            <span className="text-[var(--accent-cyan)]">[STACK]</span>{' '}
            <span className="font-sans text-sm text-[var(--text-primary)]">
              {project.stack.join(' · ')}
            </span>
          </p>
          {project.hosting.length > 0 ? (
            <p>
              <span className="text-[var(--accent-cyan)]">[HOST]</span>{' '}
              <span className="font-sans text-sm text-[var(--text-primary)]">
                {project.hosting.join(' · ')}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  if (project.links.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {project.links.map((link) =>
        link.href ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--accent-cyan)] px-2 py-1 font-mono text-xs text-[var(--accent-cyan)] hover:bg-[color-mix(in_srgb,var(--bg-surface)_88%,var(--accent-cyan))]"
          >
            [{link.label}]
          </a>
        ) : (
          <span
            key={link.label}
            className="cursor-not-allowed border border-[var(--border-cyan)] px-2 py-1 font-mono text-xs text-[var(--text-muted)] opacity-60"
            aria-disabled="true"
          >
            [{link.label}: PENDING]
          </span>
        ),
      )}
    </div>
  );
}

function ProjectBody({ project }: { project: Project }) {
  return (
    <>
      <TelemetryStrip project={project} />
      <h3 className="mt-2 font-sans text-xl text-[var(--text-primary)]">{project.title}</h3>
      <p className="mt-1 font-sans text-sm text-[var(--text-muted)]">{project.summary}</p>
      <RoleBlock project={project} />
      <FeatureList project={project} />
      <ProjectLinks project={project} />
    </>
  );
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  if (featured) {
    return (
      <BlueprintCard className="p-3 sm:p-4">
        <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
          <ProjectCarousel project={project} />
          <div className="min-w-0">
            <ProjectBody project={project} />
          </div>
        </div>
      </BlueprintCard>
    );
  }

  return (
    <BlueprintCard className="flex h-full flex-col p-3 sm:p-4">
      <ProjectCarousel project={project} />
      <div className="mt-4 flex flex-1 flex-col">
        <ProjectBody project={project} />
      </div>
    </BlueprintCard>
  );
}
