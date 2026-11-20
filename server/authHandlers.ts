import { adminBypassAllowed, storageMode } from '../src/lib/portfolioPure';
import { SESSION_COOKIE, readCookie, sessionIsValid } from './session';
import { enrollmentQrAllowed, isAdminEnrolled } from './enrollmentBlob';
import { totpFromEnv } from './totp';

function json(data: unknown, status = 200): Response {
  const headers = new Headers();
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

export async function sessionGet(request: Request): Promise<Response> {
  const bypass = adminBypassAllowed(process.env);
  return json({
    authenticated: sessionIsValid(readCookie(request.headers.get('cookie'), SESSION_COOKIE)),
    bypass,
    storage: storageMode(process.env),
    totpConfigured: Boolean(process.env.TOTP_SECRET) && !bypass,
    enrolled: bypass ? false : await isAdminEnrolled(),
  });
}

export async function enrollmentGet(): Promise<Response> {
  if (adminBypassAllowed(process.env)) return json({ error: 'NOT_FOUND' }, 404);
  if (!(await enrollmentQrAllowed())) return json({ error: 'ENROLLMENT_CLOSED' }, 404);
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