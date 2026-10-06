import type { LucideIcon } from 'lucide-react';
import { Cloud, Code2, Database, Layers, Shield } from 'lucide-react';

import { cvDocument } from '../data/cv';

export type SkillGroup = {
  id: string;
  indexLabel: string;
  title: string;
  hudTag: string;
  icon: LucideIcon;
  skills: string[];
};

function splitSkills(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Resume TECHNICAL SKILLS — single source via cvDocument. */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'languages',
    indexLabel: '01.',
    title: 'LANGUAGES',
    hudTag: 'LANGUAGES',
    icon: Code2,
    skills: splitSkills(cvDocument.technicalSkills.languages),
  },
  {
    id: 'frameworks-web',
    indexLabel: '02.',
    title: 'FRAMEWORKS_WEB',
    hudTag: 'FRAMEWORKS & WEB',
    icon: Layers,
    skills: splitSkills(cvDocument.technicalSkills.frameworksWeb),
  },
  {
    id: 'data-middleware',
    indexLabel: '03.',
    title: 'DATA_MIDDLEWARE',
    hudTag: 'DATABASES & MIDDLEWARE',
    icon: Database,
    skills: splitSkills(cvDocument.technicalSkills.databasesMiddleware),
  },
  {
    id: 'devops-infra',
    indexLabel: '04.',
    title: 'DEVOPS_INFRA',
    hudTag: 'DEVOPS & INFRASTRUCTURE',
    icon: Cloud,
    skills: splitSkills(cvDocument.technicalSkills.devops),
  },
  {
    id: 'security-tools',
    indexLabel: '05.',
    title: 'SECURITY_TOOLS',
    hudTag: 'SECURITY & TOOLS',
    icon: Shield,
    skills: splitSkills(cvDocument.technicalSkills.securityTools),
  },
];

/** ponytail: build-time guard — fails if resume skill CSV splits empty. */
export function assertSkillGroupsReady(): void {
  if (SKILL_GROUPS.length !== 5) {
    throw new Error('skillGroups: expected 5 resume skill groups');
  }
  for (const group of SKILL_GROUPS) {
    if (group.skills.length === 0) {
      throw new Error(`skillGroups: empty skills for ${group.id}`);
    }
  }
}
