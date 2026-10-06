Here is the complete, uncut `PRD.md` file formatted in Markdown ready to save into your workspace:

```markdown
# PRODUCT REQUIREMENT DOCUMENT (PRD)

**Project Name:** Full-Stack Developer Blueprint Portfolio  
**Target Role:** Full-Stack Software Engineer (Web, Mobile, Cloud)  
**Design Reference:** CAD / HUD Blueprint (Inverted Light/Dark Modes — inspired by `sutera.ch`)  
**Core Stack:** React + Vite + TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, Node.js/Express, Google Cloud Run, Flutter  
**Package Manager:** `pnpm`  
**Public URL:** https://gostylo.github.io/

---

## 1. System Goals & Overview

The primary objective of this portfolio is to showcase end-to-end full-stack capabilities across three core engineering pillars: **Web Engineering**, **Mobile App Development**, and **Cloud Infrastructure & Backend Systems**.

The visual language follows an architectural CAD/HUD blueprint design system with semi-transparent borders, corner alignment crosshairs, technical metadata tags, and an inverted color scheme between Light and Dark modes. It features a right slide-over AI chatbot drawer allowing recruiters and clients to query project architectures, stack details, and system specs interactively.

---

## 2. Core Layout & Page Structure


```

[ STICKY HUD HEADER ] - System ID, Status Indicator, Domain Filters, Theme Inverter, Chatbot Launcher
──────────────────────────────────────────────────────────────────────────────────────────────────
[ HERO SECTION ]     - Full-Stack Headline, System Telemetry Strip (React / Flutter / Node / GCP)
──────────────────────────────────────────────────────────────────────────────────────────────────
[ DOMAINS MATRIX ]   - 4-Column Technical Grid:
01. Web Engineering | 02. Mobile Dev | 03. Backend & APIs | 04. Cloud & DevOps
──────────────────────────────────────────────────────────────────────────────────────────────────
[ PROJECT MATRIX ]   - Deployed Systems Grid:
• Serbisyo (Web/Mobile/GCP)     • RescueLink AI (Cloud Run/Vercel)
• WaterMarks POS (Offline Web)  • My-Crew-Manager (MERN Stack)
──────────────────────────────────────────────────────────────────────────────────────────────────
[ ACADEMIC & TOOLING]- PIAC Approved Exemptions (ITE 367, ITE 381) & Dev Workflow Stack
──────────────────────────────────────────────────────────────────────────────────────────────────
[ RIGHT AI DRAWER ]  - Slide-over AI Chatbot Drawer (Framer Motion right-edge slide)
──────────────────────────────────────────────────────────────────────────────────────────────────
[ FOOTER CONSOLE ]   - Monospace Live Terminal Log & Quick Action CTA Buttons

