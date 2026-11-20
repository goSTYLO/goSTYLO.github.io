export const adminControl =
  'inline-flex min-h-11 items-center justify-center border border-[var(--border-cyan)] px-3 font-mono text-xs text-[var(--text-primary)]';
export const adminControlActive =
  'inline-flex min-h-11 items-center justify-center border border-[var(--accent-cyan)] px-3 font-mono text-xs text-[var(--accent-cyan)]';
export const adminField =
  'min-h-11 w-full border border-[var(--border-cyan)] bg-[var(--bg-surface)] px-3 font-mono text-sm text-[var(--text-primary)]';
export const adminLabel = 'font-mono text-[10px] text-[var(--text-muted)]';

/** Split/join skill-line strings (comma or newline). */
export function parseSkillTokens(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function joinSkillTokens(tokens: string[]): string {
  return tokens.join(', ');
}