import { adminBypassAllowed, storageMode } from '../src/lib/portfolioPure';
import { SESSION_COOKIE, readCookie, sessionIsValid } from './session';
import { totpFromEnv } from './totp';

function json(data: unknown, status = 200): Response {
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

export function sessionGet(request: Request): Response {
  return json({
    authenticated: sessionIsValid(readCookie(request.headers.get('cookie'), SESSION_COOKIE)),
    bypass: adminBypassAllowed(process.env),
    storage: storageMode(process.env),
    totpConfigured: Boolean(process.env.TOTP_SECRET) && !adminBypassAllowed(process.env),
  });
}

export async function enrollmentGet(): Promise<Response> {
  if (adminBypassAllowed(process.env)) return json({ error: 'NOT_FOUND' }, 404);
  const totp = totpFromEnv();
  if (!totp) return json({ error: 'TOTP_NOT_CONFIGURED' }, 503);
  try {
    const { default: QRCode } = await import('qrcode');
    const qrDataUrl = await QRCode.toDataURL(totp.toString(), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
    });
    return json({ qrDataUrl });
  } catch (error) {
    console.error('enrollment_qr_failed', error);
    return json({ error: 'QR_GENERATION_FAILED' }, 500);
  }
}