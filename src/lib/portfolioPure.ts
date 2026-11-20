/** Shared predicates. The node check imports this file directly. */

export type NavFlag = { id: string; enabled: boolean; navLabel: string };

export function adminBypassAllowed(env: Record<string, string | undefined>): boolean {
  if (env.ADMIN_AUTH_BYPASS !== '1') return false;
  if (env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview') return false;
  return true;
}

/** Production and Preview always use Blob. Local and Playwright use the file store. */
export function storageMode(env: Record<string, string | undefined>): 'file' | 'blob' {
  if (env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview') return 'blob';
  if (env.CONTENT_STORE === 'blob' && env.BLOB_READ_WRITE_TOKEN) return 'blob';
  return 'file';
}

export function scaleToMaxEdge(
  width: number,
  height: number,
  maxEdge = 1600,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest === 0) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** CV is a portrait trigger, not a nav pill. Disabled sections drop out. */
export function visibleNav(sections: NavFlag[]): NavFlag[] {
  return sections.filter((section) => section.enabled && section.id !== 'cv');
}
