import * as OTPAuth from 'otpauth';

export function totpFromEnv(): OTPAuth.TOTP | null {
  const secret = process.env.TOTP_SECRET;
  if (!secret) return null;
  return new OTPAuth.TOTP({
    issuer: 'Aaron Portfolio',
    label: 'admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}