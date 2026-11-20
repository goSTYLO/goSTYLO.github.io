import type { IncomingMessage, ServerResponse } from 'node:http';

function bypassAllowed(): boolean {
  return (
    process.env.ADMIN_AUTH_BYPASS === '1' &&
    process.env.VERCEL_ENV !== 'production' &&
    process.env.VERCEL_ENV !== 'preview'
  );
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
    return;
  }
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');

  if (bypassAllowed()) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'NOT_FOUND' }));
    return;
  }
  const secret = process.env.TOTP_SECRET;
  if (!secret) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'TOTP_NOT_CONFIGURED' }));
    return;
  }

  try {
    const OTPAuth = await import('otpauth');
    const totp = new OTPAuth.TOTP({
      issuer: 'Aaron Portfolio',
      label: 'admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret.trim()),
    });
    const { default: QRCode } = await import('qrcode');
    const qrDataUrl = await QRCode.toDataURL(totp.toString(), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
    });
    res.statusCode = 200;
    res.end(JSON.stringify({ qrDataUrl }));
  } catch (error) {
    console.error('enrollment_qr_failed', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'QR_GENERATION_FAILED' }));
  }
}