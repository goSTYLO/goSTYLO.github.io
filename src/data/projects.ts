export type DomainTag = 'WEB' | 'MOBILE' | 'CLOUD';
export type ProjectContext = 'INDUSTRY_NDA' | 'CAPSTONE' | 'ACADEMIC';
export type ProjectStatus = 'ONLINE' | 'ACTIVE' | 'COMPLETE';

export type ProjectLink = {
  label: string;
  href: string | null;
};

export type ProjectImageLayout = 'wide' | 'mobile';

export type ProjectImage = {
  src: string;
  alt: string;
  caption: string;
  layout?: ProjectImageLayout;
};

export type Project = {
  id: string;
  featured?: boolean;
  sysRef?: string;
  title: string;
  status: ProjectStatus;
  nda: boolean;
  context: ProjectContext;
  domains: DomainTag[];
  roleTag: string;
  roleTitle: string;
  roleSummary: string;
  summary: string;
  stack: string[];
  features: string[];
  hosting: string[];
  links: ProjectLink[];
  images: ProjectImage[];
};

const placeholderSlides = (redacted: boolean): ProjectImage[] =>
  [1, 2, 3].map((n) => ({
    src: '',
    alt: redacted ? 'Redacted system capture' : `System capture ${n}`,
    caption: redacted
      ? `[SHOT_0${n}] Redacted preview`
      : `[SHOT_0${n}] Preview pending`,
  }));

