import type { IncomingMessage, ServerResponse } from 'node:http';

export async function incomingToRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? '127.0.0.1';
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || 'http';
  const url = `${proto}://${host}${req.url ?? '/'}`;
  const method = req.method ?? 'GET';
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
    else headers.set(key, value);
  }
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await readRaw(req) : undefined;
  return new Request(url, { method, headers, body });
}

function readRaw(req: IncomingMessage): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    req.on('error', reject);
  });
}

export function nodeAdapter(handler: (request: Request) => Promise<Response>) {
  return async function vercelHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      const request = await incomingToRequest(req);
      const response = await handler(request);
      await writeResponse(res, response);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ error: 'SERVER_ERROR' }));
    }
  };
}

export async function writeResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  const cookies =
    typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });
  if (cookies.length > 0) res.setHeader('set-cookie', cookies);
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}
