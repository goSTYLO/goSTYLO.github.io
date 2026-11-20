import { createHmac, timingSafeEqual } from 'node:crypto';
import { adminBypassAllowed } from '../src/lib/portfolioPure';
import { totpFromEnv } from './totp';

export const SESSION_COOKIE = 'admin_session';
const MAX_AGE = 8 * 60 * 60;

export function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (adminBypassAllowed(process.env)) return 'dev-only-session-secret';
  throw new Error('SESSION_SECRET missing');
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function sign(body: string): string {
  return createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

export function createSessionToken(): string {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function sessionIsValid(token: string | null): boolean {
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

export function cookieHeader(token: string, secure: boolean, maxAge = MAX_AGE): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearCookieHeader(secure: boolean): string {
  return cookieHeader('', secure, 0);
}

export function requestIsSecure(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}

export function verifyTotp(code: string): { ok: true; step: number } | { ok: false } {
  const totp = totpFromEnv();
  if (!totp) return { ok: false };
  const digits = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(digits)) return { ok: false };
  const delta = totp.validate({ token: digits, window: 1 });
  if (delta === null) return { ok: false };
  const step = Math.floor(Date.now() / 30000) + delta;
  return { ok: true, step };
}
