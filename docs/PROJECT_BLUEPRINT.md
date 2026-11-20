# PROJECT BLUEPRINT & DESIGN SYSTEM SPECIFICATION

Primary Live Inspiration: https://www.sutera.ch/ ("Cyber / Lab Reality" Modes)  
Target Focus: Full-Stack Developer Portfolio (Web, Mobile, Cloud)  
Tech Stack: React (Vite), TypeScript, Tailwind CSS, shadcn/ui, Lucide React (`lucide-react`). Motion is CSS. Framer Motion is not installed.  
Package Manager: `pnpm`  
Public URL: the Vercel production host. Canonical tags use `VERCEL_PROJECT_PRODUCTION_URL` at build time. GitHub Pages is retired.

## 1. Operating Directives

- **Directive 01:** Every UI component, layout, or style generated MUST strictly follow the design tokens and structural patterns in this document, using https://www.sutera.ch/ as the visual standard for CAD/HUD grid alignment.
- **Directive 02:** Any change to theme parameters, stack configurations, or architectural structure MUST be updated here and logged in [`docs/MEMORY.md`](MEMORY.md).
- **Directive 03:** All structural cards and section containers MUST feature CAD alignment crosshairs (`<Plus />` icons at corner intersections) and semi-transparent 1px blueprint borders.

### Source layout (feature modules)

| Domain | Path | Role |
|--------|------|------|
| Common | [`src/components/common/`](../src/components/common/) | `BlueprintCard`, grid/crosshair ambient, typing primitives, shadcn [`ui/`](../src/components/common/ui/) |
| HUD | [`src/components/hud/`](../src/components/hud/) | `HeaderHUD`, `LocalClock`, `ThemeToggle` |
| Sections | [`src/components/sections/`](../src/components/sections/) | `hero/`, `skill-raster/`, `project-matrix/`, `footer/`, `cv/` |
| AI drawer | [`src/components/ai-drawer/`](../src/components/ai-drawer/) | `AIChatDrawer`, `QuickChips`, `TerminalInput` (Phase 4 runtime) |
| Data | [`src/data/`](../src/data/) | Seed modules. Live copy is the Blob document. |
| Content | [`src/content/`](../src/content/) | Document types, `buildSeed()`, public `ContentProvider` |
| Admin | [`src/components/admin/`](../src/components/admin/) | `/console` editor. No nav link. |
| API | [`server/`](../server/), [`api/`](../api/) | Content, media, TOTP session. Vite mounts the same router in dev. |
| Services | [`src/services/`](../src/services/) | Frontend API client stubs (`aiClient.ts` → future Cloud Run) |
| Backend shell | [`ai-service/`](../ai-service/) | Decoupled AI service Dockerfile (not part of the Vercel site) |
| Documentation | [`docs/`](README.md) | Blueprint, PRD, MEMORY, resume source, setup guides |

Unchanged top-level modules: [`src/hooks/`](../src/hooks/), [`src/context/`](../src/context/), [`src/lib/`](../src/lib/), [`src/styles/globals.css`](../src/styles/globals.css). Vite alias `@/*` → `src/*`.

## 2. Inverted Theme Color Tokens (Globals / Tailwind)

All UI color classes MUST use CSS variables so Light/Dark inversion only rewrites `:root` values (`bg-[var(--bg-primary)]`, `text-[var(--text-primary)]`, `border-[var(--border-cyan)]`). Theme is stored as `data-theme="light"|"dark"` on `<html>` plus the Tailwind `dark` class.

### LIGHT MODE (Warm Architectural Sand Canvas + Deep Navy Text)

| Token | CSS Variable | Value |
|-------|--------------|--------|
| Canvas | `--bg-primary` | `#F0ECE1` |
| Card Surface | `--bg-surface` | `#E6DFD5` |
| Primary Text | `--text-primary` | `#061224` |
| Muted Text | `--text-muted` | `#2A3D52` |
| Blueprint Border | `--border-cyan` | `rgba(0, 82, 94, 0.38)` |
| Accent Cyan | `--accent-cyan` | `#00596B` |
| Crosshair Mark | `--crosshair` | `rgba(0, 82, 94, 0.55)` |
| Status Online | `--status-online` | `#12B76A` |

