import { useState, type SyntheticEvent } from 'react';
import BlueprintCard from '@/components/common/BlueprintCard';
import BlueprintGridBackground from '@/components/common/BlueprintGridBackground';
import { go } from '@/lib/route';

const control =
  'inline-flex min-h-11 items-center justify-center border border-[var(--border-cyan)] px-3 font-mono text-xs text-[var(--text-primary)]';
const field =
  'min-h-11 w-full border border-[var(--border-cyan)] bg-[var(--bg-surface)] px-3 font-mono text-sm text-[var(--text-primary)]';

type AdminPinSheetProps = {
  code: string;
  status: string;
  totpConfigured: boolean;
  enrolled: boolean;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
};

export default function AdminPinSheet({
  code,
  status,
  totpConfigured,
  enrolled,
  onCodeChange,
  onVerify,
}: AdminPinSheetProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const statusTone =
    status === 'CODE_REJECTED'
      ? 'text-[var(--accent-magenta)]'
      : status === 'CHECKING_PIN'
        ? 'text-[var(--accent-cyan)]'
        : 'text-[var(--text-muted)]';

  async function loadEnrollmentQr() {
    if (qrDataUrl || qrLoading || !totpConfigured) return;
    setQrLoading(true);
    setQrError(null);
    try {
      const res = await fetch('/api/auth/enrollment', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 503) {
          setQrError('TOTP not configured on the server.');
          return;
        }
        if (res.status === 401 || res.status === 403) {
          setQrError('This deployment is access-protected. Open the site on your production domain or disable Vercel Authentication for Production.');
          return;
        }
        setQrError(`Could not load enrollment QR (HTTP ${res.status}).`);
        return;
      }
      const body = (await res.json()) as { qrDataUrl?: string };
      if (body.qrDataUrl) setQrDataUrl(body.qrDataUrl);
      else setQrError('Invalid enrollment response.');
    } catch {
      setQrError('Could not load enrollment QR.');
    } finally {
      setQrLoading(false);
    }
  }

  function onSetupToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open) void loadEnrollmentQr();
  }

  return (
    <div
      data-testid="pin-sheet"
      className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      <BlueprintGridBackground />
      <div className="relative z-[1] flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-4 flex w-full max-w-md justify-start">
          <button
            type="button"
            className={control}
            data-testid="pin-back"
            onClick={() => go('/')}
          >
            [BACK_TO_SITE]
          </button>
        </div>
        <BlueprintCard className="w-full max-w-md">
          <p className="font-mono text-xs text-[var(--accent-cyan)]">[ADMIN_PIN]</p>
          <p className="mt-2 font-mono text-[10px] tracking-wide text-[var(--text-muted)]">
            CHANNEL: /console · AUTH: TOTP · SYS_STATUS: LOCKED
          </p>
          <p className="mt-4 font-sans text-sm text-[var(--text-muted)]">
            Enter the 6-digit code from Microsoft Authenticator.
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            className={`${field} mt-4`}
            aria-label="Authenticator code"
          />
          <button
            type="button"
            className={`${control} mt-3 w-full`}
            onClick={() => onVerify()}
          >
            [VERIFY]
          </button>
          <p className={`mt-3 font-mono text-xs ${statusTone}`}>{status}</p>

          {totpConfigured && !enrolled ? (
            <details className="mt-6 border-t border-[var(--border-cyan)] pt-4" onToggle={onSetupToggle}>
              <summary className="cursor-pointer list-none font-mono text-xs text-[var(--accent-cyan)] marker:content-none [&::-webkit-details-marker]:hidden">
                [FIRST_TIME_SETUP]
              </summary>
              <p className="mt-3 font-sans text-xs text-[var(--text-muted)]">
                In Microsoft Authenticator, choose <strong>Other account</strong> and scan this QR once.
              </p>
              <div className="mt-3 flex justify-center rounded border border-[var(--border-cyan)] bg-[var(--bg-surface)] p-3">
                {qrLoading ? (
                  <p className="font-mono text-[10px] text-[var(--text-muted)]">LOADING_QR…</p>
                ) : null}
                {qrError ? (
                  <p className="font-mono text-[10px] text-[var(--accent-magenta)]">{qrError}</p>
                ) : null}
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Authenticator enrollment QR code"
                    width={220}
                    height={220}
                    className="size-[220px]"
                    data-testid="enrollment-qr"
                  />
                ) : null}
              </div>
            </details>
          ) : (
            <p className="mt-6 border-t border-[var(--border-cyan)] pt-4 font-mono text-[10px] text-[var(--text-muted)]">
              Configure <code className="text-[var(--text-primary)]">TOTP_SECRET</code> in Vercel to enable PIN login.
            </p>
          )}
        </BlueprintCard>
      </div>
    </div>
  );
}