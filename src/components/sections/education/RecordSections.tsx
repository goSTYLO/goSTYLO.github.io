import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import BlueprintCard from '@/components/common/BlueprintCard';
import { CoverflowCarousel } from '@/components/common/ui/coverflow-carousel';
import ProjectImageLightbox from '@/components/sections/project-matrix/ProjectImageLightbox';
import type { CertificationEntry, EducationEntry } from '@/content/types';

function SectionChrome({ tag, title, note }: { tag: string; title: string; note: string }) {
  return (
    <>
      <p className="font-mono text-xs text-[var(--accent-cyan)]">{tag}</p>
      <h2 className="mt-2 font-sans text-xl">{title}</h2>
      <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">{note}</p>
    </>
  );
}

function CertDossierCard({
  entry,
  onOpenImage,
}: {
  entry: CertificationEntry;
  onOpenImage?: () => void;
}) {
  const plateAlt = entry.image?.alt || entry.title;
  return (
    <BlueprintCard className="pointer-events-none h-full overflow-y-auto">
      {entry.image?.src ? (
        <button
          type="button"
          onClick={onOpenImage}
          onPointerDown={(event) => event.stopPropagation()}
          className="group pointer-events-auto relative mb-3 block aspect-[16/10] w-full cursor-zoom-in overflow-hidden border border-[var(--border-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          aria-label={`View fullscreen: ${plateAlt}`}
        >
          <img
            src={entry.image.src}
            alt={plateAlt}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-surface)_90%,transparent)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            [EXPAND]
          </span>
        </button>
      ) : (
        <div className="mb-3 flex aspect-[16/10] w-full items-center justify-center border border-[var(--border-cyan)] font-mono text-[10px] text-[var(--text-muted)]">
          [NO_PLATE]
        </div>
      )}
      <p className="font-mono text-[10px] text-[var(--accent-cyan)]">{entry.issued || 'ISSUED'}</p>
      <h3 className="mt-2 font-sans text-lg text-[var(--text-primary)]">{entry.title}</h3>
      <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">{entry.issuer}</p>
      {entry.summary ? (
        <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--text-muted)]">{entry.summary}</p>
      ) : null}
    </BlueprintCard>
  );
}

export function EducationSection({ entries }: { entries: EducationEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.order - b.order);
  return (
    <section id="education" className="w-full scroll-mt-28 lg:scroll-mt-24">
      <SectionChrome
        tag="[EDUCATION]"
        title="Education"
        note="Degrees and academic exemptions."
      />
      <ol className="relative ml-4 mt-5 flex flex-col gap-4 border-l border-[var(--border-cyan)] pl-5">
        {sorted.map((entry) => (
          <li key={entry.id} className="relative min-w-0">
            <span className="absolute -left-8 top-4 flex size-6 items-center justify-center bg-[var(--bg-primary)] text-[var(--accent-cyan)]">
              <Plus className="size-3.5" aria-hidden />
            </span>
            <BlueprintCard>
              <h3 className="font-sans text-lg text-[var(--text-primary)]">{entry.school}</h3>
              <p className="mt-2 font-mono text-xs text-[var(--accent-cyan)]">{entry.credential}</p>
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                {entry.location}
                {entry.dates ? ` · ${entry.dates}` : ''}
              </p>
              {entry.details ? (
                <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--text-muted)]">{entry.details}</p>
              ) : null}
            </BlueprintCard>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CertificationsSection({ entries }: { entries: CertificationEntry[] }) {
  const sorted = useMemo(() => [...entries].sort((a, b) => a.order - b.order), [entries]);
  const multiple = sorted.length > 1;
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption: string } | null>(null);

  const slides = useMemo(
    () =>
      sorted.map((entry) => ({
        alt: entry.title,
        title: entry.title,
        content: (
          <CertDossierCard
            entry={entry}
            onOpenImage={
              entry.image?.src
                ? () =>
                    setLightbox({
                      src: entry.image!.src,
                      alt: entry.image!.alt || entry.title,
                      caption: entry.title,
                    })
                : undefined
            }
          />
        ),
      })),
    [sorted],
  );

  return (
    <section id="certifications" className="w-full min-w-0 scroll-mt-28 lg:scroll-mt-24">
      <SectionChrome
        tag="[CERTIFICATIONS]"
        title="Certifications"
        note={multiple ? 'Drag or use arrows to browse plates.' : 'Courses and certificates.'}
      />
      <div className="relative mt-5 min-w-0">
        <CoverflowCarousel
          slides={slides}
          loop={multiple}
          square={false}
          frameHeight="calc(var(--cf-card) * 1.55)"
          showCaption={false}
          showNavigation={multiple}
          label="Certification plates"
          cardWidth="clamp(260px, 72vw, 20rem)"
          cardClassName="overflow-visible border-0 bg-transparent p-0 shadow-none"
          autoAdvanceAfterMs={0}
        />
      </div>
      {lightbox ? (
        <ProjectImageLightbox
          images={[{ src: lightbox.src, alt: lightbox.alt, caption: lightbox.caption, layout: 'wide' }]}
          index={0}
          onClose={() => setLightbox(null)}
          onIndexChange={() => {}}
          dialogLabel="Fullscreen certificate plate"
        />
      ) : null}
    </section>
  );
}