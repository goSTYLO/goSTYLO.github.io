# MEMORY.md — Project Context & Change Log

## System Context

- **Project:** Full-Stack Developer Blueprint Portfolio
- **Inspiration Anchor:** https://www.sutera.ch/
- **Tech Stack:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
- **Package Manager:** pnpm
- **Public URL:** https://gostylo.github.io/
- **Core Domains:** Web (React, Vite), Mobile (Flutter), Cloud/Backend (Node.js, Express, Google Cloud Run)
- **Visual Style:** CAD / HUD Blueprint (Inverted Light/Dark Modes)
- **Personal Details:** [`docs/myResume.md`](myResume.md)
- **Serbisyo Live Domain:** serbisyoprovider.com

## Agent Operational Rules

1. Always reference [`docs/PROJECT_BLUEPRINT.md`](PROJECT_BLUEPRINT.md) before generating or modifying UI components.
2. Log all architectural updates, theme adjustments, and new component implementations in the Change Log below.

## Change Log

### [2026-10-09] NDA telemetry tag

- Industry cards (Serbisyo, Shija) show highlighted `[NDA: ACTIVE]` in [`ProjectCard.tsx`](../src/components/sections/project-matrix/ProjectCard.tsx) telemetry strip.

### [2026-10-09] Project Matrix copy humanized

- Section H2 **Selected Projects** and plain subtitle; card labels `[ROLE]`, `[HIGHLIGHTS]`, `[STACK & HOSTING]`, `[TECH]`, `[DEPLOYED ON]`; friendlier context tags and resume-aligned text in [`projects.ts`](../src/data/projects.ts).

### [2026-10-09] RescueLink live site

- Set `[LIVE_SITE]` on RescueLink in [`projects.ts`](../src/data/projects.ts) to https://rescue-link-front.vercel.app; status `ONLINE`; aligned CV/resume deployment bullet.

### [2026-10-09] Portfolio role copy — engineer → developer

- Replaced “engineer” role/title wording with “developer” across hero, [`portfolioDocument.ts`](../src/data/portfolioDocument.ts), [`cv.ts`](../src/data/cv.ts), [`projects.ts`](../src/data/projects.ts), [`myResume.md`](myResume.md), and PRD/blueprint docs for internship-facing positioning.

### [2026-10-09] Ambient blueprint grid — 64px cells

- Increased ambient SVG grid and data-lane alignment from 32px to **64px** via `GRID_CELL_PX` in [`BlueprintGridBackground.tsx`](../src/components/common/BlueprintGridBackground.tsx); scaled lane glow `background-size` 112→224 in [`globals.css`](../src/styles/globals.css) for visual parity.

### [2026-10-07] Project cards — blueprint window chrome + enlarged grid split

- Sutera-style window frame on **featured** [`ProjectCard`](../src/components/sections/project-matrix/ProjectCard.tsx) only via [`ProjectWindowChrome.tsx`](../src/components/sections/project-matrix/ProjectWindowChrome.tsx). Grid cards restored to vertical carousel-over-copy with full telemetry strip; featured keeps split layout at `lg+`.

### [2026-10-07] Documentation consolidated under `docs/`

- Moved `PROJECT_BLUEPRINT.md`, `MEMORY.md`, `PRD.md`, `GITHUB_PAGES_SETUP.md`, `myResume.md` → [`docs/`](README.md); added [`docs/README.md`](README.md) index; AI service prose → [`docs/ai-service.md`](ai-service.md) (stub [`ai-service/README.md`](../ai-service/README.md) points here).
- Updated [`vite.config.ts`](../vite.config.ts), [`downloadResume.ts`](../src/lib/downloadResume.ts), [`portfolioDocument.ts`](../src/data/portfolioDocument.ts), and [`.cursor/rules/portfolio-blueprint.mdc`](../.cursor/rules/portfolio-blueprint.mdc) for new paths; build still copies resume to `dist/resume.md`.

### [2026-10-07] Feature-driven modular `src/` reorganization

- **Common:** `BlueprintCard`, `BlueprintGridBackground`, `BlueprintCrosshairCursor`, `TypeText`, `TypingSequence` → `src/components/common/`; shadcn `ui/*` → `src/components/common/ui/`.
- **HUD:** `HeaderHUD` → `src/components/hud/`; extracted `LocalClock.tsx`, `ThemeToggle.tsx`.
- **Sections:** `HeroSection` + `hero-ascii-one` → `src/components/sections/hero/`; `SkillRaster` → `src/components/sections/skill-raster/`; `ProjectMatrix`, `ProjectCard`, `ArchSpecsDisclosure`, `ProjectImageLightbox` → `src/components/sections/project-matrix/`; `FooterConsole` → `src/components/sections/footer/`; `CvAstOverlay` → `src/components/sections/cv/`.
- **AI drawer:** `AIChatDrawer`, `QuickChips`, `TerminalInput` → `src/components/ai-drawer/` (replaces inline panel in `App.tsx`).
- **Services / backend shell:** `src/services/aiClient.ts`; repo root `ai-service/` (`Dockerfile`, `README.md`).
- **Tooling:** `components.json` shadcn `ui` alias → `@/components/common/ui`; all `@/` imports updated; `PROJECT_BLUEPRINT.md` source-layout table + path links.

