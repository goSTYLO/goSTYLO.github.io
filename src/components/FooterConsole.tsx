import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import BlueprintCard from '@/components/BlueprintCard';
import { mailtoHref, profile } from '@/data/profile';
import { downloadResumeMarkdown } from '@/lib/downloadResume';

const PS_PATH = 'C:\\portfolio\\footer';
const PS_INIT_CMD = '.\\_footer_init.ps1';

type TerminalLine =
  | { kind: 'ps-command'; command: string }
  | { kind: 'text'; text: string }
  | { kind: 'mail' }
  | { kind: 'tel' }
  | { kind: 'vcs' };

function linePlainText(line: TerminalLine): string {
  switch (line.kind) {
    case 'ps-command':
      return `PS ${PS_PATH}> ${line.command}`;
    case 'text':
      return line.text;
    case 'mail':
      return `MAIL: ${profile.email}`;
    case 'tel':
      return `TEL: ${profile.phone}`;
    case 'vcs':
      return `VCS: ${profile.githubUrl}`;
    default:
      return '';
  }
}

function PsPrompt({ children }: { children?: ReactNode }) {
  return (
    <span>
      <span className="powershell-prompt-ps">PS </span>
      <span className="powershell-prompt-path">
        {PS_PATH}&gt;{' '}
      </span>
      {children}
    </span>
  );
}

function useTerminalTypewriter(lines: TerminalLine[], charDelayMs = 18) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setInstant(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const plainLines = useMemo(() => lines.map(linePlainText), [lines]);
  const allDone = instant || lineIndex >= lines.length;

  useEffect(() => {
    if (instant || lineIndex >= lines.length) return;

    const full = plainLines[lineIndex] ?? '';
    if (charIndex >= full.length) {
      setLineIndex(lineIndex + 1);
      setCharIndex(0);
      return;
    }

    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), charDelayMs);
    return () => window.clearTimeout(timer);
  }, [instant, lineIndex, charIndex, plainLines, charDelayMs, lines.length]);

  return { lines, plainLines, lineIndex, charIndex, instant, allDone };
}

function BracketButton({
  children,
  onClick,
  href,
  external,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}) {
  const className =
    'group relative border border-[var(--accent-cyan)] px-4 py-2 font-mono text-xs font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--accent-cyan)] hover:text-[var(--bg-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]';

  if (href) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <span className="absolute -left-1 -top-1 hidden size-2 border-l border-t border-[var(--accent-cyan)] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
        <span className="absolute -bottom-1 -right-1 hidden size-2 border-b border-r border-[var(--accent-cyan)] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <span className="absolute -left-1 -top-1 hidden size-2 border-l border-t border-[var(--accent-cyan)] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
      <span className="absolute -bottom-1 -right-1 hidden size-2 border-b border-r border-[var(--accent-cyan)] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
      {children}
    </button>
  );
}

function renderCompleteLine(line: TerminalLine) {
  switch (line.kind) {
    case 'ps-command':
      return (
        <PsPrompt>
          <span>{line.command}</span>
        </PsPrompt>
      );
    case 'text':
      return line.text;
    case 'mail':
      return (
        <>
          {'MAIL: '}
          <a href={mailtoHref()} className="powershell-link">
            {profile.email}
          </a>
        </>
      );
    case 'tel':
      return (
        <>
          {'TEL: '}
          <a href={`tel:${profile.phoneTel}`} className="powershell-link">
            {profile.phone}
          </a>
        </>
      );
    case 'vcs':
      return (
        <>
          {'VCS: '}
          <a
            href={profile.githubUrl}
            className="powershell-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile.githubUrl}
          </a>
        </>
      );
    default:
      return null;
  }
}

const TERMINAL_LINES: TerminalLine[] = [
  { kind: 'ps-command', command: PS_INIT_CMD },
  { kind: 'text', text: profile.copyrightLine },
  { kind: 'text', text: `EDU: ${profile.educationLine}` },
  { kind: 'text', text: `LOC: ${profile.location}` },
  { kind: 'mail' },
  { kind: 'tel' },
  { kind: 'vcs' },
];

export default function FooterConsole() {
  const { lines, plainLines, lineIndex, charIndex, instant, allDone } =
    useTerminalTypewriter(TERMINAL_LINES);
  const [statusLine, setStatusLine] = useState<string | null>(null);

  const copyContact = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setStatusLine('COPIED: primary_email');
    } catch {
      setStatusLine('ERR: clipboard_denied — use MAIL link');
    }
  }, []);

  const onDownloadCv = useCallback(() => {
    downloadResumeMarkdown();
    setStatusLine('EXPORT: resume.md OK');
  }, []);

  useEffect(() => {
    if (!statusLine) return;
    const timer = window.setTimeout(() => setStatusLine(null), 4000);
    return () => window.clearTimeout(timer);
  }, [statusLine]);

  return (
    <section id="footer-console" className="w-full scroll-mt-24">
      <p className="font-mono text-xs text-[var(--accent-cyan)]">[CONSOLE]</p>
      <h2 className="mt-2 font-sans text-xl">Footer Terminal</h2>
      <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
        Contact channel · resume export · quick actions
      </p>

      <BlueprintCard className="mt-5 scroll-mt-24 p-4 sm:p-5">
        <div className="powershell-window" role="region" aria-label="Windows PowerShell console">
          <div className="powershell-titlebar" aria-hidden="true">
            <span>Windows PowerShell</span>
            <div className="powershell-titlebar-controls">
              <span>—</span>
              <span>□</span>
              <span>×</span>
            </div>
          </div>

          <div className="powershell-body" aria-live="polite">
            <p className="powershell-banner">Windows PowerShell</p>
            <p className="powershell-banner-sub">
              Copyright (C) Aaron Christian B. Tamayo. All rights reserved.
            </p>

            {lines.map((line, i) => {
              if (instant || i < lineIndex) {
                return (
                  <p key={i} className="powershell-line">
                    {renderCompleteLine(line)}
                  </p>
                );
              }

              if (i === lineIndex && !instant) {
                const partial = (plainLines[i] ?? '').slice(0, charIndex);
                return (
                  <p key={i} className="powershell-line powershell-line-partial">
                    {partial}
                  </p>
                );
              }

              return null;
            })}

            {allDone ? (
              <p className="powershell-line mt-1">
                <PsPrompt>
                  <span
                    className="powershell-cursor terminal-cursor"
                    aria-hidden="true"
                  />
                </PsPrompt>
              </p>
            ) : null}

            {statusLine ? <p className="powershell-status">{statusLine}</p> : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <BracketButton href={mailtoHref()}>[SEND_MESSAGE]</BracketButton>
          <BracketButton onClick={onDownloadCv}>[DOWNLOAD_CV]</BracketButton>
          <BracketButton href={profile.githubUrl} external>
            [VIEW_GITHUB]
          </BracketButton>
          <BracketButton onClick={() => void copyContact()}>[COPY_CONTACT]</BracketButton>
        </div>
      </BlueprintCard>
    </section>
  );
}
