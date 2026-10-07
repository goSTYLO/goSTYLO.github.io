import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import BlueprintCard from '@/components/common/BlueprintCard';
import { cvDocument, type CvContactLink } from '@/data/cv';
import { downloadResumePdf } from '@/lib/downloadResumePdf';

type CvAstOverlayProps = {
  onClose: () => void;
};

const INDENT_PX = 14;
const ZOOM_STEPS = [0.85, 1, 1.15, 1.3] as const;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function AstCollapse({
  open,
  reducedMotion,
  marginLeft,
  children,
}: {
  open: boolean;
  reducedMotion: boolean;
  marginLeft: number;
  children: ReactNode;
}) {
  return (
    <div
      className={`cv-ast-collapse border-l border-[var(--border-cyan)] ${open ? 'cv-ast-collapse--open' : ''} ${reducedMotion ? 'cv-ast-collapse--reduced' : ''}`}
      style={{ marginLeft }}
      aria-hidden={!open}
    >
      <div className="cv-ast-collapse__inner">
        <div className="cv-ast-collapse__content">{children}</div>
      </div>
    </div>
  );
}

function AstRow({
  path,
  collapsed,
  onToggle,
  depth,
  label,
  children,
  sectionRow = false,
  reducedMotion,
}: {
  path: string;
  collapsed: boolean;
  onToggle: (path: string) => void;
  depth: number;
  label: ReactNode;
  children?: ReactNode;
  sectionRow?: boolean;
  reducedMotion: boolean;
}) {
  const hasChildren = children != null;
  const pad = depth * INDENT_PX;
  const open = hasChildren && !collapsed;

  return (
    <div className={sectionRow ? 'mt-2' : ''}>
      <button
        type="button"
        onClick={() => hasChildren && onToggle(path)}
        className={`flex w-full items-start gap-2 py-1 text-left font-mono ${
          sectionRow ? 'text-sm font-medium' : 'text-sm'
        } ${hasChildren ? 'cursor-pointer hover:text-[var(--accent-cyan)]' : 'cursor-default'}`}
        style={{ paddingLeft: pad }}
        aria-expanded={hasChildren ? open : undefined}
      >
        <span className="mt-0.5 w-3.5 shrink-0 text-[var(--text-muted)]">
          {hasChildren ? (
            <ChevronRight
              aria-hidden
              className={`cv-ast-chevron size-3.5 ${open ? 'cv-ast-chevron--open' : ''}`}
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 break-words text-[var(--text-primary)]">{label}</span>
      </button>
      {hasChildren ? (
        <AstCollapse open={open} reducedMotion={reducedMotion} marginLeft={pad + 8}>
          {children}
        </AstCollapse>
      ) : null}
    </div>
  );
}

function StringLeaf({
  depth,
  keyName,
  value,
  href,
}: {
  depth: number;
  keyName: string;
  value: string;
  href?: string;
}) {
  const pad = depth * INDENT_PX;
  const rendered =
    href != null ? (
      <a href={href} className="text-[var(--accent-cyan)] underline-offset-2 hover:underline">
        &quot;{value}&quot;
      </a>
    ) : (
      <span>&quot;{value}&quot;</span>
    );

  return (
    <div
      className="flex items-start gap-2 py-1 font-mono text-sm leading-relaxed"
      style={{ paddingLeft: pad + 22 }}
    >
      <span className="shrink-0 text-[var(--text-primary)]">{keyName}</span>
      <span className="min-w-0 text-[var(--text-muted)]">: {rendered}</span>
    </div>
  );
}

function ContactArray({
  depth,
  path,
  collapsed,
  onToggle,
  items,
  reducedMotion,
}: {
  depth: number;
  path: string;
  collapsed: boolean;
  onToggle: (path: string) => void;
  items: readonly CvContactLink[];
  reducedMotion: boolean;
}) {
  return (
    <AstRow
      path={path}
      collapsed={collapsed}
      onToggle={onToggle}
      depth={depth}
      label="contact"
      reducedMotion={reducedMotion}
    >
      {items.map((item, i) => (
        <StringLeaf
          key={item.literal}
          depth={depth + 1}
          keyName={`[${i}]`}
          value={item.literal}
          href={item.href}
        />
      ))}
    </AstRow>
  );
}

function CvHeaderPortrait({ name, portrait }: { name: string; portrait: string }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-4 border-b border-[var(--border-cyan)] pb-6 sm:flex-row sm:items-end sm:gap-6">
      <div className="relative shrink-0">
        <img
          src={portrait}
          alt=""
          width={152}
          height={152}
          className="size-[152px] border border-[var(--border-cyan)] object-cover object-[center_18%] shadow-[0_0_16px_color-mix(in_srgb,var(--accent-cyan)_20%,transparent)]"
        />
        <span className="pointer-events-none absolute -left-1 -top-1 size-3 border-l-2 border-t-2 border-[var(--crosshair)]" aria-hidden />
        <span className="pointer-events-none absolute -right-1 -top-1 size-3 border-r-2 border-t-2 border-[var(--crosshair)]" aria-hidden />
        <span className="pointer-events-none absolute -bottom-1 -left-1 size-3 border-b-2 border-l-2 border-[var(--crosshair)]" aria-hidden />
        <span className="pointer-events-none absolute -bottom-1 -right-1 size-3 border-b-2 border-r-2 border-[var(--crosshair)]" aria-hidden />
      </div>
      <h2 className="font-sans text-2xl font-bold tracking-wide text-[var(--text-primary)] sm:text-3xl">{name}</h2>
    </div>
  );
}

function ToolbarButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[var(--border-cyan)] px-2 py-1 text-[var(--text-muted)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]"
    >
      {children}
    </button>
  );
}

