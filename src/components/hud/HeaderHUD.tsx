import { useCallback, useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Bot, Menu, X } from 'lucide-react';
import LocalClock from '@/components/hud/LocalClock';
import ThemeToggle from '@/components/hud/ThemeToggle';

export type HudNavItem = { id: string; label: string };

function useLongPress(onLong: () => void) {
  const timer = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const clear = () => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    onPointerDown(event: ReactPointerEvent) {
      origin.current = { x: event.clientX, y: event.clientY };
      clear();
      timer.current = window.setTimeout(() => {
        timer.current = null;
        onLong();
      }, 700);
    },
    onPointerMove(event: ReactPointerEvent) {
      if (!origin.current || timer.current == null) return;
      const dx = event.clientX - origin.current.x;
      const dy = event.clientY - origin.current.y;
      if (dx * dx + dy * dy > 100) clear();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onContextMenu(event: { preventDefault(): void }) {
      event.preventDefault();
    },
  };
}

/** Flip to true when chat runtime ships; drawer + handlers stay wired in App. */
const SHOW_CHATBOT_LAUNCH = false;

type HeaderHUDProps = {
  nav: HudNavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onLaunchChatbot: () => void;
  onAdmin: () => void;
};

function SysIdButton({ onAdmin, tall }: { onAdmin: () => void; tall?: boolean }) {
  const press = useLongPress(onAdmin);
  return (
    <button
      type="button"
      data-testid="sys-id"
      className={`min-w-0 truncate text-left ${tall ? 'min-h-11' : ''}`}
      {...press}
    >
      [SYS_ID: TAMAYO_AARON_FULLSTACK]
    </button>
  );
}

function SysIdCluster({ onAdmin }: { onAdmin: () => void }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[var(--text-primary)] sm:gap-3">
      <SysIdButton onAdmin={onAdmin} tall />
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
  nav,
  activeSection,
  onNavigate,
  vertical,
}: {
  nav: HudNavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  vertical?: boolean;
}) {
  return (
    <nav
      aria-label="Portfolio sections"
      className={vertical ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-1'}
    >
      {nav.map((section) => {
        const active = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            className={`border px-3 text-left ${vertical ? 'min-h-11' : 'py-1'} ${
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
        className={
          SHOW_CHATBOT_LAUNCH
            ? 'inline-flex items-center gap-1.5 border border-[var(--accent-cyan)] bg-[var(--accent-cyan)] px-2 py-1 text-[var(--bg-primary)]'
            : 'hidden'
        }
      >
        <Bot aria-hidden="true" className="size-3.5" />
        [LAUNCH CHATBOT]
      </button>
    </div>
  );
}

const MENU_EXIT_MS = 180;

export default function HeaderHUD({ activeSection, onNavigate, onLaunchChatbot, nav, onAdmin }: HeaderHUDProps) {
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

  const handleNavigate = (sectionId: string) => {
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
        <SysIdCluster onAdmin={onAdmin} />
        <button
          type="button"
          aria-expanded={menuVisible}
          aria-controls={sheetId}
          aria-label={menuVisible ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={toggleMenu}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 border border-[var(--border-cyan)] px-3 text-[var(--text-primary)]"
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
            <NavButtons nav={nav} activeSection={activeSection} onNavigate={handleNavigate} vertical />
            <div className="mt-4 border-t border-[var(--border-cyan)] pt-4">
              <UtilityCluster onLaunchChatbot={handleLaunchChatbot} stacked />
            </div>
          </div>
        </>
      ) : null}

      {/* Desktop full HUD row */}
      <div className="mx-auto hidden w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex lg:px-8">
        <div className="flex flex-wrap items-center gap-3 text-[var(--text-primary)]">
          <SysIdButton onAdmin={onAdmin} />
          <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
            <span
              aria-hidden="true"
              className="status-pulse inline-block size-2 rounded-full bg-[var(--status-online)]"
            />
            SYS_STATUS: ONLINE
          </span>
        </div>

        <NavButtons nav={nav} activeSection={activeSection} onNavigate={onNavigate} />

        <UtilityCluster onLaunchChatbot={onLaunchChatbot} />
      </div>
    </header>
  );
}
