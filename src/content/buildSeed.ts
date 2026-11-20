import { cvDocument, type CvExperience, type CvProject } from '../data/cv';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import type {
  CertificationEntry,
  EducationEntry,
  PortfolioContent,
  PortfolioProject,
  SectionId,
} from './types';
import { SECTION_ORDER } from './types';

const DEFAULT_LABELS: Record<SectionId, string> = {
  hero: 'OVERVIEW',
  'project-matrix': 'SYSTEMS',
  skills: 'SKILLS',
  education: 'EDUCATION',
  certifications: 'CERTIFICATIONS',
  contact: 'CONTACT',
  cv: 'CV',
};

const SUBTITLE =
  'Partnering with founders and technical teams to build products from initial planning through development to live production. Web, mobile, and backend developed under one lead.';

function cloneExperience(): CvExperience[] {
  return cvDocument.experience.map((job) => ({
    company: job.company,
    location: job.location,
    role: job.role,
    dates: job.dates,
    bullets: [...job.bullets],
  }));
}

function cloneCvProjects(): CvProject[] {
  return cvDocument.projects.map((project) => ({
    name: project.name,
    role: 'role' in project ? project.role : undefined,
    stack: project.stack,
    dates: project.dates,
    bullets: [...project.bullets],
  }));
}

export function deriveEducationLine(entries: EducationEntry[]): string {
  const first = [...entries].sort((a, b) => a.order - b.order)[0];
  if (!first) return '';
  return [first.school, first.credential, first.dates].filter(Boolean).join(' · ');
}

export function buildSeed(): PortfolioContent {
  const education: EducationEntry[] = [
    {
      id: 'phinma',
      school: cvDocument.education.school,
      location: cvDocument.education.location,
      credential: cvDocument.education.degree,
      dates: cvDocument.education.expected,
      details: cvDocument.education.academicExemptions,
      order: 0,
    },
  ];

  const certifications: CertificationEntry[] = cvDocument.education.certifications.map(
    (cert, index) => ({
      id: `cert-${index}`,
      title: 'AWS Fundamentals Certificate of Completion',
      issuer: 'Zuitt Learning Institute Incorporated',
      issued: 'May 2026',
      summary: cert.body,
      order: index,
    }),
  );

  const portfolioProjects: PortfolioProject[] = projects.map((project, order) => ({
    ...project,
    stack: [...project.stack],
    features: [...project.features],
    hosting: [...project.hosting],
    domains: [...project.domains],
    links: project.links.map((link) => ({ ...link })),
    images: project.images.map((image) => ({ ...image })),
    order,
  }));

  const sections = SECTION_ORDER.reduce(
    (acc, id) => {
      acc[id] = { enabled: true, navLabel: DEFAULT_LABELS[id] };
      return acc;
    },
    {} as PortfolioContent['sections'],
  );

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    profile: {
      name: profile.name,
      roleTitle: 'LEAD FULL-STACK DEVELOPER',
      subtitle: SUBTITLE,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
      phoneTel: profile.phoneTel,
      githubUrl: profile.githubUrl,
      githubLabel: profile.githubLabel,
      portraitUrl: cvDocument.identity.portrait,
      copyrightLine: `© ${new Date().getFullYear()} ${profile.name} · All rights reserved.`,
      mailtoSubject: profile.mailtoSubject,
    },
    sections,
    projects: portfolioProjects,
    education,
    certifications,
    skills: { ...cvDocument.technicalSkills },
    cv: {
      experience: cloneExperience(),
      projects: cloneCvProjects(),
    },
    cvPdf: {
      url: profile.cvPdfUrl,
      pathname: 'public-cv',
      downloadFileName: profile.cvPdfDownloadFileName,
    },
  };
}

export function mediaPathnames(doc: PortfolioContent): string[] {
  const paths: string[] = [];
  if (doc.profile.portraitPathname) paths.push(doc.profile.portraitPathname);
  if (doc.cvPdf?.pathname && doc.cvPdf.pathname !== 'public-cv') paths.push(doc.cvPdf.pathname);
  for (const project of doc.projects) {
    for (const image of project.images) {
      if (image.pathname) paths.push(image.pathname);
    }
  }
  for (const cert of doc.certifications) {
    if (cert.image?.pathname) paths.push(cert.image.pathname);
  }
  return paths;
}
