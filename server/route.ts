import { randomBytes } from 'node:crypto';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { PortfolioContent } from '../src/content/types';
import { SECTION_ORDER } from '../src/content/types';
import { adminBypassAllowed, storageMode } from '../src/lib/portfolioPure';
import {
  SESSION_COOKIE,
  clearCookieHeader,
  cookieHeader,
  createSessionToken,
  readCookie,
  requestIsSecure,
  sessionIsValid,
  verifyTotp,
} from './session';
import {
  readContent,
  readLocalMedia,
  readLockout,
  resetFileStore,
  saveLocalMedia,
  writeContent,
  writeLockout,
} from './store';

const IMAGE_MAX = 1_500_000;
const PDF_MAX = 4_000_000;
const LOCK_MS = 15 * 60 * 1000;

function json(data: unknown, status = 200): Response {
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

function authed(request: Request): boolean {
  return sessionIsValid(readCookie(request.headers.get('cookie'), SESSION_COOKIE));
}

function isContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== 'object') return false;
  const doc = value as PortfolioContent;
  return doc.version === 1 && typeof doc.profile?.name === 'string' && Array.isArray(doc.projects);
}

export async function route(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const method = request.method;

  if (path === '/api/auth/session' && method === 'GET') return json(sessionPayload(request));
  if (path === '/api/auth/dev-session' && method === 'POST') return devSession(request);
  if (path === '/api/auth/verify' && method === 'POST') return verify(request);
  if (path === '/api/auth/sign-out' && method === 'POST') return signOut(request);
  if (path === '/api/content' && method === 'GET') return getContent();
  if (path === '/api/content' && method === 'PUT') return putContent(request);
  if (path === '/api/media' && method === 'POST') return postMedia(request);
  if (path === '/api/media' && method === 'GET') return getMedia(url);
  if (path === '/api/upload' && method === 'POST') return blobUpload(request);
  if (path === '/api/test/reset' && method === 'POST') return reset();

  return json({ error: 'NOT_FOUND' }, 404);
}

function sessionPayload(request: Request) {
  return {
    authenticated: authed(request),
    bypass: adminBypassAllowed(process.env),
    storage: storageMode(process.env),
  };
}

function withSession(request: Request, token: string | null, clear = false): Response {
  const secure = requestIsSecure(request);
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  if (clear) headers.set('set-cookie', clearCookieHeader(secure));
  else if (token) headers.set('set-cookie', cookieHeader(token, secure));
  const body = clear
    ? { authenticated: false, bypass: adminBypassAllowed(process.env), storage: storageMode(process.env) }
    : { ...sessionPayload(request), authenticated: true };
  return new Response(JSON.stringify(body), { status: 200, headers });
}

function devSession(request: Request): Response {
  if (!adminBypassAllowed(process.env)) return json({ error: 'NOT_FOUND' }, 404);
  return withSession(request, createSessionToken());
}

async function verify(request: Request): Promise<Response> {
  if (!process.env.TOTP_SECRET) return json({ error: 'CODE_REJECTED' }, 401);
  let code = '';
  try {
    const body = (await request.json()) as { code?: string };
    code = body.code ?? '';
  } catch {
    return json({ error: 'CODE_REJECTED' }, 401);
  }
  const lock = await readLockout();
  if (lock.lockedUntil > Date.now()) return json({ error: 'CODE_REJECTED' }, 401);
  const result = verifyTotp(code);
  if (!result.ok || lock.lastStep === result.step) {
    lock.failures += 1;
    if (lock.failures >= 5) {
      lock.lockedUntil = Date.now() + LOCK_MS;
      lock.failures = 0;
    }
    await writeLockout(lock);
    return json({ error: 'CODE_REJECTED' }, 401);
  }
  lock.failures = 0;
  lock.lockedUntil = 0;
  lock.lastStep = result.step;
  await writeLockout(lock);
  return withSession(request, createSessionToken());
}

function signOut(request: Request): Response {
  return withSession(request, null, true);
}

async function getContent(): Promise<Response> {
  try {
    return json(await readContent());
  } catch (error) {
    console.error(error);
    return json({ error: 'CONTENT_UNAVAILABLE' }, 503);
  }
}

async function putContent(request: Request): Promise<Response> {
  if (!authed(request)) return json({ error: 'UNAUTHORIZED' }, 401);
  if (storageMode(process.env) === 'blob' && !process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ error: 'CONTENT_UNAVAILABLE' }, 503);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'INVALID_CONTENT' }, 400);
  }
  if (!isContent(body)) return json({ error: 'INVALID_CONTENT' }, 400);
  const doc: PortfolioContent = {
    ...body,
    updatedAt: new Date().toISOString(),
    profile: {
      ...body.profile,
    },
  };
  doc.profile.copyrightLine = doc.profile.copyrightLine || '';
  for (const id of SECTION_ORDER) {
    const section = doc.sections?.[id];
    if (!section || typeof section.enabled !== 'boolean') {
      return json({ error: 'INVALID_CONTENT' }, 400);
    }
  }
  try {
    await writeContent(doc);
  } catch (error) {
    console.error(error);
    return json({ error: 'CONTENT_UNAVAILABLE' }, 503);
  }
  return json(doc);
}

function sniff(bytes: Uint8Array, kind: 'image' | 'pdf'): boolean {
  if (kind === 'pdf') return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50;
  if (bytes.length < 12) return false;
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  return riff === 'RIFF' && webp === 'WEBP';
}

async function postMedia(request: Request): Promise<Response> {
  if (!authed(request)) return json({ error: 'UNAUTHORIZED' }, 401);
  if (storageMode(process.env) !== 'file') return json({ error: 'USE_BLOB_UPLOAD' }, 400);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'INVALID_FILE' }, 400);
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const max = isPdf ? PDF_MAX : IMAGE_MAX;
  if (file.size > max) return json({ error: 'FILE_TOO_LARGE' }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!sniff(bytes, isPdf ? 'pdf' : 'image')) return json({ error: 'INVALID_FILE' }, 415);
  const pathname = `local-${randomBytes(8).toString('hex')}${isPdf ? '.pdf' : '.webp'}`;
  await saveLocalMedia(pathname, bytes);
  const type = isPdf ? 'application/pdf' : 'image/webp';
  return json({
    url: `/api/media?id=${pathname}`,
    pathname,
    contentType: type,
  });
}

async function getMedia(url: URL): Promise<Response> {
  const id = url.searchParams.get('id') ?? '';
  const bytes = await readLocalMedia(id);
  if (!bytes) return json({ error: 'NOT_FOUND' }, 404);
  const type = id.endsWith('.pdf') ? 'application/pdf' : 'image/webp';
  return new Response(new Uint8Array(bytes), {
    headers: {
      'content-type': type,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}

async function blobUpload(request: Request): Promise<Response> {
  if (!authed(request)) return json({ error: 'UNAUTHORIZED' }, 401);
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const pdf = pathname.endsWith('.pdf');
        return {
          addRandomSuffix: true,
          allowedContentTypes: [pdf ? 'application/pdf' : 'image/webp'],
          maximumSizeInBytes: pdf ? PDF_MAX : IMAGE_MAX,
        };
      },
      onUploadCompleted: async () => undefined,
    });
    return json(result);
  } catch (error) {
    console.error(error);
    return json({ error: 'UPLOAD_FAILED' }, 400);
  }
}

async function reset(): Promise<Response> {
  if (storageMode(process.env) !== 'file' || !adminBypassAllowed(process.env)) {
    return json({ error: 'NOT_FOUND' }, 404);
  }
  await resetFileStore();
  return json({ ok: true });
}