```

---

## 3. Detailed Section Breakdown

### Section 01: Sticky HUD Header & Navigation Bar
* **System Identity:** Monospace tag `[SYS_ID: TAMAYO_AARON_FULLSTACK]`.
* **Status Badge:** Pulsing green emerald indicator showing `SYS_STATUS: ONLINE / AVAILABLE_FOR_PROJECTS`.
* **Domain Filtering Navigation:** Quick filter pills:
  * `[01. ALL_SYSTEMS]`
  * `[02. WEB_ENG]`
  * `[03. MOBILE_APP]`
  * `[04. CLOUD_BACKEND]`
* **Controls (Right):**
  * Live local time readout (`PST / UTC+8`).
  * Theme Inversion button: `[THEME: DARK/LIGHT]`.
  * Chatbot launcher: High-contrast button `[LAUNCH CHATBOT]` with a `<Bot/>` icon.

---

### Section 02: Hero Section ("System Architecture Overview")
* **Headline:** `LEAD FULL-STACK ENGINEER`
* **Name (secondary):** Aaron Christian B. Tamayo (monospace, muted)
* **Subtitle (one sentence, no tech list):** Founder-partner value line—planning through staging and production across web, mobile, and backend (see `myResume.md` experience; stack detail lives in Domains + Project Matrix).
* **Contact strip:** Dagupan City, Pangasinan · github.com/goSTYLO
* **Portrait ASCII overlay:** Subject/coords/node only (no stack diagram on photo).
* **CTA:** `[EXPLORE_SYSTEMS]` only (chatbot via header / future floating widget).

---

### Section 03: Core Engineering Domains Matrix (4-Column Grid)

Each domain card features CAD corner crosshairs (`<Plus/>`), semi-transparent 1px blueprint borders, and parameter metrics:

1. **`01. WEB_ENGINEERING`**
   * *Technologies:* React, Vite, Tailwind CSS, Redux/Zustand, PostHog Analytics.
   * *Metrics:* `BUNDLE_SIZE: MINIFIED`, `FPS: 60`, `RESPONSIVE: TRUE`.
2. **`02. MOBILE_DEVELOPMENT`**
   * *Technologies:* Flutter, Dart, Cross-Platform Architecture, Play Store / App Store Deployments.
   * *Metrics:* `PLATFORMS: IOS + ANDROID`, `OFFLINE_FIRST: ENABLED`.
3. **`03. BACKEND_&_APIS`**
   * *Technologies:* Node.js, Express, RESTful APIs, WebSockets, PayMongo Disbursements/Payments.
   * *Metrics:* `AUTH: JWT/OAUTH`, `LATENCY < 45ms`, `UPTIME 99.9%`.
4. **`04. CLOUD_&_DEVOPS`**
   * *Technologies:* Google Cloud Run, Docker, Vercel, CI/CD, PostgreSQL, MongoDB, pnpm.
   * *Metrics:* `CONTAINERIZED: TRUE`, `SERVERLESS: AUTO_SCALE`.

---

### Section 04: Project Matrix / Deployed Systems Showcase

Showcases real-world full-stack applications with architectural details:

* **01. Serbisyo (`[WEB]`, `[MOBILE]`, `[CLOUD]`)**
  * *Description:* Home services booking platform connecting customers with verified providers. Integrates PayMongo payment processing and user management.
  * *Stack:* Flutter, Node.js, PayMongo, Google Cloud Run, Play Store Public Release.
  * *Live domain:* [serbisyoprovider.com](https://serbisyoprovider.com)
  * *Links/CTAs:* `[LIVE_SITE]`, `[PLAY_STORE_LINK]`, `[ARCH_SPECS]`.
* **02. RescueLink AI (`[WEB]`, `[CLOUD]`, `[AI]`)**
  * *Description:* AI-powered emergency & rescue dispatch platform.
  * *Stack:* React, Vite, Python AI service hosted on Google Cloud Run, Vercel frontend.
  * *Links/CTAs:* `[LIVE_DEMO]`, `[GITHUB_REPO]`.
* **03. WaterMarks POS (`[WEB]`, `[OFFLINE]`)**
  * *Description:* POS & Inventory Management System for water refilling stations.
  * *Stack:* React, Vite, Local IndexedDB/SQLite sync for full offline capability.
  * *Links/CTAs:* `[SYSTEM_SPECS]`.
* **04. My-Crew-Manager (`[WEB]`, `[BACKEND]`)**
  * *Description:* Workforce management tool for scheduling, role assignments, and team tracking.
  * *Stack:* Node.js, Express, React, MongoDB (MERN Stack monorepo).
  * *Links/CTAs:* `[CASE_STUDY]`, `[REPO_LINK]`.

---

### Section 05: Academic Credentials & Tooling Workflow
* **Academic Subject Exemptions:**
  * Official exemption approval by the PIAC Committee for courses **ITE 367** and **ITE 381**.
* **Developer Workflow & Tooling:**
  * *IDE & Agent Workflow:* Cursor IDE with Composer Agent.
  * *Package Manager:* `pnpm` workspace setup.
  * *Integrations:* PostHog user analytics and PayMongo payment disbursement pipelines.

---

### Section 06: Right Slide-Over AI Chatbot Drawer (`[AI_CHATBOT_INTERFACE]`)

* **Phase 1:** Header `[LAUNCH CHATBOT]` opens a closed placeholder panel labeled `[AI_CHATBOT_INTERFACE]`. No chat runtime until Phase 4.
* **Trigger:** Click header `[LAUNCH CHATBOT]` or floating bottom-right button `[SYS_CHATBOT: ONLINE]`.
* **Behavior:** Panel slides in smoothly from the **right edge** over the viewport via Framer Motion (`x: '100%'` to `x: 0`).
* **Drawer Structure:**
  * *Header:* `[AI_CHATBOT_INTERFACE v1.0]`, socket status `[SOCKET: CONNECTED]`, and close icon `[X]`.
  * *Chat Window:* Monospace conversation thread with blueprint borders. User messages in slate, AI output formatted as terminal logs (`> SYSTEM_RESPONSE:`).
  * *Quick Suggestion Chips:* `[Ask about Serbisyo]`, `[View Cloud Architecture]`, `[Get Contact Info]`, `[Download CV]`.
  * *Input Bar:* Monospace input prompt (`$ ask a question...`) with execution button `[EXECUTE]`.

---

### Section 07: Footer Terminal & System Diagnostics Console
* **Status Console Output:** `$ status --check` returning `BUILD: VITE_SUCCESS`, `ENVIRONMENT: PRODUCTION`, `REGION: ASIA_EAST`.
* **Blueprint Actions:** `[SEND_DIRECT_MESSAGE]`, `[DOWNLOAD_RESUME_PDF]`, `[LINKEDIN_PROFILE]`, `[GITHUB_REPOS]`.

---

## 4. Required Assets & Documentation Checklist

Before launching, compile and place these media and document assets into the repository:

### Documentation
* [ ] `Aaron_Tamayo_FullStack_Engineer_CV.pdf` (Clean monospace-accented PDF resume).
* [ ] PIAC Committee Exemption Approval Documentation for ITE 367 and ITE 381.
* [ ] System Architecture Diagrams (SVG format) for Serbisyo and RescueLink AI.

### Media & Visuals
* [ ] Serbisyo App Screenshots (Google Play Store mockups and mobile UI previews).
* [ ] RescueLink AI Dashboard UI screenshots + Google Cloud Run deployment console logs.
* [ ] WaterMarks POS UI screenshots (Register & Inventory tables).
* [ ] My-Crew-Manager UI screenshots (Scheduling timeline & workforce dashboard).
* [ ] Custom SVG Favicon (CAD Crosshair motif).

---

## 5. Repository Structure Blueprint


```

