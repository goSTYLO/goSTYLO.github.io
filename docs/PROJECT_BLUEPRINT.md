# PROJECT BLUEPRINT & DESIGN SYSTEM SPECIFICATION

Primary Live Inspiration: https://www.sutera.ch/ ("Cyber / Lab Reality" Modes)  
Target Focus: Full-Stack Developer Portfolio (Web, Mobile, Cloud)  
Tech Stack: React (Vite ecosystem), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React (`lucide-react`)  
Package Manager: `pnpm`  
Public URL: https://gostylo.github.io/

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
| Data | [`src/data/`](../src/data/) | Portfolio content + build-time document helpers |
| Services | [`src/services/`](../src/services/) | Frontend API client stubs (`aiClient.ts` → future Cloud Run) |
| Backend shell | [`ai-service/`](../ai-service/) | Decoupled AI service Dockerfile (not deployed with Pages) |
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

## 4. Page Layout Architecture

1. **Sticky HUD Header:** System logo `[SYS_ID: TAMAYO_AARON_FULLSTACK]`, live status indicator (`SYS_STATUS: ONLINE`), section navigation (`[OVERVIEW]`, `[SYSTEMS]`, `[SKILLS]`, `[CONTACT]` — smooth scroll + scroll-spy highlight; see [`src/data/navSections.ts`](../src/data/navSections.ts)), Theme Toggle, and `[LAUNCH CHATBOT]` trigger button. Opening CV closes the chatbot drawer and vice versa. **Below `lg`:** single compact row (SYS_ID + status + `[MENU]` / `[CLOSE]`); nav, clock, theme, and chatbot live in a full-width HUD sheet (backdrop fade + sheet slide-down on open, reverse on close; `hud-menu-*` in [`globals.css`](../src/styles/globals.css); backdrop dismiss, Esc, body scroll lock). **`lg+`:** full three-cluster bar unchanged ([`HeaderHUD.tsx`](../src/components/hud/HeaderHUD.tsx), [`LocalClock.tsx`](../src/components/hud/LocalClock.tsx), [`ThemeToggle.tsx`](../src/components/hud/ThemeToggle.tsx)).

   **Hidden CV (hero portrait trigger):** Hero [`hero-ascii-one.tsx`](../src/components/sections/hero/hero-ascii-one.tsx) portrait button (`.cv-photo-trigger`) toggles `[CV_AST_VIEWER]` — not a nav pill.

   **Hidden CV overlay (`[CV_AST_VIEWER]`):** [`CvAstOverlay.tsx`](../src/components/sections/cv/CvAstOverlay.tsx) — `fixed` panel below sticky header (`top-14` mobile, `top-[4.5rem]` at `lg+`), `z-30` under header (`z-40`). Sticky toolbar: title + `[X]` on first row; `[ZOOM −]` / `[ZOOM +]` / `[DOWNLOAD_CV_PDF]` on second row on narrow widths. Esc to close. Top block: portrait + name; AST `identity` holds location + contact only. Resume 1:1 from [`src/data/cv.ts`](../src/data/cv.ts) / [myResume.md](myResume.md); expandable AST with CSS collapse/chevron animations (`prefers-reduced-motion` off). PDF at [`public/cv/aaron-tamayo-resume.pdf`](../public/cv/aaron-tamayo-resume.pdf) (synced from [`assets/AARON AST friendly resume with portfolio.pdf`](../assets/AARON%20AST%20friendly%20resume%20with%20portfolio.pdf) on build). Footer: `[DOWNLOAD_CV_PDF]` only.

2. **Hero Section ("System Architecture Overview"):** Standalone section **without** `BlueprintCard`. Left column: large portrait (`/aaron-profile.jpg`, ~42% width on desktop) with HUD telemetry overlay (subject, Serbisyo role/org link to serbisyoprovider.com, stack strip, coords). Right column: H1 `LEAD FULL-STACK ENGINEER`, name line, one-sentence founder-partner subtitle, location + GitHub strip, single CTA `[EXPLORE_SYSTEMS]`. Stack telemetry deferred to Skill Raster + Project Matrix. Decorative CAD corner frames. Component: [`HeroSection.tsx`](../src/components/sections/hero/HeroSection.tsx) → [`hero-ascii-one.tsx`](../src/components/sections/hero/hero-ascii-one.tsx).