### DARK MODE (Deep Slate Navy Canvas + Light Warm Beige Text)

| Token | CSS Variable | Value |
|-------|--------------|--------|
| Canvas | `--bg-primary` | `#061224` |
| Card Surface | `--bg-surface` | `#091A32` |
| Primary Text | `--text-primary` | `#F0ECE1` |
| Muted Text | `--text-muted` | `#94A3B8` |
| Blueprint Border | `--border-cyan` | `rgba(240, 236, 225, 0.38)` (warm sand/beige; mirrors light canvas `#F0ECE1`) |
| Accent Cyan | `--accent-cyan` | `#00E5FF` |
| Crosshair Mark | `--crosshair` | `rgba(240, 236, 225, 0.55)` |
| Status Online | `--status-online` | `#12B76A` |

## 3. Typography Rules

- **Monospace (`font-mono`):** JetBrains Mono or Fira Code for metadata, API tags, latencies, timestamps, button labels, and parameters.
- **Display Sans-Serif (`font-sans`):** Space Grotesk or Inter for main section headlines, project titles, and bio descriptions.
- **Scrollbars:** Global thin square thumbs in [`globals.css`](../src/styles/globals.css) (`scrollbar-width: thin`, 6px WebKit thumb from `--border-cyan` / `--accent-cyan`, transparent track). Public site and `/console`.

## 4. Page Layout Architecture

1. **Sticky HUD Header:** System logo `[SYS_ID: TAMAYO_AARON_FULLSTACK]`, live status indicator (`SYS_STATUS: ONLINE`), section navigation for enabled sections only (`[OVERVIEW]`, `[SYSTEMS]`, `[SKILLS]`, `[EDUCATION]`, `[CERTIFICATIONS]`, `[CONTACT]` — smooth scroll + scroll-spy highlight; labels come from the content document), Theme Toggle, and `[LAUNCH CHATBOT]` trigger button. A 700ms long-press on the SYS_ID mark, or a direct visit to unlisted `/console`, opens admin. There is no admin nav link. Opening CV closes the chatbot drawer and vice versa. **Below `lg`:** single compact row (SYS_ID + status + `[MENU]` / `[CLOSE]`); nav, clock, theme, and chatbot live in a full-width HUD sheet (backdrop fade + sheet slide-down on open, reverse on close; `hud-menu-*` in [`globals.css`](../src/styles/globals.css); backdrop dismiss, Esc, body scroll lock). Mobile menu, sheet nav, and the SYS_ID control are at least 44px tall. **`lg+`:** full three-cluster bar ([`HeaderHUD.tsx`](../src/components/hud/HeaderHUD.tsx), [`LocalClock.tsx`](../src/components/hud/LocalClock.tsx), [`ThemeToggle.tsx`](../src/components/hud/ThemeToggle.tsx)).

   **Hidden CV (hero portrait trigger):** Hero [`hero-ascii-one.tsx`](../src/components/sections/hero/hero-ascii-one.tsx) portrait button (`.cv-photo-trigger`) toggles `[CV_AST_VIEWER]` when the CV section is enabled — not a nav pill.

   **Hidden CV overlay (`[CV_AST_VIEWER]`):** [`CvAstOverlay.tsx`](../src/components/sections/cv/CvAstOverlay.tsx) — `fixed` panel below the sticky header (`top-16` mobile, `top-28` at `lg+` so the `[X]` control clears the header), `z-30` under header (`z-40`). Sticky toolbar: title + `[X]` on first row; `[ZOOM −]` / `[ZOOM +]` / `[DOWNLOAD_CV_PDF]` on second row on narrow widths. Esc to close. Structured fields in the content document drive the viewer. The PDF is only the downloadable file (`cvPdf.url`, falling back to [`public/cv/aaron-tamayo-resume.pdf`](../public/cv/aaron-tamayo-resume.pdf)). Saving one does not write or delete the other. Footer: `[DOWNLOAD_CV_PDF]` only.

