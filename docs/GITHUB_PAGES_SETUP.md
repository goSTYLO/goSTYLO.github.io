# GitHub Pages setup — goSTYLO.github.io

Personal checklist to publish this portfolio as a **user site** at **https://gostylo.github.io/**.

This repo is already a static Vite + React SPA. Pages serves the **built** `dist/` folder. There is no Node/Express runtime on Pages.

---

## What this repo already has

Do **not** recreate these. They are the deploy path.

| Piece | Why it matters |
|---|---|
| Repo name `goSTYLO.github.io` | User sites must be `<username>.github.io` (lowercase). That is why the URL has no extra path. |
| `vite.config.ts` → `base: '/'` | User site is served from the domain root. Project sites (`username.github.io/repo`) would use `base: '/repo/'` instead. |
| `.github/workflows/pages.yml` | On every push to `main` (or manual run): `pnpm install --frozen-lockfile` → `pnpm build` → upload `dist/` → deploy. |
| `packageManager: pnpm@9.15.9` + committed `pnpm-lock.yaml` | CI uses frozen lockfile. Missing lockfile = failed build. |
| `public/.nojekyll` | Pages used to run Jekyll. Files/folders starting with `_` get dropped unless this file is present. Vite emits `_`-prefixed assets. |
| `scripts/copy-404.mjs` | Copies `dist/index.html` → `dist/404.html` so SPA routes do not 404 on refresh. |
| `dist/` in `.gitignore` | Source lives on `main`. The workflow builds; you never commit the output. |

---

## 0. One-time machine setup

```bash
# Node 22+ (matches CI)
node -v

# pnpm 9 (matches package.json packageManager)
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm -v
```

From the repo root:

```bash
pnpm install
pnpm dev          # local: http://localhost:5173
pnpm build        # must succeed before you push
pnpm preview      # serves dist/ — closest local stand-in for Pages
```

If `pnpm build` fails locally, GitHub Actions will fail the same way. Fix it here first.

---

## 1. GitHub repo checklist

1. Remote is **https://github.com/goSTYLO/goSTYLO.github.io** (or your SSH equivalent).
2. Default branch is **`main`**. The workflow only deploys that branch.
3. Repo is **public** (GitHub Free cannot publish Pages from a private user site).
4. You are the owner (or have admin). Pages settings and the `github-pages` environment need that.

Push source, not `dist/`:

```bash
git add -A
git status          # dist/ and node_modules/ must not appear
git commit -m "…"
git push origin main
```

---

## 2. The one setting that is outside the repo

GitHub does not turn Pages on from the workflow file alone.

1. Open the repo on GitHub → **Settings** → **Pages**.
2. **Build and deployment** → **Source:** **GitHub Actions** (not “Deploy from a branch”).
3. Leave custom domain empty unless you later add one.

If Source is still “Deploy from a branch” (`main` / `/docs` / `gh-pages`), this Vite workflow never publishes. That is the usual “Actions is green but the URL is 404” cause.

---

## 3. First deploy

1. Push to `main`, or run **Actions** → **Deploy GitHub Pages** → **Run workflow**.
2. Open **Actions**. You should see two jobs: **build** then **deploy**.
3. First run: GitHub may ask you to **approve** the `github-pages` environment (**Settings** → **Environments**). Approve it once.
4. When **deploy** is green, wait up to a few minutes, then open **https://gostylo.github.io/**.

Workflow permissions already in `.github/workflows/pages.yml`:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

If deploy fails with a Pages permission error, also check **Settings** → **Actions** → **General** → **Workflow permissions** → **Read and write**.

---

## 4. What you should see when it works

- Root URL loads the HUD portfolio (not a Jekyll / README page).
- Hard refresh does not 404.
- Theme toggle and assets load (if CSS 404s, `base` is wrong or `.nojekyll` is missing from the artifact).
- **Settings** → **Pages** shows the live URL.

---

## 5. Rules for this site (do not “fix” these)

- **Do not** set Vite `base` to `'/goSTYLO.github.io/'`. That is for project sites.
- **Do not** commit `dist/` or use the `gh-pages` npm package. Actions is the publisher.
- **Do not** put API keys, `.env`, or a Node server here. Pages is static files only. Chatbot backends belong on Cloud Run / another host.
- **Do** keep static files (CV, screenshots, favicon, `aaron-profile.jpg`) under `public/` so Vite copies them into `dist/`.
- **Do** commit `pnpm-lock.yaml`. Never delete it to “make CI install.”

---

## 6. When something breaks

| Symptom | Likely cause |
|---|---|
| `https://gostylo.github.io/` is 404 | Pages Source is not **GitHub Actions**, first deploy not approved, or DNS still propagating (~10 min). |
| Actions **build** fails on install | `pnpm-lock.yaml` out of date. Run `pnpm install` locally and commit the lockfile. |
| Actions **build** fails on `tsc` / Vite | Same as local `pnpm build`. Fix on your machine. |
| Site loads, CSS/JS 404 | `base` is not `'/'`, or Pages is serving the repo root instead of `dist/`. |
| Blank page, underscore asset 404s | `public/.nojekyll` missing so it never lands in `dist/`. |
| Direct URL / refresh 404 | `404.html` missing — `pnpm build` must run `scripts/copy-404.mjs`. |
| Old site after a green deploy | Browser cache. Hard refresh. Confirm the Action timestamp is newer than the page. |

Inspect the published artifact: **Actions** → latest run → **build** → artifact `github-pages`. It should contain `index.html`, `404.html`, `.nojekyll`, and hashed assets.

---

## 7. Optional later

- **Custom domain** (e.g. `aarontamayo.dev`): Settings → Pages → Custom domain, then a CNAME at your DNS. Vite `base` stays `'/'`.
- **HTTPS**: GitHub Pages enforces it after the domain verifies.
- **Project-site sibling** (a different repo at `gostylo.github.io/some-app`): that repo needs `base: '/some-app/'`. This user-site repo does not.

---

## Related files

- Product/scope: [`PRD.md`](PRD.md) §7
- Design/stack: [`PROJECT_BLUEPRINT.md`](PROJECT_BLUEPRINT.md) §7
- Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml)
- Build: [`package.json`](package.json), [`vite.config.ts`](vite.config.ts), [`scripts/copy-404.mjs`](scripts/copy-404.mjs)
