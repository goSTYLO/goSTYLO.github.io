import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { isAdminEnrolled } from '../../server/enrollmentBlob';

const SESSION_COOKIE = 'admin_session';

function bypassAllowed(): boolean {
  return (
    process.env.ADMIN_AUTH_BYPASS === '1' &&
    process.env.VERCEL_ENV !== 'production' &&
    process.env.VERCEL_ENV !== 'preview'
  );
}

function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (bypassAllowed()) return 'dev-only-session-secret';
  throw new Error('SESSION_SECRET missing');
}

function sign(body: string): string {
  return createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function sessionIsValid(token: string | null): boolean {
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
    return;
  }
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');

  try {
    const bypass = bypassAllowed();
    const token = readCookie(req.headers.cookie, SESSION_COOKIE);
    const authenticated = sessionIsValid(token);
    const enrolled = bypass ? false : await isAdminEnrolled();

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        authenticated,
        bypass,
        storage:
          process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' ? 'blob' : 'file',
        totpConfigured: Boolean(process.env.TOTP_SECRET) && !bypass,
        enrolled,
      }),
    );
  } catch (error) {
    console.error('session_failed', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'SERVER_ERROR' }));
  }
}