2. **Hero Section ("System Architecture Overview"):** Standalone section **without** `BlueprintCard`. Left column: large portrait (`/aaron-profile.jpg`, ~42% width on desktop) with HUD telemetry overlay (subject, Serbisyo role/org link to serbisyoprovider.com, stack strip, coords). Right column: H1 `LEAD FULL-STACK DEVELOPER`, name line, one-sentence founder-partner subtitle, location + GitHub strip, single CTA `[EXPLORE_SYSTEMS]`. Stack telemetry deferred to Skill Raster + Project Matrix. Decorative CAD corner frames. Component: [`HeroSection.tsx`](../src/components/sections/hero/HeroSection.tsx) → [`hero-ascii-one.tsx`](../src/components/sections/hero/hero-ascii-one.tsx).

3. **Technical Skills (Skill Raster):** [`SkillRaster.tsx`](../src/components/sections/skill-raster/SkillRaster.tsx) at `#skills` (`[SKILLS]` nav) when that section is enabled. **No outer `BlueprintCard`** — section chrome matches Project Matrix (mono tag + H2 + note). Five groups from the content document via [`skillGroupsFrom`](../src/lib/skillGroups.ts): Languages, Frameworks & Web, Databases & Middleware, DevOps & Infrastructure, Security & Tools. [`CoverflowCarousel`](../src/components/common/ui/coverflow-carousel.tsx): CAD square plates (border, surface, corner `<Plus />`, Lucide category icon); caption below with monospace `[chip]` list for the focused group. Square prev/next controls (blueprint border). Drag, loop, arrow keys; `prefers-reduced-motion` flattens 3D rake and snaps without ease.

