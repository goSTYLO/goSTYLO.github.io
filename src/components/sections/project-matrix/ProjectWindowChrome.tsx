import type { ReactNode } from 'react';
import type { Project } from '@/data/projects';

type ProjectWindowChromeProps = {
  project: Project;
  windowIndex: number;
  children: ReactNode;
};

function windowLabel(project: Project) {
  return (project.sysRef ?? project.id).replace(/-/g, '_').toUpperCase();
}

export default function ProjectWindowChrome({ project, windowIndex, children }: ProjectWindowChromeProps) {
  const cntr = String(windowIndex).padStart(2, '0');

  return (
    <>
      <header className="blueprint-window__titlebar">
        <span className="blueprint-window__title">{windowLabel(project)}</span>
        <div className="blueprint-window__titlebar-end">
          <span className="blueprint-window__status" aria-hidden="true">
            [STATUS: {project.status}]
          </span>
          <span className="sr-only">Status: {project.status}</span>
          <div className="blueprint-window__controls" aria-hidden="true">
            <span className="blueprint-window__control blueprint-window__control--minimize" />
            <span className="blueprint-window__control blueprint-window__control--maximize" />
            <span className="blueprint-window__control blueprint-window__control--close" />
          </div>
        </div>
      </header>
      <div className="blueprint-window__body">{children}</div>
      <footer className="blueprint-window__footer">CNTR N°{cntr}</footer>
    </>
  );
}