### [2026-10-07] Mobile HUD, CV toolbar, project carousel

- [`HeaderHUD.tsx`](../src/components/HeaderHUD.tsx): below `lg`, compact SYS_ID row + `[MENU]` sheet (nav, clock, theme, chatbot); desktop bar unchanged. Sheet/backdrop use CSS enter/exit (`hud-menu-*` in `globals.css`); `prefers-reduced-motion` disables them.
- [`CvAstOverlay.tsx`](../src/components/CvAstOverlay.tsx): overlay starts below header (`top-14` / `lg:top-[4.5rem]`); sticky toolbar with `[X]` on row one so controls stay visible on small screens.
- [`ProjectCard.tsx`](../src/components/ProjectCard.tsx): wide slides `aspect-[16/10]` + absolute `object-cover`; mobile artboards drop fixed min-height well on phones.

### [2026-10-07] CV PDF sync & footer download cleanup

- Deployed CV now copies from `assets/AARON AST friendly resume with portfolio.pdf` into `public/cv/aaron-tamayo-resume.pdf` on each Vite build (`vite.config.ts`); replaced stale public PDF.
- Removed footer `[DOWNLOAD_CV]` (markdown export); `[DOWNLOAD_CV_PDF]` remains. Download filename → `Aaron_Tamayo_Portfolio_CV.pdf`.

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

- Hero H1 `LEAD FULL-STACK DEVELOPER`; single founder-partner subtitle; location + GitHub strip; removed telemetry grid and hero chatbot CTA.
- Portrait telemetry overlay highlights Serbisyo pioneer role, live org link, and stack strip; broader stack detail in Domains + Project Matrix.
- Updated `PRD.md`, `PROJECT_BLUEPRINT.md`.

### [2026-10-06] Project Matrix (Phase 3)

- Added [`src/data/projects.ts`](../src/data/projects.ts) for Serbisyo (featured), Shija WMS/POS, RescueLink (capstone), and My Crew Manager (academic).
- NDA-safe copy for industry projects: resume ceiling only; academic projects may use README feature detail in `[ARCH_SPECS]`.
- Built [`ProjectCard`](../src/components/ProjectCard.tsx) (role-first HUD, carousel placeholders, gated specs) and [`ProjectMatrix`](../src/components/ProjectMatrix.tsx).
- Replaced HUD domain filters with section nav ([`navSections.ts`](../src/data/navSections.ts): Overview, Systems, Domains, Console) with smooth scroll and scroll-spy.
- Project carousels use [`public/projects/`](public/projects/) (copied from [`assets/`](assets/)); Serbisyo mobile artboards use `layout: mobile` + `object-contain`. Enterprise Warehouse folder pending assets.
- Installed shadcn `carousel` + `button`; carousel nav restyled to blueprint borders.
- Mounted matrix at `#project-matrix` in [`App.tsx`](../src/App.tsx); updated `PROJECT_BLUEPRINT.md` §4.

### [2026-10-06] HUD crosshair cursor follower

- Added [`BlueprintCrosshairCursor`](../src/components/BlueprintCrosshairCursor.tsx): spring-trailing Lucide `Plus` (`--crosshair`), mouse-always-on-page vs touch-while-pressed, `prefers-reduced-motion` off, mounted in [`App.tsx`](../src/App.tsx).
- Documented in `PROJECT_BLUEPRINT.md` §5.

### [2026-10-06] Crosshair click / tap ping

- CAD registration ping on pointer down/up: expanding square ring + Plus press/release (`crosshair-*` keyframes in [`globals.css`](../src/styles/globals.css)); mouse, touch, and pen.
- Updated `PROJECT_BLUEPRINT.md` §5 item 6.

### [2026-10-06] Footer terminal console

