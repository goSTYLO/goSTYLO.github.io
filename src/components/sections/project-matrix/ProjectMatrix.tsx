import ProjectCard from '@/components/sections/project-matrix/ProjectCard';
import { TypingLine, TypingSequence } from '@/components/common/TypingSequence';
import { projects } from '@/data/projects';
import { useInViewRetype } from '@/hooks/useInViewOnce';

function projectWindowIndex(projectId: string) {
  const i = projects.findIndex((p) => p.id === projectId);
  return i >= 0 ? i + 1 : 1;
}

export default function ProjectMatrix() {
  const featured = projects.find((p) => p.featured);
  const grid = projects.filter((p) => !p.featured);
  const { ref, inView, typingGeneration } = useInViewRetype();
  const sessionKey = String(typingGeneration);

  return (
    <section id="project-matrix" className="w-full scroll-mt-28 lg:scroll-mt-24">
      <div ref={ref}>
        <TypingSequence key={sessionKey} enabled={inView} sessionKey={sessionKey}>
          <TypingLine
            as="p"
            className="font-mono text-xs text-[var(--accent-cyan)]"
            text="[PROJECT_MATRIX]"
            charDelayMs={4}
            showCursor
          />
          <TypingLine as="h2" className="mt-2 font-sans text-xl" text="Selected Projects" charDelayMs={3} />
          <TypingLine
            as="p"
            className="mt-1 font-mono text-sm text-[var(--text-muted)]"
            text="Live products, capstone work, and school builds — some client details are redacted."
            charDelayMs={2}
          />
        </TypingSequence>
      </div>

      <div className="mt-5 flex w-full flex-col gap-5">
        {featured ? (
          <ProjectCard project={featured} featured windowIndex={projectWindowIndex(featured.id)} />
        ) : null}
        {grid.length > 0 ? (
          <div className="grid w-full gap-5 lg:grid-cols-2">
            {grid.map((project) => (
              <ProjectCard key={project.id} project={project} windowIndex={projectWindowIndex(project.id)} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
