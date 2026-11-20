import type { IncomingMessage, ServerResponse } from 'node:http';
import { clearCookieHeader } from '../../server/session';
import { adminBypassAllowed, storageMode } from '../../src/lib/portfolioPure';

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
  res.setHeader('set-cookie', clearCookieHeader(secure(req)));
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      authenticated: false,
      bypass: adminBypassAllowed(process.env),
      storage: storageMode(process.env),
    }),
  );
}