export default function CvAstOverlay({ onClose }: CvAstOverlayProps) {
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [zoomIndex, setZoomIndex] = useState(1);

  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  const toggle = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const isCollapsed = (path: string) => collapsed.has(path);

  const zoomOut = () => setZoomIndex((i) => Math.max(0, i - 1));
  const zoomIn = () => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { identity, experience, projects, technicalSkills, education } = cvDocument;
  const rootPath = 'CvDocument';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed bottom-0 left-0 right-0 top-14 z-30 overflow-y-auto bg-[color-mix(in_srgb,var(--bg-primary)_96%,transparent)] backdrop-blur-[2px] lg:top-[4.5rem] ${
        reducedMotion ? '' : 'cv-overlay-enter'
      }`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-10 -mx-4 border-b border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_96%,transparent)] px-4 py-2 font-mono text-xs backdrop-blur-[2px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span id={titleId} className="text-[var(--accent-cyan)]">
              [CV_AST_VIEWER]
            </span>
            <ToolbarButton onClick={onClose}>[X]</ToolbarButton>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ToolbarButton onClick={zoomOut}>[ZOOM −]</ToolbarButton>
            <span className="min-w-[3rem] text-center text-[var(--text-muted)]">{zoomLabel}</span>
            <ToolbarButton onClick={zoomIn}>[ZOOM +]</ToolbarButton>
            <ToolbarButton onClick={() => downloadResumePdf()}>[DOWNLOAD_CV_PDF]</ToolbarButton>
          </div>
        </div>

        <div
          className={`cv-ast-zoom-scaled ${reducedMotion ? '' : ''}`}
          style={{ transform: `scale(${zoom})` }}
        >
          <BlueprintCard className="bg-[var(--bg-surface)]">
            <h2 className="mb-4 font-sans text-2xl font-bold text-[var(--text-primary)]">CvDocument</h2>

            <CvHeaderPortrait name={identity.name} portrait={identity.portrait} />

            <p className="mb-6 font-mono text-[10px] text-[var(--text-muted)]">
              {'// Abstract syntax tree — canonical source: docs/myResume.md'}
            </p>

            <div className="flex flex-col gap-2">
              <AstRow
                path={`${rootPath}.identity`}
                collapsed={isCollapsed(`${rootPath}.identity`)}
                onToggle={toggle}
                depth={0}
                label="identity"
                sectionRow
                reducedMotion={reducedMotion}
              >
                <StringLeaf depth={1} keyName="location" value={identity.location} />
                <ContactArray
                  depth={1}
                  path={`${rootPath}.identity.contact`}
                  collapsed={isCollapsed(`${rootPath}.identity.contact`)}
                  onToggle={toggle}
                  items={identity.contact}
                  reducedMotion={reducedMotion}
                />
              </AstRow>

              <AstRow
                path={`${rootPath}.experience`}
                collapsed={isCollapsed(`${rootPath}.experience`)}
                onToggle={toggle}
                depth={0}
                label="experience"
                sectionRow
                reducedMotion={reducedMotion}
              >
                {experience.map((job, i) => {
                  const jobPath = `${rootPath}.experience[${i}]`;
                  return (
                    <AstRow
                      key={job.company}
                      path={jobPath}
                      collapsed={isCollapsed(jobPath)}
                      onToggle={toggle}
                      depth={1}
                      label={`[${i}]`}
                      reducedMotion={reducedMotion}
                    >
                      <StringLeaf depth={2} keyName="company" value={job.company} />
                      <StringLeaf depth={2} keyName="location" value={job.location} />
                      <StringLeaf depth={2} keyName="role" value={job.role} />
                      <StringLeaf depth={2} keyName="dates" value={job.dates} />
                      <AstRow
                        path={`${jobPath}.bullets`}
                        collapsed={isCollapsed(`${jobPath}.bullets`)}
                        onToggle={toggle}
                        depth={2}
                        label="bullets"
                        reducedMotion={reducedMotion}
                      >
                        {job.bullets.map((bullet, bi) => (
                          <StringLeaf key={bullet.slice(0, 24)} depth={3} keyName={`[${bi}]`} value={bullet} />
                        ))}
                      </AstRow>
                    </AstRow>
                  );
                })}
              </AstRow>

              <AstRow
                path={`${rootPath}.projects`}
                collapsed={isCollapsed(`${rootPath}.projects`)}
                onToggle={toggle}
                depth={0}
                label="projects"
                sectionRow
                reducedMotion={reducedMotion}
              >
                {projects.map((project, i) => {
                  const projPath = `${rootPath}.projects[${i}]`;
                  return (
                    <AstRow
                      key={project.name}
                      path={projPath}
                      collapsed={isCollapsed(projPath)}
                      onToggle={toggle}
                      depth={1}
                      label={`[${i}]`}
                      reducedMotion={reducedMotion}
                    >
                      <StringLeaf depth={2} keyName="name" value={project.name} />
                      {'role' in project && project.role != null ? (
                        <StringLeaf depth={2} keyName="role" value={project.role} />
                      ) : null}
                      <StringLeaf depth={2} keyName="stack" value={project.stack} />
                      <StringLeaf depth={2} keyName="dates" value={project.dates} />
                      <AstRow
                        path={`${projPath}.bullets`}
                        collapsed={isCollapsed(`${projPath}.bullets`)}
                        onToggle={toggle}
                        depth={2}
                        label="bullets"
                        reducedMotion={reducedMotion}
                      >
                        {project.bullets.map((bullet, bi) => (
                          <StringLeaf key={bullet.slice(0, 24)} depth={3} keyName={`[${bi}]`} value={bullet} />
                        ))}
                      </AstRow>
                    </AstRow>
                  );
                })}
              </AstRow>

              <AstRow
                path={`${rootPath}.technicalSkills`}
                collapsed={isCollapsed(`${rootPath}.technicalSkills`)}
                onToggle={toggle}
                depth={0}
                label="technicalSkills"
                sectionRow
                reducedMotion={reducedMotion}
              >
                <StringLeaf depth={1} keyName="languages" value={technicalSkills.languages} />
                <StringLeaf depth={1} keyName="frameworksWeb" value={technicalSkills.frameworksWeb} />
                <StringLeaf depth={1} keyName="databasesMiddleware" value={technicalSkills.databasesMiddleware} />
                <StringLeaf depth={1} keyName="devops" value={technicalSkills.devops} />
                <StringLeaf depth={1} keyName="securityTools" value={technicalSkills.securityTools} />
              </AstRow>

              <AstRow
                path={`${rootPath}.education`}
                collapsed={isCollapsed(`${rootPath}.education`)}
                onToggle={toggle}
                depth={0}
                label="education"
                sectionRow
                reducedMotion={reducedMotion}
              >
                <StringLeaf depth={1} keyName="school" value={education.school} />
                <StringLeaf depth={1} keyName="location" value={education.location} />
                <StringLeaf depth={1} keyName="degree" value={education.degree} />
                <StringLeaf depth={1} keyName="expected" value={education.expected} />
                <StringLeaf depth={1} keyName="academicExemptions" value={education.academicExemptions} />
                <AstRow
                  path={`${rootPath}.education.certifications`}
                  collapsed={isCollapsed(`${rootPath}.education.certifications`)}
                  onToggle={toggle}
                  depth={1}
                  label="certifications"
                  reducedMotion={reducedMotion}
                >
                  {education.certifications.map((cert, ci) => {
                    const certPath = `${rootPath}.education.certifications[${ci}]`;
                    return (
                      <AstRow
                        key={cert.title}
                        path={certPath}
                        collapsed={isCollapsed(certPath)}
                        onToggle={toggle}
                        depth={2}
                        label={`[${ci}]`}
                        reducedMotion={reducedMotion}
                      >
                        <StringLeaf depth={3} keyName="title" value={cert.title} />
                        <StringLeaf depth={3} keyName="body" value={cert.body} />
                      </AstRow>
                    );
                  })}
                </AstRow>
              </AstRow>
            </div>
          </BlueprintCard>
        </div>
      </div>
    </div>
  );
}
