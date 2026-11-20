import { useMemo, useState } from 'react';
import BlueprintCard from '@/components/common/BlueprintCard';
import {
  SECTION_ORDER,
  type CertificationEntry,
  type EducationEntry,
  type PortfolioContent,
  type PortfolioProject,
  type SectionId,
} from '@/content/types';
import type { CvExperience, CvProject } from '@/data/cv';
import type { DomainTag, ProjectContext, ProjectStatus } from '@/data/projects';
import { encodeWebp } from '@/lib/encodeWebp';
import { uploadAsset } from '@/lib/uploadAsset';
import AdminSortableIds from '@/components/admin/AdminSortableIds';
import {
  adminControl,
  adminField,
  adminLabel,
  joinSkillTokens,
  parseSkillTokens,
} from '@/components/admin/adminChrome';

export type AdminTab = 'profile' | 'sections' | 'projects' | 'education' | 'certifications' | 'skills' | 'cv';

function StudioWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <BlueprintCard className="flex flex-col gap-4 p-4 sm:p-6">
      <p className="font-mono text-xs text-[var(--accent-cyan)]">{title}</p>
      {children}
    </BlueprintCard>
  );
}

function Field({
  label,
  children,
  testId,
}: {
  label: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <label data-testid={testId} className={`${adminLabel} flex flex-col gap-1`}>
      {label}
      {children}
    </label>
  );
}

function linesFromArray(items: string[]): string {
  return items.join('\n');
}

function arrayFromLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayFromCsv(text: string): string[] {
  return text
    .split(/[,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ProfilePanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  const profile = draft.profile;
  const set = (key: keyof typeof profile) => (value: string) =>
    setDraft({ ...draft, profile: { ...profile, [key]: value } });

  async function onPortrait(file: File | undefined) {
    if (!file) return;
    const encoded = await encodeWebp(file);
    const webp = new File([encoded.blob], 'portrait.webp', { type: 'image/webp' });
    const stored = await uploadAsset(webp, 'portrait.webp', storage);
    setDraft({
      ...draft,
      profile: { ...profile, portraitUrl: stored.url, portraitPathname: stored.pathname },
    });
  }

  return (
    <StudioWindow title="[PROFILE]">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="NAME">
          <input data-testid="profile-name" className={adminField} value={profile.name} onChange={(e) => set('name')(e.target.value)} />
        </Field>
        <Field label="ROLE">
          <input className={adminField} value={profile.roleTitle} onChange={(e) => set('roleTitle')(e.target.value)} />
        </Field>
        <Field label="LOCATION">
          <input className={adminField} value={profile.location} onChange={(e) => set('location')(e.target.value)} />
        </Field>
        <Field label="EMAIL">
          <input className={adminField} value={profile.email} onChange={(e) => set('email')(e.target.value)} />
        </Field>
        <Field label="PHONE">
          <input className={adminField} value={profile.phone} onChange={(e) => set('phone')(e.target.value)} />
        </Field>
        <Field label="PHONE_TEL">
          <input className={adminField} value={profile.phoneTel} onChange={(e) => set('phoneTel')(e.target.value)} />
        </Field>
        <Field label="GITHUB">
          <input className={adminField} value={profile.githubUrl} onChange={(e) => set('githubUrl')(e.target.value)} />
        </Field>
        <Field label="GITHUB_LABEL">
          <input className={adminField} value={profile.githubLabel} onChange={(e) => set('githubLabel')(e.target.value)} />
        </Field>
        <Field label="COPYRIGHT">
          <input className={adminField} value={profile.copyrightLine} onChange={(e) => set('copyrightLine')(e.target.value)} />
        </Field>
        <Field label="MAILTO_SUBJECT">
          <input className={adminField} value={profile.mailtoSubject} onChange={(e) => set('mailtoSubject')(e.target.value)} />
        </Field>
      </div>
      <Field label="SUBTITLE">
        <textarea
          data-testid="profile-subtitle"
          className={`${adminField} min-h-28 py-2`}
          value={profile.subtitle}
          onChange={(e) => set('subtitle')(e.target.value)}
        />
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {profile.portraitUrl ? (
          <img src={profile.portraitUrl} alt="" className="h-32 w-32 object-cover border border-[var(--border-cyan)]" />
        ) : null}
        <div className="flex flex-col gap-2">
          <label className={adminLabel}>
            PORTRAIT
            <input className="mt-1 block w-full text-xs" type="file" accept="image/*" onChange={(e) => void onPortrait(e.target.files?.[0])} />
          </label>
          {profile.portraitUrl ? (
            <button type="button" className={adminControl} onClick={() => setDraft({ ...draft, profile: { ...profile, portraitUrl: '', portraitPathname: undefined } })}>
              [CLEAR_PORTRAIT]
            </button>
          ) : null}
        </div>
      </div>
    </StudioWindow>
  );
}

export function SectionsPanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  return (
    <StudioWindow title="[SECTIONS]">
      <ul className="flex flex-col gap-2">
        {SECTION_ORDER.map((id: SectionId) => (
          <li key={id}>
            <div className="flex min-h-11 flex-col gap-2 border border-[var(--border-cyan)] px-3 py-2 sm:flex-row sm:items-center">
              <label className="flex min-h-11 flex-1 items-center gap-3 font-mono text-xs">
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
                [{draft.sections[id].navLabel || id.toUpperCase()}]
              </label>
              <input
                className={`${adminField} sm:max-w-xs`}
                aria-label={`Nav label ${id}`}
                value={draft.sections[id].navLabel}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    sections: {
                      ...draft.sections,
                      [id]: { ...draft.sections[id], navLabel: event.target.value },
                    },
                  })
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </StudioWindow>
  );
}

const STATUS_OPTS: ProjectStatus[] = ['ONLINE', 'ACTIVE', 'COMPLETE'];
const CONTEXT_OPTS: ProjectContext[] = ['INDUSTRY_NDA', 'CAPSTONE', 'ACADEMIC'];
const DOMAIN_OPTS: DomainTag[] = ['WEB', 'MOBILE', 'CLOUD'];

export function ProjectsPanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  const sorted = useMemo(() => [...draft.projects].sort((a, b) => a.order - b.order), [draft.projects]);
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const selected = sorted.find((p) => p.id === selectedId) ?? sorted[0] ?? null;

  function commit(projects: PortfolioProject[]) {
    setDraft({ ...draft, projects: projects.map((project, order) => ({ ...project, order })) });
  }

  function patch(id: string, next: Partial<PortfolioProject>) {
    commit(sorted.map((item) => (item.id === id ? { ...item, ...next } : item)));
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
    setSelectedId(project.id);
  }

  async function onImage(projectId: string, file: File | undefined) {
    if (!file) return;
    const encoded = await encodeWebp(file);
    const webp = new File([encoded.blob], 'image.webp', { type: 'image/webp' });
    const stored = await uploadAsset(webp, 'image.webp', storage);
    const project = sorted.find((p) => p.id === projectId);
    if (!project) return;
    patch(projectId, {
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
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminControl} data-testid="add-project" onClick={add}>
          [ADD_PROJECT]
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto border border-[var(--border-cyan)] p-2">
        <AdminSortableIds
          items={sorted}
          onReorder={commit}
          renderPlate={(project) => (
            <button
              type="button"
              data-testid="project-card"
              data-project-id={project.id}
              className={`flex min-h-11 w-full items-center justify-between gap-2 border px-3 font-mono text-xs ${
                selected?.id === project.id ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'border-[var(--border-cyan)]'
              }`}
              onClick={() => setSelectedId(project.id)}
            >
              <span className="truncate text-left">{project.title || '[UNTITLED]'}</span>
              {project.featured ? <span className="shrink-0 text-[10px]">[FEATURED]</span> : null}
            </button>
          )}
        />
      </div>
      {selected ? (
        <article data-testid="project-detail" data-project-id={selected.id} className="flex flex-col gap-3">
          <StudioWindow title={`[PROJECT] ${selected.title || selected.id}`}>
            <Field label="TITLE">
              <input
                data-testid={`title-${selected.id}`}
                className={adminField}
                value={selected.title}
                onChange={(e) => patch(selected.id, { title: e.target.value })}
              />
            </Field>
            <Field label="SUMMARY">
              <textarea className={`${adminField} min-h-20 py-2`} value={selected.summary} onChange={(e) => patch(selected.id, { summary: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="STATUS">
                <select className={adminField} value={selected.status} onChange={(e) => patch(selected.id, { status: e.target.value as ProjectStatus })}>
                  {STATUS_OPTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="CONTEXT">
                <select className={adminField} value={selected.context} onChange={(e) => patch(selected.id, { context: e.target.value as ProjectContext })}>
                  {CONTEXT_OPTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="ROLE_TAG">
                <input className={adminField} value={selected.roleTag} onChange={(e) => patch(selected.id, { roleTag: e.target.value })} />
              </Field>
              <Field label="ROLE_TITLE">
                <input className={adminField} value={selected.roleTitle} onChange={(e) => patch(selected.id, { roleTitle: e.target.value })} />
              </Field>
            </div>
            <Field label="ROLE_SUMMARY">
              <textarea className={`${adminField} min-h-16 py-2`} value={selected.roleSummary} onChange={(e) => patch(selected.id, { roleSummary: e.target.value })} />
            </Field>
            <Field label="DOMAINS">
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTS.map((domain) => (
                  <label key={domain} className="flex items-center gap-2 font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={selected.domains.includes(domain)}
                      onChange={(e) => {
                        const domains = e.target.checked
                          ? [...selected.domains, domain]
                          : selected.domains.filter((d) => d !== domain);
                        patch(selected.id, { domains });
                      }}
                    />
                    {domain}
                  </label>
                ))}
              </div>
            </Field>
            <label className="flex min-h-11 items-center gap-3 font-mono text-xs">
              <input type="checkbox" checked={selected.nda} onChange={(e) => patch(selected.id, { nda: e.target.checked })} />
              NDA
            </label>
            <Field label="STACK (comma)">
              <input className={adminField} value={selected.stack.join(', ')} onChange={(e) => patch(selected.id, { stack: arrayFromCsv(e.target.value) })} />
            </Field>
            <Field label="FEATURES (one per line)">
              <textarea className={`${adminField} min-h-24 py-2`} value={linesFromArray(selected.features)} onChange={(e) => patch(selected.id, { features: arrayFromLines(e.target.value) })} />
            </Field>
            <Field label="HOSTING (comma)">
              <input className={adminField} value={selected.hosting.join(', ')} onChange={(e) => patch(selected.id, { hosting: arrayFromCsv(e.target.value) })} />
            </Field>
            <div className="flex flex-col gap-2">
              <p className={adminLabel}>LINKS</p>
              {selected.links.map((link, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input className={adminField} placeholder="LABEL" value={link.label} onChange={(e) => patch(selected.id, { links: selected.links.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)) })} />
                  <input className={adminField} placeholder="HREF" value={link.href ?? ''} onChange={(e) => patch(selected.id, { links: selected.links.map((l, i) => (i === index ? { ...l, href: e.target.value || null } : l)) })} />
                  <button type="button" className={adminControl} onClick={() => patch(selected.id, { links: selected.links.filter((_, i) => i !== index) })}>
                    [REMOVE]
                  </button>
                </div>
              ))}
              <button type="button" className={adminControl} onClick={() => patch(selected.id, { links: [...selected.links, { label: 'LINK', href: '' }] })}>
                [ADD_LINK]
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={adminControl}
                data-testid={`star-${selected.id}`}
                aria-pressed={Boolean(selected.featured)}
                onClick={() => patch(selected.id, { featured: !selected.featured })}
              >
                {selected.featured ? '[UNSTAR]' : '[STAR]'}
              </button>
              <button
                type="button"
                className={adminControl}
                data-testid={`delete-${selected.id}`}
                onClick={() => {
                  commit(sorted.filter((item) => item.id !== selected.id));
                  setSelectedId(sorted.find((p) => p.id !== selected.id)?.id ?? null);
                }}
              >
                [DELETE]
              </button>
            </div>
            <Field label="IMAGE">
              <input
                data-testid={`image-${selected.id}`}
                className="mt-1 block w-full text-xs"
                type="file"
                accept="image/*"
                onChange={(e) => void onImage(selected.id, e.target.files?.[0])}
              />
            </Field>
            <div className="flex gap-2 overflow-x-auto">
              {selected.images.map((image, imageIndex) => (
                <div key={`${image.src}-${imageIndex}`} className="relative">
                  <img data-testid={`preview-${selected.id}`} src={image.src} alt={image.alt} width={160} height={100} className="h-24 w-40 object-cover" />
                  <button
                    type="button"
                    className={`${adminControl} mt-1 w-full`}
                    onClick={() => patch(selected.id, { images: selected.images.filter((_, i) => i !== imageIndex) })}
                  >
                    [REMOVE_IMAGE]
                  </button>
                </div>
              ))}
            </div>
          </StudioWindow>
        </article>
      ) : null}
    </div>
  );
}

export function EducationPanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  const sorted = useMemo(() => [...draft.education].sort((a, b) => a.order - b.order), [draft.education]);
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const selected = sorted.find((e) => e.id === selectedId) ?? sorted[0] ?? null;

  function commit(education: EducationEntry[]) {
    setDraft({ ...draft, education: education.map((entry, order) => ({ ...entry, order })) });
  }

  function patch(id: string, next: Partial<EducationEntry>) {
    commit(sorted.map((item) => (item.id === id ? { ...item, ...next } : item)));
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className={adminControl}
        data-testid="add-education"
        onClick={() => {
          const entry: EducationEntry = {
            id: `edu-${Date.now()}`,
            school: '',
            location: '',
            credential: '',
            dates: '',
            details: '',
            order: sorted.length,
          };
          commit([...sorted, entry]);
          setSelectedId(entry.id);
        }}
      >
        [ADD_EDUCATION]
      </button>
      <AdminSortableIds
        items={sorted}
        onReorder={commit}
        renderPlate={(entry) => (
          <button
            type="button"
            className={`min-h-11 w-full border px-3 text-left font-mono text-xs ${
              selected?.id === entry.id ? 'border-[var(--accent-cyan)]' : 'border-[var(--border-cyan)]'
            }`}
            onClick={() => setSelectedId(entry.id)}
          >
            {entry.school || '[UNTITLED]'}
          </button>
        )}
      />
      {selected ? (
        <StudioWindow title="[EDUCATION]">
          <Field label="SCHOOL">
            <input data-testid="education-school" className={adminField} value={selected.school} onChange={(e) => patch(selected.id, { school: e.target.value })} />
          </Field>
          <Field label="LOCATION">
            <input className={adminField} value={selected.location} onChange={(e) => patch(selected.id, { location: e.target.value })} />
          </Field>
          <Field label="CREDENTIAL">
            <input className={adminField} value={selected.credential} onChange={(e) => patch(selected.id, { credential: e.target.value })} />
          </Field>
          <Field label="DATES">
            <input className={adminField} value={selected.dates} onChange={(e) => patch(selected.id, { dates: e.target.value })} />
          </Field>
          <Field label="DETAILS">
            <textarea className={`${adminField} min-h-20 py-2`} value={selected.details} onChange={(e) => patch(selected.id, { details: e.target.value })} />
          </Field>
          <button
            type="button"
            className={adminControl}
            onClick={() => {
              commit(sorted.filter((item) => item.id !== selected.id));
              setSelectedId(sorted.find((e) => e.id !== selected.id)?.id ?? null);
            }}
          >
            [DELETE]
          </button>
        </StudioWindow>
      ) : null}
    </div>
  );
}

export function CertPanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  const sorted = useMemo(() => [...draft.certifications].sort((a, b) => a.order - b.order), [draft.certifications]);
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const selected = sorted.find((c) => c.id === selectedId) ?? sorted[0] ?? null;

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
        className={adminControl}
        data-testid="add-certification"
        onClick={() => {
          const entry: CertificationEntry = {
            id: `cert-${Date.now()}`,
            title: '',
            issuer: '',
            issued: '',
            summary: '',
            image: null,
            order: sorted.length,
          };
          commit([...sorted, entry]);
          setSelectedId(entry.id);
        }}
      >
        [ADD_CERTIFICATION]
      </button>
      <div className="flex max-h-48 gap-2 overflow-x-auto overflow-y-hidden p-1">
        <AdminSortableIds
          className="flex flex-row gap-2"
          items={sorted}
          onReorder={commit}
          renderPlate={(entry) => (
            <button
              type="button"
              className={`flex h-20 w-32 shrink-0 flex-col justify-end border p-1 font-mono text-[10px] ${
                selected?.id === entry.id ? 'border-[var(--accent-cyan)]' : 'border-[var(--border-cyan)]'
              }`}
              onClick={() => setSelectedId(entry.id)}
            >
              {entry.image?.src ? (
                <img src={entry.image.src} alt="" className="mb-1 h-10 w-full object-cover" />
              ) : null}
              <span className="truncate">{entry.title || '[CERT]'}</span>
            </button>
          )}
        />
      </div>
      {selected ? (
        <StudioWindow title="[CERTIFICATION]">
          <Field label="TITLE">
            <input data-testid="cert-title" className={adminField} value={selected.title} onChange={(e) => patch(selected.id, { title: e.target.value })} />
          </Field>
          <Field label="ISSUER">
            <input className={adminField} value={selected.issuer} onChange={(e) => patch(selected.id, { issuer: e.target.value })} />
          </Field>
          <Field label="ISSUED">
            <input className={adminField} value={selected.issued} onChange={(e) => patch(selected.id, { issued: e.target.value })} />
          </Field>
          <Field label="SUMMARY">
            <textarea className={`${adminField} min-h-20 py-2`} value={selected.summary} onChange={(e) => patch(selected.id, { summary: e.target.value })} />
          </Field>
          <Field label="IMAGE">
            <input data-testid="cert-image" className="mt-1 block w-full text-xs" type="file" accept="image/*" onChange={(e) => void onImage(selected, e.target.files?.[0])} />
          </Field>
          {selected.image?.src ? (
            <img data-testid="cert-preview" src={selected.image.src} alt="" className="aspect-[16/10] w-full max-w-xs object-cover" />
          ) : null}
          {selected.image?.src ? (
            <button type="button" className={adminControl} onClick={() => patch(selected.id, { image: null })}>
              [REMOVE_IMAGE]
            </button>
          ) : null}
          <button
            type="button"
            className={adminControl}
            onClick={() => {
              commit(sorted.filter((item) => item.id !== selected.id));
              setSelectedId(sorted.find((c) => c.id !== selected.id)?.id ?? null);
            }}
          >
            [DELETE]
          </button>
        </StudioWindow>
      ) : null}
    </div>
  );
}

const SKILL_GROUPS: { key: keyof PortfolioContent['skills']; label: string; testId?: string }[] = [
  { key: 'languages', label: 'LANGUAGES', testId: 'skill-languages' },
  { key: 'frameworksWeb', label: 'FRAMEWORKS_WEB' },
  { key: 'databasesMiddleware', label: 'DATABASES_MIDDLEWARE' },
  { key: 'devops', label: 'DEVOPS' },
  { key: 'securityTools', label: 'SECURITY_TOOLS' },
];

function SkillChipGroup({
  label,
  value,
  testId,
  onChange,
}: {
  label: string;
  value: string;
  testId?: string;
  onChange: (next: string) => void;
}) {
  const tokens = parseSkillTokens(value);
  const [chip, setChip] = useState('');
  return (
    <div data-testid={testId} className="flex flex-col gap-2 border border-[var(--border-cyan)] p-3">
      <p className="font-mono text-xs text-[var(--accent-cyan)]">
        [{label}]
      </p>
      <textarea
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {tokens.map((token) => (
          <button
            key={token}
            type="button"
            className={adminControl}
            onClick={() => onChange(joinSkillTokens(tokens.filter((t) => t !== token)))}
          >
            {token} ×
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className={adminField} value={chip} placeholder="Add chip" onChange={(e) => setChip(e.target.value)} />
        <button
          type="button"
          className={adminControl}
          onClick={() => {
            const next = chip.trim();
            if (!next || tokens.includes(next)) return;
            onChange(joinSkillTokens([...tokens, next]));
            setChip('');
          }}
        >
          [ADD]
        </button>
      </div>
    </div>
  );
}

export function SkillsPanel({
  draft,
  setDraft,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
}) {
  return (
    <StudioWindow title="[SKILLS]">
      <div className="flex flex-col gap-3">
        {SKILL_GROUPS.map((group) => (
          <SkillChipGroup
            key={group.key}
            label={group.label}
            testId={group.testId}
            value={draft.skills[group.key]}
            onChange={(next) => setDraft({ ...draft, skills: { ...draft.skills, [group.key]: next } })}
          />
        ))}
      </div>
    </StudioWindow>
  );
}

type CvExpRow = CvExperience & { id: string };
type CvProjRow = CvProject & { id: string };

function withCvIds<T>(items: T[], prefix: string): (T & { id: string })[] {
  return items.map((item, index) => ({ ...item, id: `${prefix}-${index}` }));
}

export function CvPanel({
  draft,
  setDraft,
  storage,
}: {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  storage: 'file' | 'blob';
}) {
  const expRows = withCvIds(draft.cv.experience, 'exp');
  const projRows = withCvIds(draft.cv.projects, 'cvproj');

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

  function reorderExperience(rows: CvExpRow[]) {
    setCv({ experience: rows.map(({ id: _id, ...rest }) => rest) });
  }

  function reorderProjects(rows: CvProjRow[]) {
    setCv({ projects: rows.map(({ id: _id, ...rest }) => rest) });
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
            className={adminControl}
            onClick={() => setCv({ experience: [...draft.cv.experience, { company: '', location: '', role: '', dates: '', bullets: [''] }] })}
          >
            [ADD_ROLE]
          </button>
        </div>
        <AdminSortableIds
          items={expRows}
          onReorder={reorderExperience}
          renderPlate={(job) => (
            <span className="flex min-h-11 items-center px-2 font-mono text-xs">{job.company || job.role || '[ROLE]'}</span>
          )}
        />
        {draft.cv.experience.map((job, index) => (
          <BlueprintCard key={`role-${index}`} className="flex flex-col gap-2 p-4">
            <Field label="COMPANY">
              <input className={adminField} value={job.company} onChange={(e) => patchJob(index, { ...job, company: e.target.value })} />
            </Field>
            <Field label="LOCATION">
              <input className={adminField} value={job.location} onChange={(e) => patchJob(index, { ...job, location: e.target.value })} />
            </Field>
            <Field label="ROLE">
              <input className={adminField} value={job.role} onChange={(e) => patchJob(index, { ...job, role: e.target.value })} />
            </Field>
            <Field label="DATES">
              <input className={adminField} value={job.dates} onChange={(e) => patchJob(index, { ...job, dates: e.target.value })} />
            </Field>
            {job.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex flex-col gap-1 sm:flex-row sm:items-start">
                <textarea
                  data-testid={index === 0 && bulletIndex === 0 ? 'cv-bullet' : undefined}
                  className={`${adminField} min-h-16 flex-1 py-2`}
                  value={bullet}
                  onChange={(e) =>
                    patchJob(index, {
                      ...job,
                      bullets: job.bullets.map((item, i) => (i === bulletIndex ? e.target.value : item)),
                    })
                  }
                />
                <button
                  type="button"
                  className={adminControl}
                  onClick={() =>
                    patchJob(index, {
                      ...job,
                      bullets: job.bullets.filter((_, i) => i !== bulletIndex),
                    })
                  }
                >
                  [REMOVE_BULLET]
                </button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminControl} onClick={() => patchJob(index, { ...job, bullets: [...job.bullets, ''] })}>
                [ADD_BULLET]
              </button>
              <button type="button" className={adminControl} onClick={() => setCv({ experience: draft.cv.experience.filter((_, i) => i !== index) })}>
                [REMOVE_ROLE]
              </button>
            </div>
          </BlueprintCard>
        ))}
      </section>
      <section className="flex flex-col gap-3" data-testid="cv-section-projects">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-mono text-xs text-[var(--accent-cyan)]">[PROJECTS]</h2>
          <button
            type="button"
            className={adminControl}
            onClick={() => setCv({ projects: [...draft.cv.projects, { name: '', role: '', stack: '', dates: '', bullets: [''] }] })}
          >
            [ADD_CV_PROJECT]
          </button>
        </div>
        <AdminSortableIds
          items={projRows}
          onReorder={reorderProjects}
          renderPlate={(project) => (
            <span className="flex min-h-11 items-center px-2 font-mono text-xs">{project.name || '[PROJECT]'}</span>
          )}
        />
        {draft.cv.projects.map((project, index) => (
          <BlueprintCard key={`cv-project-${index}`} className="flex flex-col gap-2 p-4">
            <Field label="NAME">
              <input className={adminField} value={project.name} onChange={(e) => patchProject(index, { ...project, name: e.target.value })} />
            </Field>
            <Field label="ROLE">
              <input className={adminField} value={project.role ?? ''} onChange={(e) => patchProject(index, { ...project, role: e.target.value })} />
            </Field>
            <Field label="STACK">
              <input className={adminField} value={project.stack} onChange={(e) => patchProject(index, { ...project, stack: e.target.value })} />
            </Field>
            <Field label="DATES">
              <input className={adminField} value={project.dates} onChange={(e) => patchProject(index, { ...project, dates: e.target.value })} />
            </Field>
            {project.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex flex-col gap-1 sm:flex-row sm:items-start">
                <textarea
                  className={`${adminField} min-h-16 flex-1 py-2`}
                  value={bullet}
                  onChange={(e) =>
                    patchProject(index, {
                      ...project,
                      bullets: project.bullets.map((item, i) => (i === bulletIndex ? e.target.value : item)),
                    })
                  }
                />
                <button
                  type="button"
                  className={adminControl}
                  onClick={() =>
                    patchProject(index, {
                      ...project,
                      bullets: project.bullets.filter((_, i) => i !== bulletIndex),
                    })
                  }
                >
                  [REMOVE_BULLET]
                </button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminControl} onClick={() => patchProject(index, { ...project, bullets: [...project.bullets, ''] })}>
                [ADD_BULLET]
              </button>
              <button type="button" className={adminControl} onClick={() => setCv({ projects: draft.cv.projects.filter((_, i) => i !== index) })}>
                [REMOVE_CV_PROJECT]
              </button>
            </div>
          </BlueprintCard>
        ))}
      </section>
      <section data-testid="cv-section-pdf" className="border border-[var(--border-cyan)] p-4">
        <p className="font-mono text-[10px] text-[var(--text-muted)]">[DOWNLOADABLE PDF]</p>
        <Field label="DOWNLOAD_NAME">
          <input
            className={adminField}
            value={draft.cvPdf?.downloadFileName ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                cvPdf: draft.cvPdf
                  ? { ...draft.cvPdf, downloadFileName: e.target.value }
                  : { url: '', pathname: '', downloadFileName: e.target.value },
              })
            }
          />
        </Field>
        <p data-testid="cv-pdf-url" className="mt-1 break-all font-mono text-xs">
          {draft.cvPdf?.url ?? ''}
        </p>
        <input
          data-testid="cv-pdf-file"
          className="mt-2 block w-full text-xs"
          type="file"
          accept="application/pdf"
          onChange={(e) => void onPdf(e.target.files?.[0])}
        />
        {draft.cvPdf?.url ? (
          <button type="button" className={`${adminControl} mt-2`} onClick={() => setDraft({ ...draft, cvPdf: null })}>
            [CLEAR_PDF]
          </button>
        ) : null}
      </section>
    </div>
  );
}