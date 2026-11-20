import { useEffect, type ReactNode } from 'react';
import type { PortfolioContent } from '@/content/types';
import { go } from '@/lib/route';
import {
  CertPanel,
  CvPanel,
  EducationPanel,
  ProfilePanel,
  ProjectsPanel,
  SectionsPanel,
  SkillsPanel,
  type AdminTab,
} from '@/components/admin/adminPanels';
import { adminControl, adminControlActive } from '@/components/admin/adminChrome';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'sections', label: 'SECTIONS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'cv', label: 'CV' },
];

type AdminStudioProps = {
  draft: PortfolioContent;
  setDraft: (next: PortfolioContent) => void;
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  status: string;
  dirty: boolean;
  save: () => void | Promise<void>;
  signOut: () => void | Promise<void>;
  bypass: boolean;
  storage: 'file' | 'blob';
};

export default function AdminStudio({
  draft,
  setDraft,
  tab,
  setTab,
  status,
  dirty,
  save,
  signOut,
  bypass,
  storage,
}: AdminStudioProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const panel: ReactNode = (() => {
    switch (tab) {
      case 'profile':
        return <ProfilePanel draft={draft} setDraft={setDraft} storage={storage} />;
      case 'sections':
        return <SectionsPanel draft={draft} setDraft={setDraft} />;
      case 'projects':
        return <ProjectsPanel draft={draft} setDraft={setDraft} storage={storage} />;
      case 'education':
        return <EducationPanel draft={draft} setDraft={setDraft} />;
      case 'certifications':
        return <CertPanel draft={draft} setDraft={setDraft} storage={storage} />;
      case 'skills':
        return <SkillsPanel draft={draft} setDraft={setDraft} />;
      case 'cv':
        return <CvPanel draft={draft} setDraft={setDraft} storage={storage} />;
      default:
        return null;
    }
  })();

  return (
    <div data-testid="admin-shell" className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-cyan)] bg-[var(--bg-primary)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs text-[var(--accent-cyan)]">[ADMIN_CONSOLE]</p>
          <p
            data-testid="admin-dirty"
            className={`font-mono text-[10px] ${dirty ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}
          >
            [{dirty ? 'UNSAVED' : 'SAVED'}]
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminControl} data-testid="view-site" onClick={() => go('/')}>
            [VIEW_SITE]
          </button>
          <button type="button" className={adminControl} data-testid="sign-out" onClick={() => void signOut()}>
            [SIGN_OUT]
          </button>
        </div>
      </header>
      {bypass ? (
        <p data-testid="dev-bypass" className="px-4 pt-3 font-mono text-[10px] text-[var(--accent-cyan)]">
          DEV AUTH BYPASS
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 pb-32 lg:flex-row lg:gap-6">
        <nav
          data-testid="admin-rail"
          className="flex shrink-0 gap-2 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-visible"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`admin-tab-${item.id}`}
              className={`shrink-0 lg:w-full ${tab === item.id ? adminControlActive : adminControl}`}
              onClick={() => setTab(item.id)}
            >
              [{item.label}]
            </button>
          ))}
        </nav>
        <main className="min-w-0 flex-1">{panel}</main>
      </div>
      <div
        data-testid="save-bar"
        className="sticky bottom-0 z-30 border-t border-[var(--border-cyan)] bg-[var(--bg-primary)] px-4 py-3"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-[var(--text-muted)]">{status}</p>
          <button
            type="button"
            className={dirty ? adminControlActive : adminControl}
            data-testid="admin-save"
            onClick={() => void save()}
          >
            [SAVE]
          </button>
        </div>
      </div>
    </div>
  );
}