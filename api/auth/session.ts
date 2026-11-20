import type { IncomingMessage, ServerResponse } from 'node:http';

function bypassAllowed(): boolean {
  return (
    process.env.ADMIN_AUTH_BYPASS === '1' &&
    process.env.VERCEL_ENV !== 'production' &&
    process.env.VERCEL_ENV !== 'preview'
  );
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
    return;
  }
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      authenticated: false,
      bypass: bypassAllowed(),
      storage: process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' ? 'blob' : 'file',
      totpConfigured: Boolean(process.env.TOTP_SECRET) && !bypassAllowed(),
    }),
  );
}