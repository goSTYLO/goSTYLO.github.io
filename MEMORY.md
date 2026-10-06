# MEMORY.md — Project Context & Change Log

## System Context

- **Project:** Full-Stack Developer Blueprint Portfolio
- **Inspiration Anchor:** https://www.sutera.ch/
- **Tech Stack:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
- **Package Manager:** pnpm
- **Public URL:** https://gostylo.github.io/
- **Core Domains:** Web (React, Vite), Mobile (Flutter), Cloud/Backend (Node.js, Express, Google Cloud Run)
- **Visual Style:** CAD / HUD Blueprint (Inverted Light/Dark Modes)
- **Personal Details:** `myResume.md`
- **Serbisyo Live Domain:** serbisyoprovider.com

## Agent Operational Rules

1. Always reference `PROJECT_BLUEPRINT.md` before generating or modifying UI components.
2. Log all architectural updates, theme adjustments, and new component implementations in the Change Log below.

## Change Log

### [2026-10-06] Initial System Blueprint & Rules Established

- Linked https://www.sutera.ch/ as visual structural anchor.
- Generated `PROJECT_BLUEPRINT.md` establishing design tokens, typography, page sections, and inverted theme rules.
- Set up 4-column tech domain structure (Web, Mobile, Backend, Cloud).
- Specified right-side slide-over AI Chatbot drawer (`[AI_COPILOT_INTERFACE]`).
- Established `MEMORY.md` and agent guidelines via `.cursor/rules/portfolio-blueprint.mdc`.

### [2026-10-06] Phase 1 Foundation & HUD Shell

- Scaffolded a static Vite + React app with Tailwind v3, PostCSS, and `lucide-react`. Install and CI use **pnpm** (`packageManager` in `package.json`; commit `pnpm-lock.yaml`).
- Defined inverted Light/Dark CSS variables in `src/styles/globals.css` (`--bg-primary`, `--bg-surface`, `--text-primary`, `--text-muted`, `--border-cyan`, `--accent-cyan`, `--crosshair`, `--status-online`) and mapped them in `tailwind.config.js` with JetBrains Mono / Space Grotesk font families.
- Added `ThemeContext` (`data-theme` + Tailwind `dark` class, `localStorage`, no-flash script in `index.html`).
- Built `BlueprintCard` (1px cyan border, semi-transparent surface, hover glow, four `<Plus />` CAD crosshairs) and sticky `HeaderHUD` (SYS_ID, pulsing ONLINE status, `[ALL]/[WEB]/[MOBILE]/[CLOUD]` filters, UTC+8 / PST|PDT clock, theme toggle, AI launcher).
- Assembled `App.jsx` shell with blueprint grid overlay and empty Hero / Domains / Project Matrix / Footer placeholders. `[LAUNCH AI_ASSISTANT]` opens a closed `[AI_COPILOT_INTERFACE]` placeholder; chat runtime is deferred to Phase 4.
- GitHub Pages: `vite.config.js` `base: '/'`, `.github/workflows/pages.yml` (pnpm frozen install + build + deploy), `public/.nojekyll`, build copies `dist/index.html` → `dist/404.html`. `dist/` gitignored.
- Recorded Serbisyo live domain `serbisyoprovider.com` and pointed personal copy at `myResume.md`.

### [2026-10-06] Phase 2 Hero + TypeScript + shadcn

- Migrated the app shell to TypeScript (`src/main.tsx`, `App.tsx`, `HeaderHUD`, `BlueprintCard`, `ThemeContext`). Vite `@` alias, `tsconfig` project references, ESM `scripts/copy-404.mjs`.
- Initialized shadcn (`components.json`, `src/lib/utils.ts`, `src/components/ui/`). Mapped shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--border`) onto existing blueprint tokens. Did **not** adopt Geist or Unicorn Studio.
- Built hybrid hero (`HeroSection` → `hero-ascii-one.tsx`): CAD corner frames, left-column portrait `/aaron-profile.jpg`, PRD headline/telemetry, resume role/location/GitHub, `[EXPLORE_SYSTEMS]` scroll to `#project-matrix`, `[LAUNCH_AI_COPILOT]` opens Phase 4 placeholder. Hero is not wrapped in `BlueprintCard`.
- Light mode contrast: deepened `--accent-cyan` (`#00596B`), `--text-muted` (`#2A3D52`), and blueprint borders for sand-canvas readability.

### [2026-10-06] Chatbot naming (no assistant/copilot)

- Renamed UI labels to `[LAUNCH CHATBOT]` and drawer header `[AI_CHATBOT_INTERFACE]`; props `onLaunchChatbot` / `chatbotOpen`. Updated `PROJECT_BLUEPRINT.md` and `PRD.md`.

### [2026-10-06] Ambient grid motion + theme reveal

- Added `BlueprintGridBackground` with 32px-aligned data highway lanes, drifting orbs/sparks, and motion opacity tokens on light/dark themes.
- Theme toggle uses View Transitions API root crossfade (~450ms); respects `prefers-reduced-motion`.
- Documented in `PROJECT_BLUEPRINT.md` §5 Ambient Motion.

### [2026-10-06] Hero redundancy trim

- Hero H1 `LEAD FULL-STACK ENGINEER`; single founder-partner subtitle; location + GitHub strip; removed telemetry grid and hero chatbot CTA.
- Portrait telemetry overlay highlights Serbisyo pioneer role, live org link, and stack strip; broader stack detail in Domains + Project Matrix.
- Updated `PRD.md`, `PROJECT_BLUEPRINT.md`.

### [2026-10-06] Project Matrix (Phase 3)

- Added [`src/data/projects.ts`](src/data/projects.ts) for Serbisyo (featured), Shija WMS/POS, RescueLink (capstone), and My Crew Manager (academic).
- NDA-safe copy for industry projects: resume ceiling only; academic projects may use README feature detail in `[ARCH_SPECS]`.
- Built [`ProjectCard`](src/components/ProjectCard.tsx) (role-first HUD, carousel placeholders, gated specs) and [`ProjectMatrix`](src/components/ProjectMatrix.tsx).
- Replaced HUD domain filters with section nav ([`navSections.ts`](src/data/navSections.ts): Overview, Systems, Domains, Console) with smooth scroll and scroll-spy.
- Project carousels use [`public/projects/`](public/projects/) (copied from [`assets/`](assets/)); Serbisyo mobile artboards use `layout: mobile` + `object-contain`. Enterprise Warehouse folder pending assets.
- Installed shadcn `carousel` + `button`; carousel nav restyled to blueprint borders.
- Mounted matrix at `#project-matrix` in [`App.tsx`](src/App.tsx); updated `PROJECT_BLUEPRINT.md` §4.

### [2026-10-06] HUD crosshair cursor follower

- Added [`BlueprintCrosshairCursor`](src/components/BlueprintCrosshairCursor.tsx): spring-trailing Lucide `Plus` (`--crosshair`), mouse-always-on-page vs touch-while-pressed, `prefers-reduced-motion` off, mounted in [`App.tsx`](src/App.tsx).
- Documented in `PROJECT_BLUEPRINT.md` §5.

### [2026-10-06] Crosshair click / tap ping

- CAD registration ping on pointer down/up: expanding square ring + Plus press/release (`crosshair-*` keyframes in [`globals.css`](src/styles/globals.css)); mouse, touch, and pen.
- Updated `PROJECT_BLUEPRINT.md` §5 item 6.