4. **Project Matrix:** [`ProjectMatrix.tsx`](../src/components/sections/project-matrix/ProjectMatrix.tsx). Projects come from the content document (seeded by [`src/data/projects.ts`](../src/data/projects.ts)), sorted by `order`. `#project-matrix` is a HUD nav target (`[SYSTEMS]`) when that section is enabled. Section chrome: `[PROJECT_MATRIX]`, H2 **Selected Projects**, subtitle on live/capstone/school work and NDA redaction. Featured cards are every project marked `[STAR]` in admin. Each one is a full-width window with `[FEATURED]` in the title bar, stacked in `order`. The rest sit in a 2-column grid. Card titles are real text. The rest of the body still types on. Each card uses [`ProjectCard`](../src/components/sections/project-matrix/ProjectCard.tsx) on [`BlueprintCard`](../src/components/common/BlueprintCard.tsx) with **blueprint window** chrome on the featured card ([`ProjectWindowChrome.tsx`](../src/components/sections/project-matrix/ProjectWindowChrome.tsx), `.blueprint-window*` in [`globals.css`](../src/styles/globals.css)): mono title bar (`sysRef` or `id`), `[STATUS: …]`, decorative ticks, inset body frame, `CNTR N°{nn}` footer. Inner layout: **featured** — blueprint window + carousel | copy at `lg+`; **grid** cards — vertical stack (carousel, then telemetry + copy). Images use `aspect-[16/10]`, `loading="lazy"`, and `decoding="async"`. Uploaded images are WebP, longest edge 1600px. **NDA ceiling:** Serbisyo and Shija WMS/POS copy limited to [myResume.md](myResume.md). **Serbisyo** live: [serbisyoprovider.com](https://serbisyoprovider.com).

   **Education and Certifications:** [`RecordSections.tsx`](../src/components/sections/education/RecordSections.tsx). `#education` is a vertical station log: a cyan rail, a `Plus` node, and one card per school. `#certifications` reuses [`CoverflowCarousel`](../src/components/common/ui/coverflow-carousel.tsx) with `square={false}`: each slide is the full dossier [`BlueprintCard`](../src/components/common/BlueprintCard.tsx) (16/10 plate or `[NO_PLATE]`, date, title, issuer, summary). Plates scale and rotate like the skill raster; drag or arrow controls browse when there is more than one certificate. A plate with an image opens [`ProjectImageLightbox`](../src/components/sections/project-matrix/ProjectImageLightbox.tsx) (`[EXPAND]`, Escape to close). `[NO_PLATE]` stays static. Seed: PHINMA University of Pangasinan, BS IT – System Development, expected 2027, plus the AWS Fundamentals certificate (Zuitt, May 2026). The footer education line is derived from the first education entry.

5. **Right Slide-Over AI Chatbot Panel (`[AI_CHATBOT_INTERFACE]`):**
   - Phase 1 ships a closed placeholder panel only (header trigger + empty drawer). Chat runtime belongs to a later phase; API stub in [`src/services/aiClient.ts`](../src/services/aiClient.ts), backend shell in [`ai-service/`](../ai-service/).
   - Triggered via header `[LAUNCH CHATBOT]` or bottom-right floating widget (`[SYS_CHATBOT: ONLINE]`).
   - Slides from the right edge. The drawer structure is in [`AIChatDrawer.tsx`](../src/components/ai-drawer/AIChatDrawer.tsx), [`QuickChips.tsx`](../src/components/ai-drawer/QuickChips.tsx), and [`TerminalInput.tsx`](../src/components/ai-drawer/TerminalInput.tsx). Framer Motion is not installed; motion stays CSS. The launch control stays off (`SHOW_CHATBOT_LAUNCH` is false).
   - Features socket status header, terminal-style message logs (`> SYSTEM_RESPONSE:`), monospace prompt suggestion chips, and terminal input prompt (`$ ask a question...`).

6. **Contact (PowerShell terminal):** [`FooterConsole.tsx`](../src/components/sections/footer/FooterConsole.tsx) at `#contact` when that section is enabled. Uses [`BlueprintCard`](../src/components/common/BlueprintCard.tsx) with `frameless`. Windows PowerShell–style window chrome (`powershell-*` in [`globals.css`](../src/styles/globals.css)). The log reads the content document (profile, derived education line). Bracket actions: `[SEND_MESSAGE]`, `[DOWNLOAD_CV_PDF]` (`cvPdf.url`), `[VIEW_GITHUB]`, `[COPY_CONTACT]`.

7. **Admin studio:** [`AdminConsole.tsx`](../src/components/admin/AdminConsole.tsx) + [`AdminStudio.tsx`](../src/components/admin/AdminStudio.tsx) at `/console`. Left domain rail (`admin-tab-*`), workspace column with [`BlueprintCard`](../src/components/common/BlueprintCard.tsx) document windows, top bar `[UNSAVED]`/`[SAVED]`, `[VIEW_SITE]`, sticky bottom `[SAVE]` (accent when dirty; `Ctrl/Cmd+S`). Domains: Profile, Sections, Projects, Education, Certifications, Skills, CV — full CRUD on list records; projects/certs/education use list plates + detail window; list reorder via `@dnd-kit` drag handles. Production and Preview ask for a 6-digit Authenticator PIN via [`AdminPinSheet.tsx`](../src/components/admin/AdminPinSheet.tsx). `[FIRST_TIME_SETUP]` + `GET /api/auth/enrollment` only until the first successful PIN (`auth/enrollment.json` in Blob); recovery: set `ADMIN_ALLOW_ENROLLMENT=1`, redeploy, scan once, remove the flag. Local dev and Playwright skip the PIN when `ADMIN_AUTH_BYPASS=1` and `VERCEL_ENV` is neither `production` nor `preview`.

## 5. Ambient Motion (Background & Theme)

Fixed full-viewport layer: [`BlueprintGridBackground.tsx`](../src/components/common/BlueprintGridBackground.tsx) (`z-index: 0`, `pointer-events: none`, `aria-hidden`).

1. **Static blueprint grid:** 64×64 SVG pattern using `var(--border-cyan)`. Cell size is controlled by `GRID_CELL_PX` at the top of [`BlueprintGridBackground.tsx`](../src/components/common/BlueprintGridBackground.tsx) (try 32 | 48 | 64 when iterating).
2. **Data highway lanes:** Horizontal and vertical glowing segments aligned to the same cell pitch as `GRID_CELL_PX`; CSS `@keyframes` with desynced durations (6–18s). Intensity tokens: `--motion-grid-lane-opacity`, `--motion-lane-glow`, `--motion-orb-glow`, `--motion-orb-blur` (light mode uses high lane/orb opacity and stronger teal mix on sand canvas).
3. **Orbs & sparks:** Soft blurred accent orbs plus tiny spark dots; drift keyframes (25–40s). Intensity token: `--motion-orb-opacity`.
4. **Theme crossfade:** View Transitions API (`document.startViewTransition`) on HUD `[THEME: …]` toggle (~450ms opacity crossfade on `:root`). Theme tokens apply inside `flushSync` so the new snapshot matches CSS variables. Implemented in [`src/context/ThemeContext.tsx`](../src/context/ThemeContext.tsx).
5. **`prefers-reduced-motion`:** Lanes, orbs, sparks, theme crossfade, and HUD crosshair follower disabled; instant theme swap.
6. **HUD crosshair follower:** [`BlueprintCrosshairCursor.tsx`](../src/components/common/BlueprintCrosshairCursor.tsx) — fixed `pointer-events: none` layer (`z-index: 90`), centered Lucide `Plus` using `var(--crosshair)`. Spring-smoothed rAF trail (slight lag + bounce). **Mouse:** visible while the pointer is over the page; hides on `mouseleave` of `<html>`. **Touch / pen:** visible only during active contact (`pointerdown` → `pointerup` / `cancel`), follows finger while scrolling. **Click / tap (CAD registration ping):** on `pointerdown`, Plus squeezes (~0.82 scale) and an expanding square ring (`1px` `var(--border-cyan)`, 16px→48px fade) plays; on release, Plus eases back with slight overshoot. Styles: `crosshair-*` in [`globals.css`](../src/styles/globals.css). Native OS cursor is never hidden.

## 6. Personal Details Source

The live source is `content/portfolio.json` in Vercel Blob. [`myResume.md`](myResume.md) and the TypeScript modules under [`src/data/`](../src/data/) are the seed. A deploy does not overwrite an existing Blob document. Do not invent identity fields.

- **Name:** Aaron Christian B. Tamayo
- **Location:** Dagupan City, Pangasinan, Philippines
- **Contact:** +63 966 663 8967 · tamayo.aaron.benavides.ien@gmail.com · github.com/goSTYLO
- **Current role:** Lead Full-Stack Developer (Freelance / Contract) at Serbisyo & Shija Corporation, Jan. 2026 – Present
- **Education:** PHINMA University of Pangasinan, BS Information Technology – System Development, expected 2027. Academic exemption wording on the resume (Managing IT Resources and IT Business Solutions) wins over PRD course codes.

## 7. Vercel hosting

The portfolio is a Vite SPA plus `/api` Node functions. `vercel.json` rewrites every path except `/api` to `/index.html`.

- Install and CI use **pnpm**. Commit `pnpm-lock.yaml`. Output is `dist/`.
- Public reads use the Blob URL (`VITE_CONTENT_BLOB_URL`, not a secret) or `GET /api/content`. Cache window is 60 seconds. Writes go through an authenticated function.
- Images and the CV PDF are separate Blob objects. Client-side WebP: longest edge 1600px, quality 0.72, reject over 1.5 MB. PDF cap 4 MB.
- Server-only env: `TOTP_SECRET`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`. Never prefix those with `VITE_`.
- `ADMIN_AUTH_BYPASS` is for local dev and Playwright only. Preview and Production ignore it.
- Non-JS outline and JSON-LD stay build-time from the seed. After an admin edit, the interactive page updates within the Blob cache window. Social tags update on the next deploy.
- Playwright (`.github/workflows/e2e.yml`) uses a file store and the auth bypass. It does not write production Blob.
- GitHub Pages publishing is removed. In the GitHub repo settings, set Pages → Source to **None**. That switch is outside this repo. See [`GITHUB_PAGES_SETUP.md`](GITHUB_PAGES_SETUP.md).
