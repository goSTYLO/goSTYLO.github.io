# PROJECT BLUEPRINT & DESIGN SYSTEM SPECIFICATION

Primary Live Inspiration: https://www.sutera.ch/ ("Cyber / Lab Reality" Modes)  
Target Focus: Full-Stack Developer Portfolio (Web, Mobile, Cloud)  
Tech Stack: React (Vite ecosystem), Tailwind CSS, Framer Motion, Lucide React (`lucide-react`)

## 1. Operating Directives

- **Directive 01:** Every UI component, layout, or style generated MUST strictly follow the design tokens and structural patterns in this document, using https://www.sutera.ch/ as the visual standard for CAD/HUD grid alignment.
- **Directive 02:** Any change to theme parameters, stack configurations, or architectural structure MUST be updated here and logged in `MEMORY.md`.
- **Directive 03:** All structural cards and section containers MUST feature CAD alignment crosshairs (`<Plus />` icons at corner intersections) and semi-transparent 1px blueprint borders.

## 2. Inverted Theme Color Tokens (Globals / Tailwind)

### LIGHT MODE (Warm Architectural Sand Canvas + Deep Navy Text)

| Token | Value |
|-------|--------|
| Canvas | `#F0ECE1` |
| Card Surface | `#E6DFD5` |
| Primary Text | `#061224` |
| Muted Text | `#3B4E68` |
| Blueprint Border | `rgba(0, 131, 148, 0.25)` |
| Accent Cyan | `#008394` |
| Crosshair Mark | `rgba(0, 131, 148, 0.4)` |

### DARK MODE (Deep Slate Navy Canvas + Light Warm Beige Text)

| Token | Value |
|-------|--------|
| Canvas | `#061224` |
| Card Surface | `#091A32` |
| Primary Text | `#F0ECE1` |
| Muted Text | `#94A3B8` |
| Blueprint Border | `rgba(0, 229, 255, 0.2)` |
| Accent Cyan | `#00E5FF` |
| Crosshair Mark | `rgba(0, 229, 255, 0.4)` |

## 3. Typography Rules

- **Monospace (`font-mono`):** JetBrains Mono or Fira Code for metadata, API tags, latencies, timestamps, button labels, and parameters.
- **Display Sans-Serif (`font-sans`):** Space Grotesk or Inter for main section headlines, project titles, and bio descriptions.

## 4. Page Layout Architecture

1. **Sticky HUD Header:** System logo `[SYS_ID: FULLSTACK_DEV]`, live status indicator (`SYS_STATUS: ONLINE`), domain filters (`[ALL]`, `[WEB]`, `[MOBILE]`, `[CLOUD]`), Theme Toggle, and `[LAUNCH AI_ASSISTANT]` trigger button.

2. **Hero Section ("System Architecture Overview"):** Headline `FULL-STACK SYSTEM ARCHITECT`, subtitle, and monospace system stats strip (`REACT / FLUTTER / NODE / GCP`).

3. **Core Technical Domains (4-Column Grid):**
   - `01. WEB_ENGINEERING` — React, Vite, Tailwind, State Management
   - `02. MOBILE_DEVELOPMENT` — Flutter, Cross-Platform Architecture, Offline-First Storage
   - `03. BACKEND_&_APIS` — Node.js, Express, REST/GraphQL, WebSockets
   - `04. CLOUD_&_DEVOPS` — Google Cloud Run, Docker, CI/CD, PostgreSQL/MongoDB

   Each card includes parameters (e.g., `LATENCY < 50ms`, `UPTIME 99.9%`, `CONTAINERIZED: TRUE`).

4. **Project Matrix:** Expandable project cards with domain tags (`[WEB]`, `[MOBILE]`, `[CLOUD]`), deployment targets, and live/store links.

5. **Right Slide-Over AI Chatbot Panel (`[AI_COPILOT_INTERFACE]`):**
   - Triggered via header button or bottom-right floating widget (`[SYS_AI: ONLINE]`).
   - Slides from the right edge over the viewport using Framer Motion (`x: '100%'` to `x: 0`).
   - Features socket status header, terminal-style message logs (`> SYSTEM_RESPONSE:`), monospace prompt suggestion chips, and terminal input prompt (`$ ask a question...`).

6. **Footer Console:** Monospace terminal execution log and action buttons (`[SEND_MESSAGE]`, `[DOWNLOAD_CV]`, `[VIEW_GITHUB]`).
