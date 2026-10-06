import { useId, useState, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useTypewriter';
import { cn } from 'cn';

type ArchSpecsDisclosureProps = {
  children: ReactNode;
};

export default function ArchSpecsDisclosure({ children }: ArchSpecsDisclosureProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const panelId = useId();

  return (
    <div className="mt-3 font-mono text-xs text-[var(--text-muted)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border border-[var(--border-cyan)] px-2 py-1 text-left text-[var(--accent-cyan)] transition-colors hover:bg-[color-mix(in_srgb,var(--bg-surface)_90%,var(--accent-cyan))]"
      >
        <span>[ARCH_SPECS]</span>
        <span aria-hidden="true" className="text-[10px] text-[var(--text-muted)]">
          {open ? '[−]' : '[+]'}
        </span>
      </button>
      <div
        id={panelId}
        className={cn(
          'grid',
          reducedMotion ? '' : 'transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              'arch-specs-panel mt-3 space-y-3 border border-[var(--border-cyan)] p-3',
              !reducedMotion && 'transition-[opacity,transform] duration-300 ease-out',
              open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
