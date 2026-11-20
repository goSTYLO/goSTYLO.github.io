import * as OTPAuth from 'otpauth';
import qrcode from 'qrcode-terminal';

const secret = new OTPAuth.Secret({ size: 20 });
const totp = new OTPAuth.TOTP({
  issuer: 'Aaron Portfolio',
  label: 'admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret,
});

console.log('Add this account in Microsoft Authenticator as Other account.');
console.log('Do not commit the secret. Put it in Vercel as TOTP_SECRET.');
console.log('');
console.log(`TOTP_SECRET=${secret.base32}`);
console.log(totp.toString());
console.log('');
qrcode.generate(totp.toString(), { small: true });
