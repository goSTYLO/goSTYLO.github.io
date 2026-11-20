import { useEffect, useState } from 'react';
import { useContent } from '@/content/ContentContext';
import { buildSeed } from '@/content/buildSeed';
import { SECTION_ORDER, type CertificationEntry, type EducationEntry, type PortfolioContent, type PortfolioProject } from '@/content/types';
import type { CvExperience, CvProject } from '@/data/cv';
import { encodeWebp } from '@/lib/encodeWebp';
import { go } from '@/lib/route';
import { uploadAsset } from '@/lib/uploadAsset';

type Session = { authenticated: boolean; bypass: boolean; storage: 'file' | 'blob' };
type Tab = 'profile' | 'sections' | 'projects' | 'education' | 'certifications' | 'skills' | 'cv';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'sections', label: 'SECTIONS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'cv', label: 'CV' },
];

const control =
  'inline-flex min-h-11 items-center justify-center border border-[var(--border-cyan)] px-3 font-mono text-xs text-[var(--text-primary)]';
const field =
  'min-h-11 w-full border border-[var(--border-cyan)] bg-[var(--bg-surface)] px-3 font-mono text-sm text-[var(--text-primary)]';

async function readSession(): Promise<Session> {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  if (!res.ok) return { authenticated: false, bypass: false, storage: 'file' };
  return (await res.json()) as Session;
}

export default function AdminConsole() {
  const { setContent } = useContent();
  const [session, setSession] = useState<Session | null>(null);
  const [draft, setDraft] = useState<PortfolioContent | null>(null);
  const [tab, setTab] = useState<Tab>('profile');
  const [status, setStatus] = useState('READY');
  const [code, setCode] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      let next = await readSession();
      if (!next.authenticated && next.bypass) {
        const res = await fetch('/api/auth/dev-session', { method: 'POST' });
        if (res.ok) next = (await res.json()) as Session;
      }
      let doc = buildSeed();
      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        if (res.ok) doc = (await res.json()) as PortfolioContent;
      } catch {
        /* seed */
      }
      if (cancel) return;
      setSession(next);
      setDraft(doc);
      setContent(doc);
    })();
    return () => {
      cancel = true;
    };
  }, [setContent]);

  async function submitPin() {
    setStatus('CHECKING_PIN');
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      setStatus('CODE_REJECTED');
      return;
    }
    setSession((await res.json()) as Session);
    setStatus('READY');
  }

  async function signOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    go('/');
  }

  async function save() {
    if (!draft) return;
    setStatus('SAVING');
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      setStatus('SAVE_FAILED');
      return;
    }
    const saved = (await res.json()) as PortfolioContent;
    setDraft(saved);
    setContent(saved);
    setStatus('SAVED');
  }

  if (!session || !draft) {
    return (
      <div data-testid="admin-shell" className="p-4 font-mono text-xs text-[var(--text-muted)]">
        AUTH: CHECKING
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <div data-testid="pin-sheet" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-end gap-3 p-4 pb-8">
        <p className="font-mono text-xs text-[var(--accent-cyan)]">[ADMIN_PIN]</p>
        <p className="font-sans text-sm text-[var(--text-muted)]">
          Enter the 6-digit code from Microsoft Authenticator.
        </p>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className={field}
          aria-label="Authenticator code"
        />
        <button type="button" className={control} onClick={() => void submitPin()}>
          [VERIFY]
        </button>
        <p className="font-mono text-xs text-[var(--text-muted)]">{status}</p>
      </div>
    );
  }

  return (
    <div data-testid="admin-shell" className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border-cyan)] bg-[var(--bg-primary)] px-4 py-3">
        <p className="font-mono text-xs text-[var(--accent-cyan)]">[ADMIN_CONSOLE]</p>
        <button type="button" className={control} data-testid="sign-out" onClick={() => void signOut()}>
          [SIGN_OUT]
        </button>
      </header>
      {session.bypass ? (
        <p data-testid="dev-bypass" className="px-4 pt-3 font-mono text-[10px] text-[var(--accent-cyan)]">
          DEV AUTH BYPASS
        </p>
      ) : null}
      <main className="mx-auto w-full max-w-3xl px-4 py-4 pb-40">
        {tab === 'profile' ? <ProfilePanel draft={draft} setDraft={setDraft} /> : null}
        {tab === 'sections' ? <SectionsPanel draft={draft} setDraft={setDraft} /> : null}
        {tab === 'projects' ? (
          <ProjectsPanel draft={draft} setDraft={setDraft} storage={session.storage} />
        ) : null}
        {tab === 'education' ? <EducationPanel draft={draft} setDraft={setDraft} /> : null}
        {tab === 'certifications' ? <CertPanel draft={draft} setDraft={setDraft} storage={session.storage} /> : null}
        {tab === 'skills' ? <SkillsPanel draft={draft} setDraft={setDraft} /> : null}
        {tab === 'cv' ? <CvPanel draft={draft} setDraft={setDraft} storage={session.storage} /> : null}
      </main>
      <div
        data-testid="save-bar"
        className="sticky bottom-0 z-30 border-t border-[var(--border-cyan)] bg-[var(--bg-primary)] px-4 py-3"
      >
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`admin-tab-${item.id}`}
              className={`${control} shrink-0 ${tab === item.id ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : ''}`}
              onClick={() => setTab(item.id)}
            >
              [{item.label}]
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-[var(--text-muted)]">{status}</p>
          <button type="button" className={control} onClick={() => void save()}>
            [SAVE]
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  const set = (key: 'name' | 'roleTitle' | 'subtitle' | 'location' | 'email' | 'phone' | 'githubUrl') =>
    (value: string) => setDraft({ ...draft, profile: { ...draft.profile, [key]: value } });
  return (
    <div className="flex flex-col gap-3">
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        NAME
        <input data-testid="profile-name" className={field} value={draft.profile.name} onChange={(e) => set('name')(e.target.value)} />
      </label>
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        ROLE
        <input className={field} value={draft.profile.roleTitle} onChange={(e) => set('roleTitle')(e.target.value)} />
      </label>
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        SUBTITLE
        <textarea
          data-testid="profile-subtitle"
          className={`${field} min-h-28 py-2`}
          value={draft.profile.subtitle}
          onChange={(e) => set('subtitle')(e.target.value)}
        />
      </label>
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        LOCATION
        <input className={field} value={draft.profile.location} onChange={(e) => set('location')(e.target.value)} />
      </label>
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        EMAIL
        <input className={field} value={draft.profile.email} onChange={(e) => set('email')(e.target.value)} />
      </label>
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        PHONE
        <input className={field} value={draft.profile.phone} onChange={(e) => set('phone')(e.target.value)} />
      </label>
      <label className="font-mono text-[10px] text-[var(--text-muted)]">
        GITHUB
        <input className={field} value={draft.profile.githubUrl} onChange={(e) => set('githubUrl')(e.target.value)} />
      </label>
    </div>
  );
}

function SectionsPanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {SECTION_ORDER.map((id) => (
        <li key={id}>
          <label className="flex min-h-11 items-center gap-3 border border-[var(--border-cyan)] px-3 font-mono text-xs">
            <input
              data-testid={`toggle-${id}`}
              type="checkbox"
              className="size-5"
              checked={draft.sections[id].enabled}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  sections: {
                    ...draft.sections,
                    [id]: { ...draft.sections[id], enabled: event.target.checked },
                  },
                })
              }
            />
            [{draft.sections[id].navLabel}] {id}
          </label>
        </li>
      ))}
    </ul>
  );
}

function ProjectsPanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  const sorted = [...draft.projects].sort((a, b) => a.order - b.order);

  function commit(projects: PortfolioProject[]) {
    setDraft({ ...draft, projects: projects.map((project, order) => ({ ...project, order })) });
  }

  function add() {
    const project: PortfolioProject = {
      id: `project-${Date.now()}`,
      title: 'New system',
      status: 'ACTIVE',
      nda: false,
      context: 'ACADEMIC',
      domains: ['WEB'],
      roleTag: 'BUILD',
      roleTitle: 'Developer',
      roleSummary: '',
      summary: '',
      stack: [],
      features: [],
      hosting: [],
      links: [],
      images: [],
      order: sorted.length,
    };
    commit([...sorted, project]);
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= sorted.length) return;
    const copy = [...sorted];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    commit(copy);
  }

  async function onImage(projectId: string, file: File | undefined) {
    if (!file) return;
    const encoded = await encodeWebp(file);
    const webp = new File([encoded.blob], 'image.webp', { type: 'image/webp' });
    const stored = await uploadAsset(webp, 'image.webp', storage);
    commit(
      sorted.map((project) =>
        project.id === projectId
          ? {
              ...project,
              images: [
                ...project.images,
                {
                  src: stored.url,
                  alt: project.title,
                  caption: '[SHOT] Upload',
                  layout: 'wide' as const,
                  pathname: stored.pathname,
                },
              ],
            }
          : project,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" className={control} data-testid="add-project" onClick={add}>
        [ADD_PROJECT]
      </button>
      {sorted.map((project, index) => (
        <article key={project.id} data-testid="project-card" data-project-id={project.id} className="flex flex-col gap-2 border border-[var(--border-cyan)] p-3">
          <input
            data-testid={`title-${project.id}`}
            className={field}
            value={project.title}
            aria-label={`Title ${project.title}`}
            onChange={(event) =>
              commit(sorted.map((item) => (item.id === project.id ? { ...item, title: event.target.value } : item)))
            }
          />
          <textarea
            className={`${field} min-h-20 py-2`}
            value={project.summary}
            aria-label={`Summary ${project.title}`}
            onChange={(event) =>
              commit(sorted.map((item) => (item.id === project.id ? { ...item, summary: event.target.value } : item)))
            }
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={control} data-testid={`up-${project.id}`} onClick={() => move(index, -1)}>
              [UP]
            </button>
            <button type="button" className={control} data-testid={`down-${project.id}`} onClick={() => move(index, 1)}>
              [DOWN]
            </button>
            <button
              type="button"
              className={control}
              data-testid={`star-${project.id}`}
              aria-pressed={Boolean(project.featured)}
              onClick={() =>
                commit(sorted.map((item) => (item.id === project.id ? { ...item, featured: !item.featured } : item)))
              }
            >
              {project.featured ? '[UNSTAR]' : '[STAR]'}
            </button>
            <button
              type="button"
              className={control}
              data-testid={`delete-${project.id}`}
              onClick={() => commit(sorted.filter((item) => item.id !== project.id))}
            >
              [DELETE]
            </button>
          </div>
          <label className="font-mono text-[10px] text-[var(--text-muted)]">
            IMAGE
            <input
              data-testid={`image-${project.id}`}
              className="mt-1 block w-full text-xs"
              type="file"
              accept="image/*"
              onChange={(event) => void onImage(project.id, event.target.files?.[0])}
            />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {project.images.map((image) => (
              <img
                key={image.src}
                data-testid={`preview-${project.id}`}
                src={image.src}
                alt={image.alt}
                width={160}
                height={100}
                className="h-24 w-40 object-cover"
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function EducationPanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  const sorted = [...draft.education].sort((a, b) => a.order - b.order);
  function commit(education: EducationEntry[]) {
    setDraft({ ...draft, education: education.map((entry, order) => ({ ...entry, order })) });
  }
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className={control}
        data-testid="add-education"
        onClick={() =>
          commit([
            ...sorted,
            { id: `edu-${Date.now()}`, school: '', location: '', credential: '', dates: '', details: '', order: sorted.length },
          ])
        }
      >
        [ADD_EDUCATION]
      </button>
      {sorted.map((entry) => (
        <label key={entry.id} className="font-mono text-[10px] text-[var(--text-muted)]">
          SCHOOL
          <input
            data-testid="education-school"
            className={field}
            value={entry.school}
            onChange={(event) =>
              commit(sorted.map((item) => (item.id === entry.id ? { ...item, school: event.target.value } : item)))
            }
          />
        </label>
      ))}
    </div>
  );
}

function CertPanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  const sorted = [...draft.certifications].sort((a, b) => a.order - b.order);

  function commit(certifications: CertificationEntry[]) {
    setDraft({ ...draft, certifications: certifications.map((entry, order) => ({ ...entry, order })) });
  }

  function patch(id: string, next: Partial<CertificationEntry>) {
    commit(sorted.map((item) => (item.id === id ? { ...item, ...next } : item)));
  }

  async function onImage(entry: CertificationEntry, file: File | undefined) {
    if (!file) return;
    const encoded = await encodeWebp(file);
    const webp = new File([encoded.blob], 'image.webp', { type: 'image/webp' });
    const stored = await uploadAsset(webp, 'image.webp', storage);
    patch(entry.id, {
      image: {
        src: stored.url,
        alt: entry.title || 'Certificate',
        caption: entry.title,
        pathname: stored.pathname,
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className={control}
        data-testid="add-certification"
        onClick={() =>
          commit([
            ...sorted,
            { id: `cert-${Date.now()}`, title: '', issuer: '', issued: '', summary: '', image: null, order: sorted.length },
          ])
        }
      >
        [ADD_CERTIFICATION]
      </button>
      {sorted.map((entry) => (
        <article key={entry.id} className="flex flex-col gap-2 border border-[var(--border-cyan)] p-3">
          <label className="font-mono text-[10px] text-[var(--text-muted)]">
            TITLE
            <input data-testid="cert-title" className={field} value={entry.title} onChange={(event) => patch(entry.id, { title: event.target.value })} />
          </label>
          <label className="font-mono text-[10px] text-[var(--text-muted)]">
            ISSUER
            <input className={field} value={entry.issuer} onChange={(event) => patch(entry.id, { issuer: event.target.value })} />
          </label>
          <label className="font-mono text-[10px] text-[var(--text-muted)]">
            ISSUED
            <input className={field} value={entry.issued} onChange={(event) => patch(entry.id, { issued: event.target.value })} />
          </label>
          <label className="font-mono text-[10px] text-[var(--text-muted)]">
            SUMMARY
            <textarea className={`${field} min-h-20 py-2`} value={entry.summary} onChange={(event) => patch(entry.id, { summary: event.target.value })} />
          </label>
          <label className="font-mono text-[10px] text-[var(--text-muted)]">
            IMAGE
            <input
              data-testid="cert-image"
              className="mt-1 block w-full text-xs"
              type="file"
              accept="image/*"
              onChange={(event) => void onImage(entry, event.target.files?.[0])}
            />
          </label>
          {entry.image?.src ? (
            <img data-testid="cert-preview" src={entry.image.src} alt="" className="aspect-[16/10] w-full max-w-xs object-cover" />
          ) : null}
          {entry.image?.src ? (
            <button type="button" className={control} onClick={() => patch(entry.id, { image: null })}>
              [REMOVE_IMAGE]
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function SkillsPanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  return (
    <label className="font-mono text-[10px] text-[var(--text-muted)]">
      LANGUAGES
      <textarea
        data-testid="skill-languages"
        className={`${field} min-h-28 py-2`}
        value={draft.skills.languages}
        onChange={(event) => setDraft({ ...draft, skills: { ...draft.skills, languages: event.target.value } })}
      />
    </label>
  );
}

function CvPanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  function setCv(next: { experience?: CvExperience[]; projects?: CvProject[] }) {
    setDraft({
      ...draft,
      cv: {
        experience: next.experience ?? draft.cv.experience,
        projects: next.projects ?? draft.cv.projects,
      },
    });
  }

  function patchJob(index: number, job: CvExperience) {
    setCv({ experience: draft.cv.experience.map((item, i) => (i === index ? job : item)) });
  }

  function patchProject(index: number, project: CvProject) {
    setCv({ projects: draft.cv.projects.map((item, i) => (i === index ? project : item)) });
  }

  async function onPdf(file: File | undefined) {
    if (!file) return;
    const stored = await uploadAsset(file, 'resume.pdf', storage);
    setDraft({
      ...draft,
      cvPdf: {
        url: stored.url,
        pathname: stored.pathname,
        downloadFileName: draft.cvPdf?.downloadFileName || 'Aaron_Tamayo_Portfolio_CV.pdf',
      },
    });
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="font-sans text-sm text-[var(--text-muted)]">
        The on-site CV editor changes the viewer. The PDF upload changes only the downloadable file. Saving one does not replace the other.
      </p>
      <section className="flex flex-col gap-3" data-testid="cv-section-experience">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-mono text-xs text-[var(--accent-cyan)]">[EXPERIENCE]</h2>
          <button
            type="button"
            className={control}
            onClick={() =>
              setCv({
                experience: [...draft.cv.experience, { company: '', location: '', role: '', dates: '', bullets: [''] }],
              })
            }
          >
            [ADD_ROLE]
          </button>
        </div>
        {draft.cv.experience.map((job, index) => (
          <article key={`role-${index}`} className="flex flex-col gap-2 border border-[var(--border-cyan)] p-3">
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              COMPANY
              <input className={field} value={job.company} onChange={(event) => patchJob(index, { ...job, company: event.target.value })} />
            </label>
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              LOCATION
              <input className={field} value={job.location} onChange={(event) => patchJob(index, { ...job, location: event.target.value })} />
            </label>
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              ROLE
              <input className={field} value={job.role} onChange={(event) => patchJob(index, { ...job, role: event.target.value })} />
            </label>
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              DATES
              <input className={field} value={job.dates} onChange={(event) => patchJob(index, { ...job, dates: event.target.value })} />
            </label>
            {job.bullets.map((bullet, bulletIndex) => (
              <label key={bulletIndex} className="font-mono text-[10px] text-[var(--text-muted)]">
                BULLET {bulletIndex + 1}
                <textarea
                  data-testid={index === 0 && bulletIndex === 0 ? 'cv-bullet' : undefined}
                  className={`${field} min-h-20 py-2`}
                  value={bullet}
                  onChange={(event) =>
                    patchJob(index, {
                      ...job,
                      bullets: job.bullets.map((item, i) => (i === bulletIndex ? event.target.value : item)),
                    })
                  }
                />
              </label>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={control} onClick={() => patchJob(index, { ...job, bullets: [...job.bullets, ''] })}>
                [ADD_BULLET]
              </button>
              <button
                type="button"
                className={control}
                onClick={() => setCv({ experience: draft.cv.experience.filter((_, i) => i !== index) })}
              >
                [REMOVE_ROLE]
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="flex flex-col gap-3" data-testid="cv-section-projects">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-mono text-xs text-[var(--accent-cyan)]">[PROJECTS]</h2>
          <button
            type="button"
            className={control}
            onClick={() =>
              setCv({
                projects: [...draft.cv.projects, { name: '', role: '', stack: '', dates: '', bullets: [''] }],
              })
            }
          >
            [ADD_CV_PROJECT]
          </button>
        </div>
        {draft.cv.projects.map((project, index) => (
          <article key={`cv-project-${index}`} className="flex flex-col gap-2 border border-[var(--border-cyan)] p-3">
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              NAME
              <input className={field} value={project.name} onChange={(event) => patchProject(index, { ...project, name: event.target.value })} />
            </label>
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              ROLE
              <input className={field} value={project.role ?? ''} onChange={(event) => patchProject(index, { ...project, role: event.target.value })} />
            </label>
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              STACK
              <input className={field} value={project.stack} onChange={(event) => patchProject(index, { ...project, stack: event.target.value })} />
            </label>
            <label className="font-mono text-[10px] text-[var(--text-muted)]">
              DATES
              <input className={field} value={project.dates} onChange={(event) => patchProject(index, { ...project, dates: event.target.value })} />
            </label>
            {project.bullets.map((bullet, bulletIndex) => (
              <label key={bulletIndex} className="font-mono text-[10px] text-[var(--text-muted)]">
                BULLET {bulletIndex + 1}
                <textarea
                  className={`${field} min-h-20 py-2`}
                  value={bullet}
                  onChange={(event) =>
                    patchProject(index, {
                      ...project,
                      bullets: project.bullets.map((item, i) => (i === bulletIndex ? event.target.value : item)),
                    })
                  }
                />
              </label>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={control} onClick={() => patchProject(index, { ...project, bullets: [...project.bullets, ''] })}>
                [ADD_BULLET]
              </button>
              <button
                type="button"
                className={control}
                onClick={() => setCv({ projects: draft.cv.projects.filter((_, i) => i !== index) })}
              >
                [REMOVE_CV_PROJECT]
              </button>
            </div>
          </article>
        ))}
      </section>
      <section data-testid="cv-section-pdf">
        <p className="font-mono text-[10px] text-[var(--text-muted)]">[DOWNLOADABLE PDF]</p>
        <p data-testid="cv-pdf-url" className="mt-1 break-all font-mono text-xs">
          {draft.cvPdf?.url ?? ''}
        </p>
        <input
          data-testid="cv-pdf-file"
          className="mt-2 block w-full text-xs"
          type="file"
          accept="application/pdf"
          onChange={(event) => void onPdf(event.target.files?.[0])}
        />
      </section>
    </div>
  );
}
