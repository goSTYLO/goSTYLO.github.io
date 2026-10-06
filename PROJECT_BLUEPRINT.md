# PROJECT BLUEPRINT & DESIGN SYSTEM SPECIFICATION

Primary Live Inspiration: https://www.sutera.ch/ ("Cyber / Lab Reality" Modes)  
Target Focus: Full-Stack Developer Portfolio (Web, Mobile, Cloud)  
Tech Stack: React (Vite ecosystem), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React (`lucide-react`)  
Package Manager: `pnpm`  
Public URL: https://gostylo.github.io/

## 1. Operating Directives

- **Directive 01:** Every UI component, layout, or style generated MUST strictly follow the design tokens and structural patterns in this document, using https://www.sutera.ch/ as the visual standard for CAD/HUD grid alignment.
- **Directive 02:** Any change to theme parameters, stack configurations, or architectural structure MUST be updated here and logged in `MEMORY.md`.
- **Directive 03:** All structural cards and section containers MUST feature CAD alignment crosshairs (`<Plus />` icons at corner intersections) and semi-transparent 1px blueprint borders.

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
| Blueprint Border | `--border-cyan` | `rgba(0, 229, 255, 0.2)` |
| Accent Cyan | `--accent-cyan` | `#00E5FF` |
| Crosshair Mark | `--crosshair` | `rgba(0, 229, 255, 0.4)` |
| Status Online | `--status-online` | `#12B76A` |

## 3. Typography Rules

- **Monospace (`font-mono`):** JetBrains Mono or Fira Code for metadata, API tags, latencies, timestamps, button labels, and parameters.
- **Display Sans-Serif (`font-sans`):** Space Grotesk or Inter for main section headlines, project titles, and bio descriptions.

## 4. Page Layout Architecture

1. **Sticky HUD Header:** System logo `[SYS_ID: TAMAYO_AARON_FULLSTACK]`, live status indicator (`SYS_STATUS: ONLINE`), section navigation (`[OVERVIEW]`, `[SYSTEMS]`, `[DOMAINS]`, `[CONSOLE]` — smooth scroll + scroll-spy highlight; see [`src/data/navSections.ts`](src/data/navSections.ts)), Theme Toggle, and `[LAUNCH CHATBOT]` trigger button.

2. **Hero Section ("System Architecture Overview"):** Standalone section **without** `BlueprintCard`. Left column: large portrait (`/aaron-profile.jpg`, ~42% width on desktop) with HUD telemetry overlay (subject, Serbisyo role/org link to serbisyoprovider.com, stack strip, coords). Right column: H1 `LEAD FULL-STACK ENGINEER`, name line, one-sentence founder-partner subtitle, location + GitHub strip, single CTA `[EXPLORE_SYSTEMS]`. Stack telemetry deferred to Domains + Project Matrix. Decorative CAD corner frames. Component: [`src/components/HeroSection.tsx`](src/components/HeroSection.tsx) → [`src/components/ui/hero-ascii-one.tsx`](src/components/ui/hero-ascii-one.tsx).

3. **Core Technical Domains (4-Column Grid):**
   - `01. WEB_ENGINEERING` — React, Vite, Tailwind, State Management
   - `02. MOBILE_DEVELOPMENT` — Flutter, Cross-Platform Architecture, Offline-First Storage
   - `03. BACKEND_&_APIS` — Node.js, Express, REST/GraphQL, WebSockets
   - `04. CLOUD_&_DEVOPS` — Google Cloud Run, Docker, CI/CD, PostgreSQL/MongoDB

   Each card includes parameters (e.g., `LATENCY < 50ms`, `UPTIME 99.9%`, `CONTAINERIZED: TRUE`).

