/** Canonical fields from myResume.md / PROJECT_BLUEPRINT.md §6 — do not invent. */

export const profile = {
  name: 'Aaron Christian B. Tamayo',
  location: 'Dagupan City, Pangasinan, Philippines',
  email: 'tamayo.aaron.benavides.ien@gmail.com',
  phone: '+63 966 663 8967',
  phoneTel: '+639666638967',
  githubUrl: 'https://github.com/goSTYLO',
  githubLabel: 'github.com/goSTYLO',
  educationLine:
    'PHINMA University of Pangasinan · BS IT – System Development · Expected 2027',
  copyrightLine: `© ${new Date().getFullYear()} Aaron Christian B. Tamayo · All rights reserved.`,
  cvDownloadFileName: 'Aaron_Tamayo_Resume.md',
  cvPdfUrl: '/cv/aaron-tamayo-resume.pdf',
  cvPdfDownloadFileName: 'Aaron_Tamayo_CV.pdf',
  mailtoSubject: 'Portfolio inquiry — Aaron Tamayo',
} as const;

export function mailtoHref(): string {
  const subject = encodeURIComponent(profile.mailtoSubject);
  return `mailto:${profile.email}?subject=${subject}`;
}
