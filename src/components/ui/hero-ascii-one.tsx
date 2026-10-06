import type { HeroSectionProps } from '@/components/HeroSection';

export default function HeroAsciiOne({ onExploreSystems, onOpenCv, cvOpen = false }: HeroSectionProps) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative min-h-[calc(100dvh-4rem)] scroll-mt-24 overflow-x-hidden bg-transparent text-[var(--text-primary)]"
    >
      <div
        className="pointer-events-none absolute left-3 top-3 z-20 size-8 border-l-2 border-t-2 border-[var(--border-cyan)] lg:left-6 lg:top-6 lg:size-12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-3 top-3 z-20 size-8 border-r-2 border-t-2 border-[var(--border-cyan)] lg:right-6 lg:top-6 lg:size-12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-3 left-3 z-20 size-8 border-b-2 border-l-2 border-[var(--border-cyan)] lg:bottom-6 lg:left-6 lg:size-12"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-3 right-3 z-20 size-8 border-b-2 border-r-2 border-[var(--border-cyan)] lg:bottom-6 lg:right-6 lg:size-12"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <div className="flex w-full shrink-0 flex-col items-center lg:w-[42%] lg:max-w-md lg:items-start">
          <div className="relative w-full max-w-[320px] lg:max-w-none">
            <button
              type="button"
              onClick={onOpenCv}
              aria-label={cvOpen ? 'Close CV' : 'Open CV'}
              aria-expanded={cvOpen}
              className={`cv-photo-trigger relative block w-full overflow-visible p-0 text-left ${cvOpen ? 'cv-photo-trigger--open' : ''}`}
            >
              <img
                src="/aaron-profile.jpg"
                alt="Aaron Christian B. Tamayo"
                width={480}
                height={480}
                className="aspect-square w-full rounded-sm border border-[var(--border-cyan)] object-cover object-[center_18%] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent-cyan)_15%,transparent)]"
              />
              <span className="cv-photo-trigger__hint" aria-hidden="true">
                {cvOpen ? '[CLOSE CV]' : '[SHOW CV]'}
              </span>
              <span className="cv-photo-trigger__corner cv-photo-trigger__corner--tl" aria-hidden="true" />
              <span className="cv-photo-trigger__corner cv-photo-trigger__corner--tr" aria-hidden="true" />
              <span className="cv-photo-trigger__corner cv-photo-trigger__corner--bl" aria-hidden="true" />
              <span className="cv-photo-trigger__corner cv-photo-trigger__corner--br" aria-hidden="true" />
            </button>
            <div
              className="absolute inset-x-2 bottom-2 border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_82%,transparent)] p-2 font-mono text-[7px] leading-relaxed text-[var(--accent-cyan)] backdrop-blur-[2px] sm:text-[8px] lg:inset-x-3 lg:bottom-3 lg:p-2.5 lg:text-[9px]"
              aria-label="Profile telemetry"
            >
              <p className="m-0">&gt; SUBJECT: TAMAYO_AARON_C.</p>
              <p className="m-0">&gt; ROLE: PIONEER FULL-STACK DEV</p>
              <p className="m-0">
                &gt; ORG: SERBISYO (
                <a
                  href="https://serbisyoprovider.com"
                  className="text-[var(--accent-cyan)] underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  serbisyoprovider.com
                </a>
                )
              </p>
              <p className="m-0">&gt; STACK: FLUTTER / NODE / AWS / PAYMONGO</p>
              <p className="m-0">&gt; LAT: 16.0431° N LON: 120.3331° E</p>
            </div>
            <span className="pointer-events-none absolute -left-2 -top-2 size-3 border-l-2 border-t-2 border-[var(--crosshair)]" aria-hidden="true" />
            <span className="pointer-events-none absolute -right-2 -top-2 size-3 border-r-2 border-t-2 border-[var(--crosshair)]" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-2 -left-2 size-3 border-b-2 border-l-2 border-[var(--crosshair)]" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-2 -right-2 size-3 border-b-2 border-r-2 border-[var(--crosshair)]" aria-hidden="true" />
          </div>
        </div>

        <div className="w-full min-w-0 lg:flex-1">
          <div className="relative max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-[var(--accent-cyan)]" />
              <span className="font-mono text-[10px] font-medium tracking-wider text-[var(--accent-cyan)]">
                [SYS_ARCH: OVERVIEW]
              </span>
              <div className="h-px flex-1 bg-[var(--border-cyan)]" />
            </div>

            <h1
              id="hero-headline"
              className="mb-2 break-words font-sans text-3xl font-bold leading-tight tracking-wide text-[var(--text-primary)] lg:text-4xl xl:text-5xl"
            >
              LEAD FULL-STACK ENGINEER
            </h1>
            <p className="mb-4 font-mono text-sm text-[var(--text-muted)] lg:text-base">Aaron Christian B. Tamayo</p>

            <div className="mb-3 hidden gap-1 lg:flex" aria-hidden="true">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="size-0.5 rounded-full bg-[var(--accent-cyan)] opacity-60" />
              ))}
            </div>

            <p className="mb-5 font-sans text-sm leading-relaxed text-[var(--text-muted)] lg:text-base">
              Partner with founders and teams to take products from planning through staging and production—web,
              mobile, and backend under one lead.
            </p>

            <p className="mb-6 font-mono text-xs leading-relaxed text-[var(--text-muted)]">
              Dagupan City, Pangasinan
              {' · '}
              <a
                href="https://github.com/goSTYLO"
                className="font-medium text-[var(--accent-cyan)] underline-offset-2 hover:underline"
              >
                github.com/goSTYLO
              </a>
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onExploreSystems}
                className="group relative border border-[var(--accent-cyan)] px-5 py-2 font-mono text-xs font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--accent-cyan)] hover:text-[var(--bg-primary)] lg:px-6 lg:text-sm"
              >
                <span className="absolute -left-1 -top-1 hidden size-2 border-l border-t border-[var(--accent-cyan)] opacity-0 transition-opacity group-hover:opacity-100 lg:block" />
                <span className="absolute -bottom-1 -right-1 hidden size-2 border-b border-r border-[var(--accent-cyan)] opacity-0 transition-opacity group-hover:opacity-100 lg:block" />
                [EXPLORE_SYSTEMS]
              </button>
            </div>

            <div className="mt-6 hidden items-center gap-2 lg:flex">
              <span className="font-mono text-[9px] text-[var(--accent-cyan)]">∞</span>
              <div className="h-px flex-1 bg-[var(--border-cyan)]" />
              <span className="font-mono text-[9px] text-[var(--accent-cyan)]">TAMAYO.FULLSTACK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
