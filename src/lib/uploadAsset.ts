export type StoredAsset = { url: string; pathname: string; contentType: string };

export async function uploadAsset(
  file: Blob,
  filename: string,
  storage: 'file' | 'blob',
): Promise<StoredAsset> {
  if (storage !== 'blob') {
    const body = new FormData();
    body.set('file', file, filename);
    const res = await fetch('/api/media', { method: 'POST', body });
    if (!res.ok) throw new Error('UPLOAD_FAILED');
    return (await res.json()) as StoredAsset;
  }
  const { upload } = await import('@vercel/blob/client');
  const blob = await upload(filename, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  });
  return { url: blob.url, pathname: blob.pathname, contentType: file.type || 'application/octet-stream' };
}
