/** Machine-readable portfolio summary — built from canonical profile / projects / CV data. */

import { cvDocument } from './cv';
import { profile } from './profile';
import { projects, type Project } from './projects';
import { assertSkillGroupsReady } from '../lib/skillGroups';

export const PORTFOLIO_SITE_URL = 'https://gostylo.github.io/';

export const PORTFOLIO_TITLE = 'Aaron Christian B. Tamayo | Lead Full-Stack Engineer';

export const PORTFOLIO_DESCRIPTION =
  'Lead full-stack engineer in Dagupan City, Philippines — web (React, Vite), mobile (Flutter), and cloud backends (Node.js, Express, GCP). Production work on Serbisyo (serbisyoprovider.com), enterprise WMS/POS, and capstone systems RescueLink and My Crew Manager.';

const RESUME_RAW_URL =
  'https://raw.githubusercontent.com/goSTYLO/goSTYLO.github.io/main/myResume.md';

const JOB_TITLE = 'Lead Full-Stack Engineer';

const KNOWS_ABOUT = Object.values(cvDocument.technicalSkills)
  .join(', ')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function projectWorksForJsonLd(project: Project) {
  const work: Record<string, unknown> = {
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    author: { '@id': `${PORTFOLIO_SITE_URL}#person` },
  };
  const live = project.links.find((l) => l.href)?.href;
  if (live) work.url = live;
  if (project.stack.length > 0) {
    work.keywords = project.stack.join(', ');
  }
  return work;
}

export function buildPortfolioJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${PORTFOLIO_SITE_URL}#website`,
        url: PORTFOLIO_SITE_URL,
        name: PORTFOLIO_TITLE,
        description: PORTFOLIO_DESCRIPTION,
        inLanguage: 'en',
      },
      {
        '@type': 'Person',
        '@id': `${PORTFOLIO_SITE_URL}#person`,
        name: profile.name,
        jobTitle: JOB_TITLE,
        url: PORTFOLIO_SITE_URL,
        email: profile.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dagupan City',
          addressRegion: 'Pangasinan',
          addressCountry: 'PH',
        },
        sameAs: [profile.githubUrl],
        knowsAbout: KNOWS_ABOUT,
        worksFor: {
          '@type': 'Organization',
          name: cvDocument.experience[0]?.company ?? 'Freelance',
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${PORTFOLIO_SITE_URL}#profile`,
        url: PORTFOLIO_SITE_URL,
        name: PORTFOLIO_TITLE,
        description: PORTFOLIO_DESCRIPTION,
        isPartOf: { '@id': `${PORTFOLIO_SITE_URL}#website` },
        mainEntity: { '@id': `${PORTFOLIO_SITE_URL}#person` },
      },
      {
        '@type': 'ItemList',
        '@id': `${PORTFOLIO_SITE_URL}#projects`,
        name: 'Portfolio systems',
        itemListElement: projects.map((project, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: projectWorksForJsonLd(project),
        })),
      },
    ],
  };
}