export const projects: Project[] = [
  {
    id: 'serbisyo',
    featured: true,
    sysRef: 'SERBISYO',
    title: 'Serbisyo',
    status: 'ONLINE',
    nda: true,
    context: 'INDUSTRY_NDA',
    domains: ['WEB', 'MOBILE', 'CLOUD'],
    roleTag: 'PIONEER_LEAD_FULL_STACK',
    roleTitle: 'Lead Full-Stack Developer',
    roleSummary: 'Lead development on the live web and mobile marketplace.',
    summary:
      'Home-services platform connecting customers with verified providers — public site and mobile apps in production.',
    stack: [],
    features: [
      'Launched official website and mobile apps on Google Play and App Store.',
      'Implemented real-time GPS tracking with location privacy controls for active service providers.',
      'Hardened backend security using role-based access control (RBAC), JWT tokens, and input sanitization.',
      'Set up automated end-to-end testing suites using Playwright and Vitest for CI/CD releases.',
    ],
    hosting: [],
    links: [
      { label: 'LIVE_SITE', href: 'https://serbisyoprovider.com' },
      {
        label: 'PLAY_STORE',
        href: 'https://play.google.com/store/apps/details?id=com.serbisyo.serbisyo&pcampaignid=web_share',
      },
      {
        label: 'APP_STORE',
        href: 'https://apps.apple.com/ph/app/serbisyo/id6811959278',
      },
    ],
    images: [
      {
        src: '/projects/serbisyo/hero.png',
        alt: 'Serbisyo marketing hero',
        caption: '[SHOT_01] Public marketing site',
        layout: 'wide',
      },
      {
        src: '/projects/serbisyo/mobile-01.jpg',
        alt: 'Serbisyo mobile app screen 1',
        caption: '[SHOT_02] Mobile app screen',
        layout: 'mobile',
      },
      {
        src: '/projects/serbisyo/mobile-02.jpg',
        alt: 'Serbisyo mobile app screen 2',
        caption: '[SHOT_03] Mobile app screen',
        layout: 'mobile',
      },
      {
        src: '/projects/serbisyo/mobile-03.jpg',
        alt: 'Serbisyo mobile app screen 3',
        caption: '[SHOT_04] Mobile app screen',
        layout: 'mobile',
      },
    ],
  },
  {
    id: 'shija-wms-pos',
    title: 'Enterprise Warehouse Inventory & POS (Shija)',
    status: 'ONLINE',
    nda: true,
    context: 'INDUSTRY_NDA',
    domains: ['WEB', 'CLOUD'],
    roleTag: 'LEAD_FULL_STACK',
    roleTitle: 'Lead Full-Stack Developer',
    roleSummary:
      'Point-of-sale, inventory dashboards, and warehouse tools for multi-location operations.',
    summary:
      'Enterprise point-of-sale and warehouse inventory system for daily sales and stock monitoring.',
    stack: [],
    features: [
      'Built point-of-sale interfaces and real-time inventory monitoring dashboards for daily sales.',
      'Built warehouse management features for stock and daily operations.',
      'Containerized multi-location services using Docker Compose for standardized deployment.',
    ],
    hosting: [],
    links: [],
    images: placeholderSlides(true),
  },
  {
    id: 'rescue-link',
    sysRef: 'RESCUELINK',
    title: 'RescueLink',
    status: 'ONLINE',
    nda: false,
    context: 'CAPSTONE',
    domains: ['WEB', 'MOBILE', 'CLOUD'],
    roleTag: 'LEAD_FULL_STACK_AI',
    roleTitle: 'Lead Developer / Full-Stack & AI Developer',
    roleSummary: 'Emergency dispatch across web, mobile, APIs, and AI services.',
    summary:
      'PHINMA capstone — emergency response and incident management for Dagupan City. Live dashboard on Vercel.',
    stack: [
      'React',
      'Flutter',
      'Node.js',
      'FastAPI',
      'Docker',
      'Vercel',
      'Render',
      'GCP Cloud Run',
      'Supabase',
    ],
    features: [
      'Citizen mobile reporting with phone auth, audio and media uploads, and location-aware incidents.',
      'Dispatcher web dashboard for triage, dispatch, responder assignment, and audit logs.',
      'Whisper-based speech-to-text and incident classification on Google Cloud Run.',
      'Optional blockchain verification module with audit-trail fallback when disabled.',
    ],
    hosting: ['Vercel', 'Render', 'GCP Cloud Run', 'Supabase PostgreSQL'],
    links: [
      { label: 'LIVE_SITE', href: 'https://rescue-link-front.vercel.app' },
      { label: 'GITHUB_REPO', href: null },
    ],
    images: [
      {
        src: '/projects/rescue-link/01.png',
        alt: 'RescueLink system capture 1',
        caption: '[SHOT_01] Dispatch dashboard',
        layout: 'wide',
      },
      {
        src: '/projects/rescue-link/02.png',
        alt: 'RescueLink system capture 2',
        caption: '[SHOT_02] Incident flow',
        layout: 'wide',
      },
      {
        src: '/projects/rescue-link/03.png',
        alt: 'RescueLink system capture 3',
        caption: '[SHOT_03] Mobile reporting',
        layout: 'mobile',
      },
      {
        src: '/projects/rescue-link/04.png',
        alt: 'RescueLink system capture 4',
        caption: '[SHOT_04] Operations dashboard',
        layout: 'wide',
      },
      {
        src: '/projects/rescue-link/05.png',
        alt: 'RescueLink system capture 5',
        caption: '[SHOT_05] System overview',
        layout: 'wide',
      },
    ],
  },
  {
    id: 'my-crew-manager',
    sysRef: 'MY_CREW_MANAGER',
    title: 'My Crew Manager',
    status: 'COMPLETE',
    nda: false,
    context: 'ACADEMIC',
    domains: ['WEB', 'MOBILE', 'CLOUD'],
    roleTag: 'PM_LEAD_DEV_AI',
    roleTitle: 'Project Manager / Lead Developer / AI Developer',
    roleSummary:
      'Led full-stack development of a project management platform across web and mobile.',
    summary: 'School project — project management with real-time collaboration and team workflows.',
    stack: ['Node.js', 'Express', 'React', 'Flutter', 'Python', 'PyTorch', 'Redis', 'Docker'],
    features: [
      'AI proposal analysis with automatic epics, user stories, tasks, and sprint planning.',
      'Real-time collaboration via WebSockets and adaptive smart polling on the web client.',
      'Project invitations, role-based access, and team member lifecycle management.',
      'Singleton LLM model caching to reduce model load times by up to 75%.',
    ],
    hosting: ['Docker Compose'],
    links: [{ label: 'REPO_LINK', href: null }],
    images: [
      {
        src: '/projects/my-crew-manager/hero.png',
        alt: 'My Crew Manager platform hero',
        caption: '[SHOT_01] Platform home',
        layout: 'wide',
      },
    ],
  },
];
