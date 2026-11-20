import type { Plugin } from 'vite';
import { incomingToRequest, writeResponse } from './http';
import { route } from './route';

/** Dev-server API. Production functions live in /api and do not set the bypass flag. */
export function attachApi(): Plugin {
  return {
    name: 'portfolio-api',
    configureServer(server) {
      if (process.env.VERCEL_ENV !== 'production' && process.env.VERCEL_ENV !== 'preview') {
        process.env.ADMIN_AUTH_BYPASS ||= '1';
        if (!process.env.BLOB_READ_WRITE_TOKEN) process.env.CONTENT_STORE ||= 'file';
      }
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/')) {
          next();
          return;
        }
        try {
          const request = await incomingToRequest(req);
          const response = await route(request);
          await writeResponse(res, response);
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'SERVER_ERROR' }));
        }
      });
    },
  };
}
