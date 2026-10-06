import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { CoverflowCarousel } from '@/components/ui/coverflow-carousel';
import { usePrefersReducedMotion, useTypewriter } from '@/hooks/useTypewriter';
import { SKILL_GROUPS, type SkillGroup } from '@/lib/skillGroups';

function SkillPlate({ group }: { group: SkillGroup }) {
  const Icon = group.icon;
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
      {['-top-2 -left-2', '-top-2 -right-2', '-bottom-2 -left-2', '-bottom-2 -right-2'].map(
        (position) => (
          <Plus
            key={position}
            aria-hidden
            className={`pointer-events-none absolute ${position} size-4 text-[var(--crosshair)]`}
          />
        ),
      )}
      <span className="font-mono text-[10px] text-[var(--text-muted)]">{group.indexLabel}</span>
      <Icon className="size-10 text-[var(--accent-cyan)]" strokeWidth={1.25} aria-hidden />
      <span className="font-mono text-[11px] leading-tight tracking-wide text-[var(--text-primary)]">
        {group.title.replaceAll('_', ' ')}
      </span>
    </div>
  );
}

function SkillChip({
  skill,
  resetKey,
  onDone,
}: {
  skill: string;
  resetKey: string;
  onDone: () => void;
}) {
  const { display, complete } = useTypewriter(skill, resetKey, 5);

  useEffect(() => {
    if (!complete) return;
    const timer = window.setTimeout(onDone, 25);
    return () => window.clearTimeout(timer);
  }, [complete, onDone]);

  return (
    <li className="border border-[var(--border-cyan)] px-2 py-1 font-mono text-[11px] text-[var(--text-primary)]">
      [{display}
      {!complete ? <span className="terminal-cursor">▌</span> : ']'}
    </li>
  );
}

function SkillCaptionPanel({ group }: { group: SkillGroup }) {
  const reducedMotion = usePrefersReducedMotion();
  const titleText = `[${group.hudTag}]`;
  const { display: titleDisplay, complete: titleComplete } = useTypewriter(titleText, group.id, 8);
  const [chipIndex, setChipIndex] = useState(reducedMotion ? group.skills.length : -1);

  useEffect(() => {
    setChipIndex(reducedMotion ? group.skills.length : -1);
  }, [group.id, reducedMotion, group.skills.length]);

  useEffect(() => {
    if (reducedMotion || !titleComplete || chipIndex >= 0) return;
    setChipIndex(0);
  }, [reducedMotion, titleComplete, chipIndex]);

  const advanceChip = useCallback(() => {
    setChipIndex((i) => i + 1);
  }, []);

  return (
    <div
      aria-live="polite"
      className="mt-4 border border-[var(--border-cyan)] bg-[var(--bg-surface)] p-4 sm:p-5"
    >
      <p className="font-mono text-xs text-[var(--accent-cyan)]">
        {titleDisplay}
        {!titleComplete ? <span className="terminal-cursor">▌</span> : null}
      </p>

      {titleComplete && chipIndex >= 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {group.skills.map((skill, i) => {
            if (reducedMotion || i < chipIndex) {
              return (
                <li
                  key={skill}
                  className="border border-[var(--border-cyan)] px-2 py-1 font-mono text-[11px] text-[var(--text-primary)]"
                >
                  [{skill}]
                </li>
              );
            }
            if (i === chipIndex) {
              return (
                <SkillChip
                  key={`${group.id}-${skill}`}
                  skill={skill}
                  resetKey={`${group.id}-${i}`}
                  onDone={advanceChip}
                />
              );
            }
            return null;
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Same viewport band as HUD scroll-spy in App.tsx — section is "active" when centered in view. */
const SKILLS_IN_VIEW_OPTIONS: IntersectionObserverInit = {
  rootMargin: '-25% 0px -55% 0px',
  threshold: [0, 0.15, 0.35],
};

export default function SkillRaster() {
  const sectionRef = useRef<HTMLElement>(null);
  const [skillsInView, setSkillsInView] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const group = SKILL_GROUPS[selectedIndex] ?? SKILL_GROUPS[0];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSkillsInView(entry.isIntersecting && entry.intersectionRatio >= 0.15);
    }, SKILLS_IN_VIEW_OPTIONS);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const slides = SKILL_GROUPS.map((g) => ({
    alt: g.hudTag,
    title: g.hudTag,
    skills: g.skills,
    content: <SkillPlate group={g} />,
  }));

  return (
    <section ref={sectionRef} id="skills" className="w-full scroll-mt-24">
      <p className="font-mono text-xs text-[var(--accent-cyan)]">[TECHNICAL_SKILLS]</p>
      <h2 className="mt-2 font-sans text-xl">Skill Raster</h2>
      <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
        Drag or use arrows to browse categories.
      </p>

      <div className="relative mt-5">
        <CoverflowCarousel
          slides={slides}
          loop
          showCaption={false}
          showNavigation
          label="Technical skill categories"
          cardWidth="clamp(160px, 24vw, 240px)"
          onSelectedChange={setSelectedIndex}
          autoAdvanceActive={skillsInView}
        />
        <SkillCaptionPanel group={group} />
      </div>
    </section>
  );
}
