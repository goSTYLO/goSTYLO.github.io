export const PORTFOLIO_NAV = [
  { id: 'hero', label: 'OVERVIEW' },
  { id: 'project-matrix', label: 'SYSTEMS' },
  { id: 'domains', label: 'DOMAINS' },
  { id: 'footer-console', label: 'CONSOLE' },
] as const;

export type PortfolioSectionId = (typeof PORTFOLIO_NAV)[number]['id'];
