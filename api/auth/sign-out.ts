import type { IncomingMessage, ServerResponse } from 'node:http';

const SESSION_COOKIE = 'admin_session';

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

function clearCookie(secure: boolean): string {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function secure(req: IncomingMessage): boolean {
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || 'http';
  return proto === 'https';
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('set-cookie', clearCookie(secure(req)));
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      authenticated: false,
      bypass: bypassAllowed(),
      storage: storageMode(),
    }),
  );
}