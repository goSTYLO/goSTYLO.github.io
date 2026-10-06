import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';

export default function ProjectMatrix() {
  const featured = projects.find((p) => p.featured);
  const grid = projects.filter((p) => !p.featured);

  return (
    <section id="project-matrix" className="w-full scroll-mt-24">
      <p className="font-mono text-xs text-[var(--accent-cyan)]">[PROJECT_MATRIX]</p>
      <h2 className="mt-2 font-sans text-xl">Systems Portfolio</h2>
      <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
        Role-first telemetry · NDA-safe industry cards
      </p>

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
