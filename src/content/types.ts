import type { CvExperience, CvProject } from '../data/cv';
import type {
  DomainTag,
  ProjectContext,
  ProjectImageLayout,
  ProjectLink,
  ProjectStatus,
} from '../data/projects';

export type SectionId =
  | 'hero'
  | 'project-matrix'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'contact'
  | 'cv';

export type SectionConfig = {
  enabled: boolean;
  navLabel: string;
};

export type PortfolioProfile = {
  name: string;
  roleTitle: string;
  subtitle: string;
  location: string;
  email: string;
  phone: string;
  phoneTel: string;
  githubUrl: string;
  githubLabel: string;
  portraitUrl: string;
  portraitPathname?: string;
  copyrightLine: string;
  mailtoSubject: string;
};

export type PortfolioImage = {
  src: string;
  alt: string;
  caption: string;
  layout?: ProjectImageLayout;
  pathname?: string;
};

export type PortfolioProject = {
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
  images: PortfolioImage[];
  order: number;
};

export type EducationEntry = {
  id: string;
  school: string;
  location: string;
  credential: string;
  dates: string;
  details: string;
  order: number;
};

export type CertificationEntry = {
  id: string;
  title: string;
  issuer: string;
  issued: string;
  summary: string;
  image?: PortfolioImage | null;
  order: number;
};

export type SkillFields = {
  languages: string;
  frameworksWeb: string;
  databasesMiddleware: string;
  devops: string;
  securityTools: string;
};

export type CvPdf = {
  url: string;
  pathname: string;
  downloadFileName: string;
};

export type PortfolioContent = {
  version: 1;
  updatedAt: string;
  profile: PortfolioProfile;
  sections: Record<SectionId, SectionConfig>;
  projects: PortfolioProject[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  skills: SkillFields;
  cv: {
    experience: CvExperience[];
    projects: CvProject[];
  };
  cvPdf: CvPdf | null;
};

export const SECTION_ORDER: SectionId[] = [
  'hero',
  'project-matrix',
  'skills',
  'education',
  'certifications',
  'contact',
  'cv',
];
