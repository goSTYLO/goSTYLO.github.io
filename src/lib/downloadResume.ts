import resumeMd from '../../myResume.md?raw';
import { profile } from '@/data/profile';

export function downloadResumeMarkdown(): void {
  const blob = new Blob([resumeMd], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = profile.cvDownloadFileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
