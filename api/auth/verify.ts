import type { IncomingMessage, ServerResponse } from 'node:http';
import { createSessionToken, cookieHeader, verifyTotp } from '../../server/session';
import { adminBypassAllowed, storageMode } from '../../src/lib/portfolioPure';

function readRaw(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function secure(req: IncomingMessage): boolean {
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || 'http';
  return proto === 'https';
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');

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

  const result = verifyTotp(code);
  if (!result.ok) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'CODE_REJECTED' }));
    return;
  }

  const token = createSessionToken();
  const cookie = cookieHeader(token, secure(req));
  res.setHeader('set-cookie', cookie);
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      authenticated: true,
      bypass: adminBypassAllowed(process.env),
      storage: storageMode(process.env),
      totpConfigured: true,
    }),
  );
}