- Implemented [`FooterConsole`](../src/components/FooterConsole.tsx): blueprint card, Windows PowerShell window chrome (`#012456`, title bar, `PS C:\\portfolio\\footer>` prompt), typewriter log (respects `prefers-reduced-motion`), clickable MAIL/TEL/VCS, blinking cursor on idle prompt.
- Added [`profile.ts`](../src/data/profile.ts) and [`downloadResume.ts`](../src/lib/downloadResume.ts) — `[DOWNLOAD_CV]` blob-downloads canonical [myResume.md](myResume.md).
- Replaced footer placeholder in [`App.tsx`](../src/App.tsx); updated `PROJECT_BLUEPRINT.md` §4 item 6.
- HUD nav `[CONSOLE]` → `[CONTACT]` (`#contact`); removed duplicate section heading above PowerShell card.
- Contact block: `BlueprintCard frameless` — no card border/bg; enlarged PowerShell body; crosshairs retained.

### [2026-10-06] Hidden CV AST overlay

- HUD profile photo (`HeaderHUD`) toggles full-page `[CV_AST_VIEWER]` (`CvAstOverlay`, `z-30` under header); not listed in `navSections.ts`.
- Structured resume in [`src/data/cv.ts`](../src/data/cv.ts) (1:1 [myResume.md](myResume.md) + portrait); expandable AST tree with Esc / `[X]` / photo close; CV vs chatbot mutual exclusion in [`App.tsx`](../src/App.tsx).
- Documented in `PROJECT_BLUEPRINT.md` §4 item 1.

### [2026-10-06] CV UX — hero trigger, zoom, PDF, animations

- CV entry moved to hero portrait (`.cv-photo-trigger`); removed HUD thumbnail trigger.
- `CvAstOverlay`: header portrait + name; AST identity = location/contact; zoom toolbar; CSS expand/collapse on tree nodes.
- [`public/cv/aaron-tamayo-resume.pdf`](public/cv/aaron-tamayo-resume.pdf) + [`downloadResumePdf.ts`](../src/lib/downloadResumePdf.ts); `[DOWNLOAD_CV_PDF]` in overlay and footer (markdown `[DOWNLOAD_CV]` retained).

### [2026-10-07] AI / crawler-readable portfolio metadata

- [`src/data/portfolioDocument.ts`](../src/data/portfolioDocument.ts) derives meta description, Schema.org JSON-LD (`Person`, `ProfilePage`, `ItemList`), static HTML crawler outline, and [`llms.txt`](public/llms.txt) from existing `profile`, `projects`, and `cv` data.
- Vite plugin in [`vite.config.ts`](../vite.config.ts) injects head tags + outline into `index.html` at build/dev, writes `public/llms.txt`, copies `myResume.md` → `dist/resume.md` on production build.
- [`public/robots.txt`](public/robots.txt) and [`public/sitemap.xml`](public/sitemap.xml) list home, `llms.txt`, resume, and CV PDF for indexers.

### [2026-10-07] Skill Raster (replaces Domains Grid placeholder)

- Removed `#domains` placeholder `BlueprintCard` from [`App.tsx`](../src/App.tsx); added [`SkillRaster.tsx`](../src/components/SkillRaster.tsx) at `#skills` with resume-driven groups via [`skillGroups.ts`](../src/lib/skillGroups.ts).
- Added blueprint-styled [`coverflow-carousel.tsx`](../src/components/ui/coverflow-carousel.tsx) (HUD plates, skill chips caption, reduced-motion flatten).
- HUD nav `[DOMAINS]` → `[SKILLS]` in [`navSections.ts`](../src/data/navSections.ts); updated `PROJECT_BLUEPRINT.md`, `PRD.md`, and `llms.txt` skill copy.

### [2026-10-07] Skill Raster caption panel

- Lifted caption into [`SkillRaster.tsx`](../src/components/SkillRaster.tsx) (`SkillCaptionPanel`): surface + border panel, fast typewriter title and sequential skill chips via [`useTypewriter.ts`](../src/hooks/useTypewriter.ts); carousel `showCaption={false}`.
- Simplified section helper line; removed per-slide entry-count subtitle.

### [2026-10-07] Systems sequential scroll typing

- [`TypingSequence`](../src/components/TypingSequence.tsx) / [`TypingLine`](../src/components/TypingSequence.tsx): one block at a time, per-line [`useLineInView`](../src/hooks/useLineInView.ts), retrigger on card/section leave via [`useInViewRetype`](../src/hooks/useInViewOnce.ts).
- [`ProjectMatrix`](../src/components/ProjectMatrix.tsx) header and [`ProjectCard`](../src/components/ProjectCard.tsx) body use the queue; carousel captions use [`IndependentTypingLine`](../src/components/TypingSequence.tsx). `[ARCH_SPECS]` stays static.

### [2026-10-07] Dark mode blueprint outlines (beige)

- Dark `[data-theme='dark']` `--border-cyan` and `--crosshair` now use warm sand `rgba(240, 236, 225, …)` instead of cyan so CAD borders/grid strokes match light-mode canvas beige; accent cyan unchanged for HUD labels and links.
