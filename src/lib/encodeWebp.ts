import { scaleToMaxEdge } from '@/lib/portfolioPure';

export const WEBP_MAX_EDGE = 1600;
export const WEBP_QUALITY = 0.72;
const MAX_BYTES = 1_500_000;

export async function encodeWebp(file: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = scaleToMaxEdge(bitmap.width, bitmap.height, WEBP_MAX_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('CANVAS_UNAVAILABLE');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const canvasBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/webp', WEBP_QUALITY);
  });
  if (canvasBlob && canvasBlob.type === 'image/webp') {
    if (canvasBlob.size > MAX_BYTES) throw new Error('IMAGE_TOO_LARGE');
    return { blob: canvasBlob, width, height };
  }

  const { encode } = await import('@jsquash/webp');
  const bytes = await encode(ctx.getImageData(0, 0, width, height), { quality: 72 });
  const blob = new Blob([bytes], { type: 'image/webp' });
  if (blob.size > MAX_BYTES) throw new Error('IMAGE_TOO_LARGE');
  return { blob, width, height };
}
