# Hosting — Vercel

GitHub Pages publishing is retired. `.github/workflows/pages.yml` is gone, and the build no longer copies `index.html` to `404.html`. The site is a Vite SPA on Vercel. `vercel.json` sends every path except `/api` to `/index.html`, so a refresh on `/console` stays in the app.

https://gostylo.github.io/ can keep serving the last Pages deploy until you turn Pages off. That switch is outside the repo:

**GitHub → Settings → Pages → Build and deployment → Source: None.**

## Local

Node 22. pnpm 9.15.9 (`packageManager` in `package.json`).

```bash
pnpm install
pnpm dev
```

`pnpm dev` serves the UI and the local API. It writes `tmp/e2e-content.json` and skips the Authenticator PIN. `vercel dev` is the path that talks to the real Blob store.

## Production project

```bash
pnpm exec vercel login
pnpm exec vercel --yes
```

Framework is Vite. Install command `pnpm install`. Build command `pnpm build`. Output directory `dist`.

The production hostname is whatever Vercel assigns. The build reads `VERCEL_PROJECT_PRODUCTION_URL` for canonical and JSON-LD tags. Do not hardcode a guessed `*.vercel.app` name in the repo.

Do **not** set `ADMIN_AUTH_BYPASS` on Preview or Production. Those environments always ask for the PIN.

### One-time Authenticator setup

```bash
pnpm totp:setup
```

In Microsoft Authenticator choose **Other account** and scan the printed URI. Put the printed `TOTP_SECRET` and a long random `SESSION_SECRET` in the Vercel project environment. Both are server-only. Never prefix them with `VITE_`. Do not commit the command output.

Link a Blob store so Vercel injects `BLOB_READ_WRITE_TOKEN`. The first time `content/portfolio.json` is missing, the function writes the seed once. Later deploys do not overwrite it.

Optional `VITE_CONTENT_BLOB_URL` is the public URL of that JSON. It is not a secret. Without it, the page reads `GET /api/content`.

Hobby Blob limits to design around: 1 GB storage, 10 GB transfer, 10,000 simple operations, 2,000 advanced operations per month. Going over pauses Blob for the rest of that 30-day window. There is no overage charge.

Images are WebP (longest edge 1600px, quality 0.72, reject over 1.5 MB). The CV PDF cap is 4 MB. The build still copies the seed PDF into `public/cv` as a fallback. The live download URL is `cvPdf.url` in the document, so a rebuild does not replace an uploaded PDF.

## Tests

`.github/workflows/e2e.yml` runs `pnpm check` and `pnpm test:e2e` on pull requests and on `main`. CI sets `ADMIN_AUTH_BYPASS=1` and `CONTENT_STORE=file`, and it does not set `VERCEL_ENV`. It does not write production Blob and it does not deploy the bypass flag.
