/** Canonical CV structure — copy from docs/myResume.md only; portrait is UI-only. */

export type CvContactLink = {
  literal: string;
  href: string;
};

export type CvExperience = {
  company: string;
  location: string;
  role: string;
  dates: string;
  bullets: readonly string[];
};

export type CvProject = {
  name: string;
  role?: string;
  stack: string;
  dates: string;
  bullets: readonly string[];
};

export type CvCertification = {
  title: string;
  body: string;
};

export const cvDocument = {
  identity: {
    name: 'Aaron Christian B. Tamayo',
    location: 'Dagupan City, Pangasinan, Philippines',
    contact: [
      { literal: '+63 966 663 8967', href: 'tel:+639666638967' },
      {
        literal: 'tamayo.aaron.benavides.ien@gmail.com',
        href: 'mailto:tamayo.aaron.benavides.ien@gmail.com',
      },
      { literal: 'github.com/goSTYLO', href: 'https://github.com/goSTYLO' },
    ] as const satisfies readonly CvContactLink[],
    portrait: '/aaron-profile.jpg',
  },
  experience: [
    {
      company: 'Serbisyo & Shija Corporation',
      location: 'Dagupan City, Pangasinan',
      role: 'Lead Full-Stack Engineer (Freelance / Contract)',
      dates: 'Jan. 2026 – Present',
      bullets: [
        'Lead full-stack software development across web, mobile, and backend microservices to support expanding enterprise and consumer operations.',
        'Manage end-to-end application life cycles, collaborating with founders and team members from feature planning to staging and production deployments.',
        'Oversee database management to maintain service reliability and high system availability.',
        'Standardize development workflows and security practices across projects, incorporating rigorous code reviews, automated testing, and authentication standards.',
      ],
    },
  ] as const satisfies readonly CvExperience[],
  projects: [
    {
      name: 'Serbisyo',
      stack: 'Flutter, React, Node.js, MongoDB Atlas, AWS, Docker, PayMongo',
      dates: 'March 2026 – Present',
      bullets: [
        'Launched official website at serbisyoprovider.com and mobile apps on Google Play and App Store.',
        'Implemented real-time GPS tracking with location privacy controls for active service providers.',
        'Hardened backend security using role-based access control (RBAC), JWT tokens, and input sanitization.',
        'Set up automated end-to-end testing suites using Playwright and Vitest for CI/CD releases.',
      ],
    },
    {
      name: 'MyCrewManager',
      role: 'Project Manager / Lead Developer / AI Engineer',
      stack: 'Node.js, Express, React, Flutter, Python, PyTorch, Redis, Docker',
      dates: 'Aug. 2025 – Oct. 2025',
      bullets: [
        'Led full-stack development of an AI project management platform across web and mobile.',
        'Migrated core REST APIs to Node.js/Express for real-time messaging and backlog tracking.',
        'Embedded LLM workflows with singleton model caching, reducing model load times by up to 75%.',
        'Architected WebSocket and smart polling integrations in React for live collaboration.',
      ],
    },
    {
      name: 'RescueLink',
      role: 'Lead Developer / Full-Stack & AI Engineer',
      stack: 'React, Node.js, FastAPI, Docker, Vercel, Render, GCP Cloud Run, Supabase',
      dates: 'Aug. 2026 – Present',
      bullets: [
        'Architected a multi-platform emergency dispatching system across web, mobile, and REST APIs.',
        'Containerized a FastAPI AI service on Google Cloud Run for Whisper speech-to-text workflows.',
        'Deployed React (Vite) dashboard to Vercel and Node.js backend to Render with Supabase PostgreSQL.',
      ],
    },
    {
      name: 'Enterprise Warehouse Inventory & POS (Shija)',
      stack: 'React, Ant Design, Express, Docker',
      dates: 'Feb. 2026 – Present',
      bullets: [
        'Built point-of-sale interfaces, real-time inventory monitoring dashboards for daily sales, and Warehouse management.',
        'Containerized multi-location services using Docker Compose for standardized deployment.',
      ],
    },
  ] as const satisfies readonly CvProject[],
  technicalSkills: {
    languages: 'JavaScript (ES6+), TypeScript, Python, Dart, HTML/CSS, SQL',
    frameworksWeb:
      'React.js, Vite, Node.js, Express.js, FastAPI, Flutter SDK, Ant Design, Tailwind CSS',
    databasesMiddleware:
      'MongoDB Atlas, PostgreSQL, Supabase, Mongoose ODM, Redis, Socket.IO, NGINX',
    devops:
      'Google Cloud Run, Vercel, Render, AWS (EC2, S3), Docker, Docker Compose, GitHub Actions',
    securityTools:
      'PayMongo API, OneSignal, Speakeasy 2FA, Playwright, Vitest, Git, pnpm, Cursor AI',
  },
  education: {
    school: 'PHINMA University of Pangasinan',
    location: 'Dagupan City, Pangasinan',
    degree: 'Bachelor of Science in Information Technology – System Development',
    expected: 'Expected 2027',
    academicExemptions:
      'Granted official academic exemptions for Managing IT Resources and IT Business Solutions in recognition of demonstrated production-level software engineering and industry work.',
    certifications: [
      {
        title: 'AWS Fundamentals Certificate of Completion — Zuitt Learning Institute Incorporated',
        body: 'Completed 27 hours of instruction covering Amazon EC2, DynamoDB, S3, AWS Lambda, API Gateway, and serverless deployment on AWS (Issued May 2026).',
      },
    ] as const satisfies readonly CvCertification[],
  },
} as const;
