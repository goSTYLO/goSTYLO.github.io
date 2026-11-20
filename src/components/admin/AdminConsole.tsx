import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContent } from '@/content/ContentContext';
import { buildSeed } from '@/content/buildSeed';
import type { PortfolioContent } from '@/content/types';
import AdminPinSheet from '@/components/admin/AdminPinSheet';
import AdminStudio from '@/components/admin/AdminStudio';
import type { AdminTab } from '@/components/admin/adminPanels';
import { go } from '@/lib/route';

type Session = {
  authenticated: boolean;
  bypass: boolean;
  storage: 'file' | 'blob';
  totpConfigured?: boolean;
  enrolled?: boolean;
};

async function readSession(): Promise<Session> {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  if (!res.ok) return { authenticated: false, bypass: false, storage: 'file', totpConfigured: false };
  return (await res.json()) as Session;
}

function snapshot(doc: PortfolioContent): string {
  return JSON.stringify(doc);
}

export default function AdminConsole() {
  const { setContent } = useContent();
  const [session, setSession] = useState<Session | null>(null);
  const [draft, setDraft] = useState<PortfolioContent | null>(null);
  const [baseline, setBaseline] = useState('');
  const [tab, setTab] = useState<AdminTab>('profile');
  const [status, setStatus] = useState('READY');
  const [code, setCode] = useState('');

  const dirty = useMemo(() => (draft ? snapshot(draft) !== baseline : false), [draft, baseline]);

  useEffect(() => {
    if (!dirty) return;
    if (status === 'SAVED' || status === 'READY') setStatus('UNSAVED');
  }, [dirty, status]);

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
      setBaseline(snapshot(doc));
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

  const signOut = useCallback(async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    go('/');
  }, []);

  const save = useCallback(async () => {
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
    setBaseline(snapshot(saved));
    setStatus('SAVED');
  }, [draft, setContent]);

  if (!session || !draft) {
    return (
      <div data-testid="admin-shell" className="p-4 font-mono text-xs text-[var(--text-muted)]">
        AUTH: CHECKING
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <AdminPinSheet
        code={code}
        status={status}
        totpConfigured={session.totpConfigured === true}
        enrolled={session.enrolled === true}
        onCodeChange={setCode}
        onVerify={() => void submitPin()}
      />
    );
  }

  return (
    <AdminStudio
      draft={draft}
      setDraft={setDraft}
      tab={tab}
      setTab={setTab}
      status={status}
      dirty={dirty}
      save={save}
      signOut={signOut}
      bypass={session.bypass}
      storage={session.storage}
    />
  );
}