export function buildPortfolioHeadHtml(): string {
  const jsonLd = JSON.stringify(buildPortfolioJsonLd()).replaceAll('<', '\\u003c');
  const ogImage = `${PORTFOLIO_SITE_URL}aaron-profile.jpg`;

  return [
    `<meta name="description" content="${escapeHtml(PORTFOLIO_DESCRIPTION)}" />`,
    `<link rel="canonical" href="${PORTFOLIO_SITE_URL}" />`,
    `<meta name="author" content="${escapeHtml(profile.name)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="me" href="${profile.githubUrl}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:url" content="${PORTFOLIO_SITE_URL}" />`,
    `<meta property="og:title" content="${escapeHtml(PORTFOLIO_TITLE)}" />`,
    `<meta property="og:description" content="${escapeHtml(PORTFOLIO_DESCRIPTION)}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="profile:first_name" content="Aaron" />`,
    `<meta property="profile:last_name" content="Tamayo" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(PORTFOLIO_TITLE)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(PORTFOLIO_DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');
}

function projectOutlineHtml(project: Project): string {
  const links = project.links
    .filter((l) => l.href)
    .map((l) => `<li><a href="${escapeHtml(l.href!)}">${escapeHtml(l.label)}</a></li>`)
    .join('');
  const features = project.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('');
  const stack =
    project.stack.length > 0
      ? `<p>Stack: ${escapeHtml(project.stack.join(', '))}</p>`
      : '';

  return `<article id="project-${escapeHtml(project.id)}">
      <h3>${escapeHtml(project.title)}</h3>
      <p><strong>Role:</strong> ${escapeHtml(project.roleTitle)} — ${escapeHtml(project.roleSummary)}</p>
      <p>${escapeHtml(project.summary)}</p>
      ${stack}
      <ul>${features}</ul>
      ${links ? `<ul>${links}</ul>` : ''}
    </article>`;
}

/** Static HTML outline injected at build time for non-JS crawlers and LLM scrapers. */
export function buildPortfolioCrawlerOutlineHtml(): string {
  const experience = cvDocument.experience
    .map(
      (job) => `<li><strong>${escapeHtml(job.role)}</strong> at ${escapeHtml(job.company)} (${escapeHtml(job.dates)}): ${job.bullets.map((b) => escapeHtml(b)).join(' ')}</li>`,
    )
    .join('\n        ');

  const projectArticles = projects.map(projectOutlineHtml).join('\n      ');

  const skills = Object.entries(cvDocument.technicalSkills)
    .map(([key, value]) => `<li>${escapeHtml(key)}: ${escapeHtml(value)}</li>`)
    .join('\n        ');

  return `<div id="portfolio-crawler-outline" aria-hidden="true" class="portfolio-crawler-outline">
    <header>
      <h1>${escapeHtml(profile.name)} — ${escapeHtml(JOB_TITLE)}</h1>
      <p>${escapeHtml(PORTFOLIO_DESCRIPTION)}</p>
      <p>${escapeHtml(profile.location)} · <a href="${profile.githubUrl}">${escapeHtml(profile.githubLabel)}</a> · <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></p>
    </header>
    <main>
      <section aria-labelledby="crawler-experience">
        <h2 id="crawler-experience">Experience</h2>
        <ul>${experience}</ul>
      </section>
      <section aria-labelledby="crawler-projects">
        <h2 id="crawler-projects">Projects</h2>
      ${projectArticles}
      </section>
      <section aria-labelledby="crawler-skills">
        <h2 id="crawler-skills">Technical skills</h2>
        <ul>${skills}</ul>
      </section>
      <section aria-labelledby="crawler-education">
        <h2 id="crawler-education">Education</h2>
        <p>${escapeHtml(profile.educationLine)}</p>
      </section>
    </main>
  </div>`;
}

export function buildLlmsTxt(): string {
  const projectLines = projects
    .map((p) => {
      const live = p.links.find((l) => l.href)?.href;
      const line = `- ${p.title}: ${p.summary} Role: ${p.roleTitle}.`;
      return live ? `${line} Live: ${live}` : line;
    })
    .join('\n');

  return `# ${profile.name} — Portfolio

> ${PORTFOLIO_DESCRIPTION}

This site is a React portfolio at ${PORTFOLIO_SITE_URL}. Prefer these plain-text sources when summarizing Aaron's work.

## Canonical documents

- [Resume (Markdown)](${RESUME_RAW_URL}): Full experience, projects, skills, education.
- [Resume (PDF)](${PORTFOLIO_SITE_URL}cv/aaron-tamayo-resume.pdf): Downloadable CV.
- [GitHub](${profile.githubUrl}): Source repositories and activity.

## Contact

- Email: ${profile.email}
- Location: ${profile.location}
- Phone: ${profile.phone}

## Featured systems

${projectLines}

## Technical skills (resume groups)

- Languages: ${cvDocument.technicalSkills.languages}
- Frameworks & web: ${cvDocument.technicalSkills.frameworksWeb}
- Databases & middleware: ${cvDocument.technicalSkills.databasesMiddleware}
- DevOps & infrastructure: ${cvDocument.technicalSkills.devops}
- Security & tools: ${cvDocument.technicalSkills.securityTools}

Interactive UI: \`#skills\` Skill Raster coverflow on ${PORTFOLIO_SITE_URL}

## Optional

- [Portfolio HTML outline](${PORTFOLIO_SITE_URL}): Interactive UI; static crawler outline and JSON-LD are embedded in the built \`index.html\`.
`;
}

/** ponytail: build-time guard — throws if JSON-LD or llms.txt would be empty. */
export function assertPortfolioDocumentReady(): void {
  assertSkillGroupsReady();
  const graph = buildPortfolioJsonLd()['@graph'];
  if (!Array.isArray(graph) || graph.length < 3) {
    throw new Error('portfolioDocument: JSON-LD @graph is incomplete');
  }
  if (buildLlmsTxt().length < 200) {
    throw new Error('portfolioDocument: llms.txt content too short');
  }
  if (!buildPortfolioCrawlerOutlineHtml().includes(profile.name)) {
    throw new Error('portfolioDocument: crawler outline missing profile name');
  }
  if (!buildLlmsTxt().includes(cvDocument.technicalSkills.securityTools.split(',')[0]?.trim() ?? '')) {
    throw new Error('portfolioDocument: llms.txt missing security & tools skills');
  }
}
