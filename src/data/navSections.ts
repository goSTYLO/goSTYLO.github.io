export const PORTFOLIO_NAV = [
  { id: 'hero', label: 'OVERVIEW' },
  { id: 'project-matrix', label: 'SYSTEMS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'contact', label: 'CONTACT' },
] as const;

export type PortfolioSectionId = (typeof PORTFOLIO_NAV)[number]['id'];