3. **Technical Skills (Skill Raster):** [`SkillRaster.tsx`](../src/components/sections/skill-raster/SkillRaster.tsx) at `#skills` (`[SKILLS]` nav). **No outer `BlueprintCard`** — section chrome matches Project Matrix (mono tag + H2 + note). Five resume groups from [`cvDocument.technicalSkills`](../src/data/cv.ts) via [`src/lib/skillGroups.ts`](../src/lib/skillGroups.ts): Languages, Frameworks & Web, Databases & Middleware, DevOps & Infrastructure, Security & Tools. [`CoverflowCarousel`](../src/components/common/ui/coverflow-carousel.tsx): CAD square plates (border, surface, corner `<Plus />`, Lucide category icon); caption below with monospace `[chip]` list for the focused group. Square prev/next controls (blueprint border). Drag, loop, arrow keys; `prefers-reduced-motion` flattens 3D rake and snaps without ease.

4. **Project Matrix:** [`ProjectMatrix.tsx`](../src/components/sections/project-matrix/ProjectMatrix.tsx) + [`src/data/projects.ts`](../src/data/projects.ts). `#project-matrix` is a HUD nav target (`[SYSTEMS]`). **Serbisyo** is a full-width featured card; remaining systems sit in a 2-column grid. Each card uses [`ProjectCard`](../src/components/sections/project-matrix/ProjectCard.tsx) on [`BlueprintCard`](../src/components/common/BlueprintCard.tsx) with **blueprint window** chrome ([`ProjectWindowChrome.tsx`](../src/components/sections/project-matrix/ProjectWindowChrome.tsx), `.blueprint-window*` in [`globals.css`](../src/styles/globals.css)): mono title bar (`sysRef` or `id`), `[STATUS: …]`, decorative ticks, inset body frame, `CNTR N°{nn}` footer (`nn` = 1-based index in `projects`). Inner layout: carousel | copy side-by-side at `lg+` for **featured and grid** cards; stacked below `lg`. Telemetry strip: context + domain tags only (no duplicate sys ref / status). Role-first copy (`[ROLE: …]`), shadcn/Embla carousel + lightbox, NDA placeholders (`REDACTED`), `[ARCH_SPECS]` on non-NDA academic/capstone entries. Carousel: `wide` slides `aspect-[16/10]` + `object-cover`, `lg:min-h-[280px]` in split layout; `mobile` artboards `object-contain`. **NDA ceiling:** Serbisyo and Shija WMS/POS copy limited to [myResume.md](myResume.md). **Serbisyo** live: [serbisyoprovider.com](https://serbisyoprovider.com).

5. **Right Slide-Over AI Chatbot Panel (`[AI_CHATBOT_INTERFACE]`):**
   - Phase 1 ships a closed placeholder panel only (header trigger + empty drawer). Chat runtime belongs to a later phase; API stub in [`src/services/aiClient.ts`](../src/services/aiClient.ts), backend shell in [`ai-service/`](../ai-service/).
   - Triggered via header `[LAUNCH CHATBOT]` or bottom-right floating widget (`[SYS_CHATBOT: ONLINE]`).
   - Slides from the right edge over the viewport using Framer Motion (`x: '100%'` to `x: 0`) — motion pending; structure in [`AIChatDrawer.tsx`](../src/components/ai-drawer/AIChatDrawer.tsx), [`QuickChips.tsx`](../src/components/ai-drawer/QuickChips.tsx), [`TerminalInput.tsx`](../src/components/ai-drawer/TerminalInput.tsx).
   - Features socket status header, terminal-style message logs (`> SYSTEM_RESPONSE:`), monospace prompt suggestion chips, and terminal input prompt (`$ ask a question...`).

6. **Contact (PowerShell terminal):** [`FooterConsole.tsx`](../src/components/sections/footer/FooterConsole.tsx) at `#contact` — no separate section title; window chrome is the visual header. Uses [`BlueprintCard`](../src/components/common/BlueprintCard.tsx) with `frameless` (crosshairs only, no border/surface) so the console can run full content width. Windows PowerShell–style window chrome (`powershell-*` in [`globals.css`](../src/styles/globals.css): `#012456` console, dark title bar, yellow `PS` prompt, Consolas body). Typewriter log (copyright, education, contact from [`src/data/profile.ts`](../src/data/profile.ts) / [myResume.md](myResume.md)) plus blueprint bracket actions: `[SEND_MESSAGE]`, `[DOWNLOAD_CV]` ([myResume.md](myResume.md) raw import from `docs/`), `[VIEW_GITHUB]`, `[COPY_CONTACT]`.

## 5. Ambient Motion (Background & Theme)

Fixed full-viewport layer: [`BlueprintGridBackground.tsx`](../src/components/common/BlueprintGridBackground.tsx) (`z-index: 0`, `pointer-events: none`, `aria-hidden`).

1. **Static blueprint grid:** 32×32 SVG pattern using `var(--border-cyan)`.
2. **Data highway lanes:** Horizontal and vertical glowing segments aligned to 32px grid rails; CSS `@keyframes` with desynced durations (6–18s). Intensity tokens: `--motion-grid-lane-opacity`, `--motion-lane-glow`, `--motion-orb-glow`, `--motion-orb-blur` (light mode uses high lane/orb opacity and stronger teal mix on sand canvas).
3. **Orbs & sparks:** Soft blurred accent orbs plus tiny spark dots; drift keyframes (25–40s). Intensity token: `--motion-orb-opacity`.
4. **Theme crossfade:** View Transitions API (`document.startViewTransition`) on HUD `[THEME: …]` toggle (~450ms opacity crossfade on `:root`). Theme tokens apply inside `flushSync` so the new snapshot matches CSS variables. Implemented in [`src/context/ThemeContext.tsx`](../src/context/ThemeContext.tsx).
5. **`prefers-reduced-motion`:** Lanes, orbs, sparks, theme crossfade, and HUD crosshair follower disabled; instant theme swap.
6. **HUD crosshair follower:** [`BlueprintCrosshairCursor.tsx`](../src/components/common/BlueprintCrosshairCursor.tsx) — fixed `pointer-events: none` layer (`z-index: 90`), centered Lucide `Plus` using `var(--crosshair)`. Spring-smoothed rAF trail (slight lag + bounce). **Mouse:** visible while the pointer is over the page; hides on `mouseleave` of `<html>`. **Touch / pen:** visible only during active contact (`pointerdown` → `pointerup` / `cancel`), follows finger while scrolling. **Click / tap (CAD registration ping):** on `pointerdown`, Plus squeezes (~0.82 scale) and an expanding square ring (`1px` `var(--border-cyan)`, 16px→48px fade) plays; on release, Plus eases back with slight overshoot. Styles: `crosshair-*` in [`globals.css`](../src/styles/globals.css). Native OS cursor is never hidden.

## 6. Personal Details Source

[myResume.md](myResume.md) is the only source for identity, contact, role, and education copy. Do not invent those fields.

- **Name:** Aaron Christian B. Tamayo
- **Location:** Dagupan City, Pangasinan, Philippines
- **Contact:** +63 966 663 8967 · tamayo.aaron.benavides.ien@gmail.com · github.com/goSTYLO
- **Current role:** Lead Full-Stack Engineer (Freelance / Contract) at Serbisyo & Shija Corporation, Jan. 2026 – Present
- **Education:** PHINMA University of Pangasinan, BS Information Technology – System Development, expected 2027. Academic exemption wording on the resume (Managing IT Resources and IT Business Solutions) wins over PRD course codes.

## 7. GitHub Pages Publishing

This repository is the user site `goSTYLO.github.io`. The portfolio is a **static Vite build**. Node and Express are showcased skills, not a Pages runtime.

- Vite `base` is `'/'` (user site is served from the domain root).
- Source stays on `main`. `dist/` is gitignored. Publishing is GitHub Actions (`.github/workflows/pages.yml`), not a committed build.
- Install and CI use **pnpm** (`pnpm install --frozen-lockfile`). Commit `pnpm-lock.yaml`.
- `public/.nojekyll` ships in the artifact so Pages does not drop `_`-prefixed asset paths.
- `pnpm build` copies `dist/index.html` to `dist/404.html` as the SPA fallback.
- Static assets (CV, screenshots, favicon) belong in `public/`.
- No server, API routes, or environment secrets on Pages.
- One GitHub setting is outside the repo: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
