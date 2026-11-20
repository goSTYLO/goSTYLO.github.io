import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del, get, put } from '@vercel/blob';
import { buildSeed, mediaPathnames } from '../src/content/buildSeed';
import type { PortfolioContent } from '../src/content/types';
import { storageMode } from '../src/lib/portfolioPure';

const CONTENT_PATH = 'content/portfolio.json';
const LOCKOUT_PATH = 'auth/lockout.json';

export type LockoutState = {
  failures: number;
  lockedUntil: number;
  lastStep: number | null;
};

const EMPTY_LOCKOUT: LockoutState = { failures: 0, lockedUntil: 0, lastStep: null };

function mode() {
  return storageMode(process.env);
}

function contentPath() {
  return path.resolve(process.cwd(), process.env.CONTENT_FILE || 'tmp/e2e-content.json');
}

function lockoutPath() {
  return path.resolve(process.cwd(), 'tmp/e2e-lockout.json');
}

export function mediaDir() {
  return path.resolve(process.cwd(), 'tmp/e2e-media');
}

export async function readContent(): Promise<PortfolioContent> {
  if (mode() === 'file') return readFileContent();
  return readBlobContent();
}

async function readFileContent(): Promise<PortfolioContent> {
  try {
    const raw = await readFile(contentPath(), 'utf8');
    return JSON.parse(raw) as PortfolioContent;
  } catch {
    const seed = buildSeed();
    await writeFileContent(seed);
    return seed;
  }
}

async function writeFileContent(doc: PortfolioContent) {
  const file = contentPath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(doc), 'utf8');
}

async function readBlobContent(): Promise<PortfolioContent> {
  const existing = await get(CONTENT_PATH, { access: 'public', useCache: false });
  if (!existing) {
    const seed = buildSeed();
    try {
      await put(CONTENT_PATH, JSON.stringify(seed), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 60,
      });
    } catch {
      const again = await get(CONTENT_PATH, { access: 'public', useCache: false });
      if (again) return JSON.parse(await new Response(again.stream).text()) as PortfolioContent;
    }
    return seed;
  }
  return JSON.parse(await new Response(existing.stream).text()) as PortfolioContent;
}

export async function writeContent(doc: PortfolioContent): Promise<void> {
  const previous = await readContent().catch(() => null);
  if (mode() === 'file') await writeFileContent(doc);
  else {
    await put(CONTENT_PATH, JSON.stringify(doc), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  }
  if (previous) await deleteRemovedMedia(previous, doc);
}

async function deleteRemovedMedia(previous: PortfolioContent, next: PortfolioContent) {
  const keep = new Set(mediaPathnames(next));
  for (const pathname of mediaPathnames(previous)) {
    if (keep.has(pathname)) continue;
    await deleteMedia(pathname);
  }
}

export async function deleteMedia(pathname: string) {
  if (!pathname || pathname === 'public-cv' || pathname.includes('..')) return;
  if (mode() === 'file') {
    if (!pathname.startsWith('local-')) return;
    await rm(path.join(mediaDir(), pathname), { force: true });
    return;
  }
  await del(pathname).catch(() => undefined);
}

export async function saveLocalMedia(pathname: string, bytes: Uint8Array) {
  const dir = mediaDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, pathname), bytes);
}

export async function readLocalMedia(pathname: string): Promise<Buffer | null> {
  if (!pathname.startsWith('local-') || pathname.includes('..')) return null;
  try {
    return await readFile(path.join(mediaDir(), pathname));
  } catch {
    return null;
  }
}

export async function readLockout(): Promise<LockoutState> {
  if (mode() === 'file') {
    try {
      return JSON.parse(await readFile(lockoutPath(), 'utf8')) as LockoutState;
    } catch {
      return { ...EMPTY_LOCKOUT };
    }
  }
  const blob = await get(LOCKOUT_PATH, { access: 'private', useCache: false });
  if (!blob) return { ...EMPTY_LOCKOUT };
  return JSON.parse(await new Response(blob.stream).text()) as LockoutState;
}

export async function writeLockout(state: LockoutState) {
  if (mode() === 'file') {
    const file = lockoutPath();
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(state), 'utf8');
    return;
  }
  await put(LOCKOUT_PATH, JSON.stringify(state), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function resetFileStore() {
  await rm(contentPath(), { force: true });
  await rm(lockoutPath(), { force: true });
  await rm(mediaDir(), { recursive: true, force: true });
  await writeFileContent(buildSeed());
}
