import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { PORTFOLIO_NAV, type PortfolioSectionId } from '@/data/navSections';
import { useTheme } from '@/context/ThemeContext';

type HeaderHUDProps = {
  activeSection: PortfolioSectionId;
  onNavigate: (sectionId: PortfolioSectionId) => void;
  onLaunchChatbot: () => void;
};

function formatClock(date: Date) {
  const manila = date.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const pacific = date.toLocaleTimeString('en-GB', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const pacificZone =
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'PST';

  return { manila, pacific, pacificZone };
}

export default function HeaderHUD({ activeSection, onNavigate, onLaunchChatbot }: HeaderHUDProps) {
  const { theme, toggleTheme } = useTheme();
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_88%,transparent)] font-mono text-xs tracking-wide backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 text-[var(--text-primary)]">
          <span>[SYS_ID: TAMAYO_AARON_FULLSTACK]</span>
          <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
            <span
              aria-hidden="true"
              className="status-pulse inline-block size-2 rounded-full bg-[var(--status-online)]"
            />
            SYS_STATUS: ONLINE
          </span>
        </div>

        <nav aria-label="Portfolio sections" className="flex flex-wrap items-center gap-1">
          {PORTFOLIO_NAV.map((section) => {
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigate(section.id)}
                className={`border px-2 py-1 ${
                  active
                    ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]'
                    : 'border-[var(--border-cyan)] text-[var(--text-muted)]'
                }`}
              >
                [{section.label}]
              </button>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2 text-[var(--text-muted)]">
          <time dateTime={new Date().toISOString()}>
            {clock.manila} UTC+8 / {clock.pacific} {clock.pacificZone}
          </time>
          <button
            type="button"
            onClick={() => toggleTheme()}
            className="border border-[var(--border-cyan)] px-2 py-1 text-[var(--text-primary)]"
          >
            [THEME: {theme.toUpperCase()}]
          </button>
          <button
            type="button"
            onClick={onLaunchChatbot}
            className="inline-flex items-center gap-1.5 border border-[var(--accent-cyan)] bg-[var(--accent-cyan)] px-2 py-1 text-[var(--bg-primary)]"
          >
            <Bot aria-hidden="true" className="size-3.5" />
            [LAUNCH CHATBOT]
          </button>
        </div>
      </div>
    </header>
  );
}
