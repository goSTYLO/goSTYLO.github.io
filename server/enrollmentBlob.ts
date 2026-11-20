import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ENROLLMENT_PATH = 'auth/enrollment.json';
const FILE_PATH = 'tmp/e2e-enrollment.json';

export type EnrollmentRecord = { enrolledAt: string };

function useBlob(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
}

export function enrollmentOverride(): boolean {
  return process.env.ADMIN_ALLOW_ENROLLMENT === '1';
}

export async function isAdminEnrolled(): Promise<boolean> {
  if (!useBlob()) {
    try {
      const raw = await readFile(path.resolve(process.cwd(), FILE_PATH), 'utf8');
      const doc = JSON.parse(raw) as EnrollmentRecord;
      return Boolean(doc.enrolledAt);
    } catch {
      return false;
    }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const { get } = await import('@vercel/blob');
    const blob = await get(ENROLLMENT_PATH, { access: 'private', useCache: false });
    if (!blob) return false;
    const doc = JSON.parse(await new Response(blob.stream).text()) as EnrollmentRecord;
    return Boolean(doc.enrolledAt);
  } catch {
    return false;
  }
}

export async function markAdminEnrolled(): Promise<void> {
  const record: EnrollmentRecord = { enrolledAt: new Date().toISOString() };
  if (!useBlob()) {
    const file = path.resolve(process.cwd(), FILE_PATH);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(record), 'utf8');
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const { put } = await import('@vercel/blob');
  await put(ENROLLMENT_PATH, JSON.stringify(record), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function enrollmentQrAllowed(): Promise<boolean> {
  if (enrollmentOverride()) return true;
  return !(await isAdminEnrolled());
}