portfolio-root/
├── .github/workflows/pages.yml  # pnpm build + GitHub Pages deploy
├── public/
│   ├── .nojekyll
│   └── aaron-profile.jpg        # Hero inline portrait
├── components.json              # shadcn
├── PROJECT_BLUEPRINT.md
├── PRD.md
├── MEMORY.md
├── myResume.md                  # Canonical personal details
├── index.html
├── package.json                 # packageManager: pnpm
├── pnpm-lock.yaml
├── vite.config.ts               # base: '/', @ alias
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── components/
    │   ├── ui/
    │   │   └── hero-ascii-one.tsx
    │   ├── BlueprintCard.tsx
    │   ├── HeaderHUD.tsx
    │   ├── HeroSection.tsx
    │   ├── AIChatDrawer.tsx     # Phase 4 — placeholder only
    │   ├── DomainsGrid.tsx
    │   ├── ProjectMatrix.tsx
    │   └── FooterConsole.tsx
    ├── context/
    │   └── ThemeContext.tsx
    ├── lib/
    │   └── utils.ts
    ├── styles/
    │   └── globals.css
    ├── App.tsx
    └── main.tsx

```

---

## 6. Implementation Milestones

1. **Phase 1: Foundation & Design System Setup**
   * Configure Tailwind CSS with custom CSS variables for inverted light/dark mode design tokens.
   * Set up `PROJECT_BLUEPRINT.md`, `MEMORY.md`, and `.cursorrules` in project root.
   * Build reusable `BlueprintCard` component with CAD alignment crosshairs (`<Plus/>`) and border styling.

2. **Phase 2: Core Layout & Domain Matrix**
   * Implement sticky HUD header with system status and theme toggle state.
   * Construct Hero section with monospace system telemetry data strip.
   * Build 4-column Technical Domains grid (Web, Mobile, Backend, Cloud).

3. **Phase 3: Project Matrix Showcase**
   * Build filterable project grid featuring Serbisyo, RescueLink AI, WaterMarks POS, and My-Crew-Manager.
   * Add deployment badges and system specification drawers for each project.

4. **Phase 4: AI Chatbot Drawer & Terminal Console**
   * Build right slide-over AI chatbot drawer (`AIChatDrawer.jsx`) using Framer Motion animations.
   * Connect terminal input prompt with quick suggestion chips and streaming response state.
   * Implement bottom system console footer.

---

## 7. GitHub Pages Deployment

This repo is the user site **https://gostylo.github.io/**. It is a static Vite SPA.

* `vite.config.ts` `base: '/'` (served from the domain root).
* CI uses **pnpm** (`pnpm install --frozen-lockfile` then `pnpm build`).
* `.github/workflows/pages.yml` uploads `dist/` with `actions/upload-pages-artifact` and deploys with `actions/deploy-pages`.
* `dist/` is gitignored. `pnpm-lock.yaml` is committed.
* GitHub → Settings → Pages → Source: **GitHub Actions**.
