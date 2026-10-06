import ProjectCard from '@/components/ProjectCard';
import TypeText from '@/components/TypeText';
import { projects } from '@/data/projects';
import { useInViewRetype } from '@/hooks/useInViewOnce';

export default function ProjectMatrix() {
  const featured = projects.find((p) => p.featured);
  const grid = projects.filter((p) => !p.featured);
  const { ref, inView, typingGeneration } = useInViewRetype();
  const typingKey = String(typingGeneration);

  return (
    <section id="project-matrix" className="w-full scroll-mt-24">
      <div ref={ref}>
        <p className="font-mono text-xs text-[var(--accent-cyan)]">
          <TypeText
            text="[PROJECT_MATRIX]"
            active={inView}
            resetKey={typingKey}
            charDelayMs={6}
            showCursor
          />
        </p>
        <h2 className="mt-2 font-sans text-xl">
          <TypeText text="Systems Portfolio" active={inView} resetKey={typingKey} charDelayMs={5} />
        </h2>
        <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
          <TypeText
            text="Role-first telemetry · NDA-safe industry cards"
            active={inView}
            resetKey={typingKey}
            charDelayMs={3}
          />
        </p>
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
