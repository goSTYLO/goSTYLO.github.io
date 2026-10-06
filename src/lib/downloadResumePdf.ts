import { profile } from '@/data/profile';

export function downloadResumePdf(): void {
  const anchor = document.createElement('a');
  anchor.href = profile.cvPdfUrl;
  anchor.download = profile.cvPdfDownloadFileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
