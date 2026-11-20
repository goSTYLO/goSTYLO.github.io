import { createHmac } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { isAdminEnrolled, markAdminEnrolled } from '../../server/enrollmentBlob';

const SESSION_COOKIE = 'admin_session';
const MAX_AGE = 8 * 60 * 60;

function bypassAllowed(): boolean {
  return (
    process.env.ADMIN_AUTH_BYPASS === '1' &&
    process.env.VERCEL_ENV !== 'production' &&
    process.env.VERCEL_ENV !== 'preview'
  );
}

function storageMode(): 'file' | 'blob' {
  if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') return 'blob';
  if (process.env.CONTENT_STORE === 'blob' && process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  return 'file';
}

function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (bypassAllowed()) return 'dev-only-session-secret';
  throw new Error('SESSION_SECRET missing');
}

function sign(body: string): string {
  return createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

function createSessionToken(): string {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${body}.${sign(body)}`;
}

function cookieHeader(token: string, secure: boolean, maxAge = MAX_AGE): string {
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

function secure(req: IncomingMessage): boolean {
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || 'http';
  return proto === 'https';
}

function readRaw(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function verifyTotp(code: string): Promise<boolean> {
  const secret = process.env.TOTP_SECRET;
  if (!secret) return false;
  const digits = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(digits)) return false;
  const OTPAuth = await import('otpauth');
  const totp = new OTPAuth.TOTP({
    issuer: 'Aaron Portfolio',
    label: 'admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret.trim()),
  });
  return totp.validate({ token: digits, window: 1 }) !== null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');

  try {
    if (!process.env.TOTP_SECRET) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'CODE_REJECTED' }));
      return;
    }

    let code = '';
    try {
      const raw = await readRaw(req);
      const body = JSON.parse(raw) as { code?: string };
      code = body.code ?? '';
    } catch {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'CODE_REJECTED' }));
      return;
    }

    if (!(await verifyTotp(code))) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'CODE_REJECTED' }));
      return;
    }

    if (!(await isAdminEnrolled())) {
      await markAdminEnrolled();
    }

    const token = createSessionToken();
    res.setHeader('set-cookie', cookieHeader(token, secure(req)));
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        authenticated: true,
        bypass: bypassAllowed(),
        storage: storageMode(),
        totpConfigured: true,
        enrolled: true,
      }),
    );
  } catch (error) {
    console.error('verify_failed', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'SERVER_ERROR' }));
  }
}