import { useCallback, useEffect, useId, useState } from 'react';
import { Bot, Menu, X } from 'lucide-react';
import { PORTFOLIO_NAV, type PortfolioSectionId } from '@/data/navSections';
import LocalClock from '@/components/hud/LocalClock';
import ThemeToggle from '@/components/hud/ThemeToggle';

type HeaderHUDProps = {
  activeSection: PortfolioSectionId;
  onNavigate: (sectionId: PortfolioSectionId) => void;
  onLaunchChatbot: () => void;
};

function SysIdCluster() {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[var(--text-primary)] sm:gap-3">
      <span className="truncate">[SYS_ID: TAMAYO_AARON_FULLSTACK]</span>
      <span className="inline-flex shrink-0 items-center gap-2 text-[var(--text-muted)]">
        <span
          aria-hidden="true"
          className="status-pulse inline-block size-2 rounded-full bg-[var(--status-online)]"
        />
        <span className="hidden min-[420px]:inline">SYS_STATUS: ONLINE</span>
        <span className="min-[420px]:hidden">ONLINE</span>
      </span>
    </div>
  );
}

function NavButtons({
  activeSection,
  onNavigate,
  vertical,
}: {
  activeSection: PortfolioSectionId;
  onNavigate: (sectionId: PortfolioSectionId) => void;
  vertical?: boolean;
}) {
  return (
    <nav
      aria-label="Portfolio sections"
      className={vertical ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-1'}
    >
      {PORTFOLIO_NAV.map((section) => {
        const active = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            className={`border px-2 py-1 text-left ${
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
  );
}

function UtilityCluster({
  onLaunchChatbot,
  stacked,
}: {
  onLaunchChatbot: () => void;
  stacked?: boolean;
}) {
  return (
    <div
      className={
        stacked
          ? 'flex flex-col gap-2 text-[var(--text-muted)]'
          : 'flex flex-wrap items-center gap-2 text-[var(--text-muted)]'
      }
    >
      <LocalClock />
      <ThemeToggle />
      <button
        type="button"
        onClick={onLaunchChatbot}
        className="inline-flex items-center gap-1.5 border border-[var(--accent-cyan)] bg-[var(--accent-cyan)] px-2 py-1 text-[var(--bg-primary)]"
      >
        <Bot aria-hidden="true" className="size-3.5" />
        [LAUNCH CHATBOT]
      </button>
    </div>
  );
}

const MENU_EXIT_MS = 180;

export default function HeaderHUD({ activeSection, onNavigate, onLaunchChatbot }: HeaderHUDProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuExiting, setMenuExiting] = useState(false);
  const sheetId = useId();

  const closeMenu = useCallback(() => {
    setMenuVisible((visible) => {
      if (!visible) return false;
      setMenuExiting(true);
      window.setTimeout(() => {
        setMenuVisible(false);
        setMenuExiting(false);
      }, MENU_EXIT_MS);
      return true;
    });
  }, []);

  const openMenu = useCallback(() => {
    setMenuExiting(false);
    setMenuVisible(true);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuVisible && !menuExiting) closeMenu();
    else openMenu();
  }, [closeMenu, menuExiting, menuVisible, openMenu]);

  useEffect(() => {
    if (!menuVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuVisible, closeMenu]);

  const handleNavigate = (sectionId: PortfolioSectionId) => {
    onNavigate(sectionId);
    closeMenu();
  };

  const handleLaunchChatbot = () => {
    onLaunchChatbot();
    closeMenu();
  };

  return (
    <header
      className={`sticky top-0 border-b border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_88%,transparent)] font-mono text-xs tracking-wide backdrop-blur-sm ${
        menuVisible ? 'z-50' : 'z-40'
      }`}
    >
      {/* Mobile / tablet compact bar */}
      <div className="relative z-[42] mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:hidden lg:px-8">
        <SysIdCluster />
        <button
          type="button"
          aria-expanded={menuVisible}
          aria-controls={sheetId}
          aria-label={menuVisible ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={toggleMenu}
          className="inline-flex shrink-0 items-center gap-1.5 border border-[var(--border-cyan)] px-2 py-1 text-[var(--text-primary)]"
        >
          {menuVisible ? (
            <>
              <X aria-hidden="true" className="size-3.5" />
              [CLOSE]
            </>
          ) : (
            <>
              <Menu aria-hidden="true" className="size-3.5" />
              [MENU]
            </>
          )}
        </button>
      </div>

      {menuVisible ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className={`fixed inset-0 z-[39] bg-[color-mix(in_srgb,var(--bg-primary)_40%,#000)] lg:hidden ${
              menuExiting ? 'hud-menu-backdrop-exit' : 'hud-menu-backdrop-enter'
            }`}
            onClick={closeMenu}
          />
          <div
            id={sheetId}
            className={`relative z-[41] overflow-hidden border-b border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--bg-primary)_92%,transparent)] px-4 py-4 backdrop-blur-sm sm:px-6 lg:hidden ${
              menuExiting ? 'hud-menu-sheet-exit' : 'hud-menu-sheet-enter'
            }`}
          >
            <NavButtons activeSection={activeSection} onNavigate={handleNavigate} vertical />
            <div className="mt-4 border-t border-[var(--border-cyan)] pt-4">
              <UtilityCluster onLaunchChatbot={handleLaunchChatbot} stacked />
            </div>
          </div>
        </>
      ) : null}

      {/* Desktop full HUD row */}
      <div className="mx-auto hidden w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex lg:px-8">
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

        <NavButtons activeSection={activeSection} onNavigate={onNavigate} />

        <UtilityCluster onLaunchChatbot={onLaunchChatbot} />
      </div>
    </header>
  );
}
