import ProjectCard from '@/components/sections/project-matrix/ProjectCard';
import { TypingLine, TypingSequence } from '@/components/common/TypingSequence';
import { projects } from '@/data/projects';
import { useInViewRetype } from '@/hooks/useInViewOnce';

export default function ProjectMatrix() {
  const featured = projects.find((p) => p.featured);
  const grid = projects.filter((p) => !p.featured);
  const { ref, inView, typingGeneration } = useInViewRetype();
  const sessionKey = String(typingGeneration);

  return (
    <section id="project-matrix" className="w-full scroll-mt-24">
      <div ref={ref}>
        <TypingSequence key={sessionKey} enabled={inView} sessionKey={sessionKey}>
          <TypingLine
            as="p"
            className="font-mono text-xs text-[var(--accent-cyan)]"
            text="[PROJECT_MATRIX]"
            charDelayMs={4}
            showCursor
          />
          <TypingLine as="h2" className="mt-2 font-sans text-xl" text="Systems Portfolio" charDelayMs={3} />
          <TypingLine
            as="p"
            className="mt-1 font-mono text-sm text-[var(--text-muted)]"
            text="Role-first telemetry · NDA-safe industry cards"
            charDelayMs={2}
          />
        </TypingSequence>
      </div>

      <div className="mt-5 flex w-full flex-col gap-5">
        {featured ? <ProjectCard project={featured} featured /> : null}
        {grid.length > 0 ? (
          <div className="grid w-full gap-5 lg:grid-cols-2">
            {grid.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