4. **Project Matrix:** [`src/components/ProjectMatrix.tsx`](src/components/ProjectMatrix.tsx) + [`src/data/projects.ts`](src/data/projects.ts). `#project-matrix` is a HUD nav target (`[SYSTEMS]`). **Serbisyo** is a full-width featured card; remaining systems sit in a 2-column grid. Each card uses [`ProjectCard`](src/components/ProjectCard.tsx) on [`BlueprintCard`](src/components/BlueprintCard.tsx) with role-first telemetry (`[ROLE: …]`), context tags (`[NDA: ACTIVE]` or `[CONTEXT: CAPSTONE|ACADEMIC]`), shadcn/Embla carousel placeholders (NDA slides captioned `REDACTED`), and `[ARCH_SPECS]` only on non-NDA academic/capstone entries. **NDA ceiling:** Serbisyo and Shija WMS/POS copy is limited to [myResume.md](myResume.md) bullets — no client codenames or README internals. **Serbisyo** live: [serbisyoprovider.com](https://serbisyoprovider.com).

5. **Right Slide-Over AI Chatbot Panel (`[AI_CHATBOT_INTERFACE]`):**
   - Phase 1 ships a closed placeholder panel only (header trigger + empty drawer). Chat runtime belongs to a later phase.
   - Triggered via header `[LAUNCH CHATBOT]` or bottom-right floating widget (`[SYS_CHATBOT: ONLINE]`).
   - Slides from the right edge over the viewport using Framer Motion (`x: '100%'` to `x: 0`).
   - Features socket status header, terminal-style message logs (`> SYSTEM_RESPONSE:`), monospace prompt suggestion chips, and terminal input prompt (`$ ask a question...`).

6. **Footer Console:** Monospace terminal execution log and action buttons (`[SEND_MESSAGE]`, `[DOWNLOAD_CV]`, `[VIEW_GITHUB]`).

## 5. Ambient Motion (Background & Theme)

Fixed full-viewport layer: [`src/components/BlueprintGridBackground.tsx`](src/components/BlueprintGridBackground.tsx) (`z-index: 0`, `pointer-events: none`, `aria-hidden`).

1. **Static blueprint grid:** 32×32 SVG pattern using `var(--border-cyan)`.
2. **Data highway lanes:** Horizontal and vertical glowing segments aligned to 32px grid rails; CSS `@keyframes` with desynced durations (6–18s). Intensity tokens: `--motion-grid-lane-opacity`, `--motion-lane-glow`, `--motion-orb-glow`, `--motion-orb-blur` (light mode uses high lane/orb opacity and stronger teal mix on sand canvas).
3. **Orbs & sparks:** Soft blurred accent orbs plus tiny spark dots; drift keyframes (25–40s). Intensity token: `--motion-orb-opacity`.
4. **Theme crossfade:** View Transitions API (`document.startViewTransition`) on HUD `[THEME: …]` toggle (~450ms opacity crossfade on `:root`). Theme tokens apply inside `flushSync` so the new snapshot matches CSS variables. Implemented in [`src/context/ThemeContext.tsx`](src/context/ThemeContext.tsx).
5. **`prefers-reduced-motion`:** Lanes, orbs, sparks, theme crossfade, and HUD crosshair follower disabled; instant theme swap.
6. **HUD crosshair follower:** [`src/components/BlueprintCrosshairCursor.tsx`](src/components/BlueprintCrosshairCursor.tsx) — fixed `pointer-events: none` layer (`z-index: 90`), centered Lucide `Plus` using `var(--crosshair)`. Spring-smoothed rAF trail (slight lag + bounce). **Mouse:** visible while the pointer is over the page; hides on `mouseleave` of `<html>`. **Touch / pen:** visible only during active contact (`pointerdown` → `pointerup` / `cancel`), follows finger while scrolling. **Click / tap (CAD registration ping):** on `pointerdown`, Plus squeezes (~0.82 scale) and an expanding square ring (`1px` `var(--border-cyan)`, 16px→48px fade) plays; on release, Plus eases back with slight overshoot. Styles: `crosshair-*` in [`globals.css`](src/styles/globals.css). Native OS cursor is never hidden.

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
