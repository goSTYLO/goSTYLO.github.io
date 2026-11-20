import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminConsole from '@/components/admin/AdminConsole';
import AIChatDrawer from '@/components/ai-drawer/AIChatDrawer';
import AsciiRasterBackground from '@/components/common/AsciiRasterBackground';
import BlueprintCrosshairCursor from '@/components/common/BlueprintCrosshairCursor';
import BlueprintGridBackground from '@/components/common/BlueprintGridBackground';
import HeaderHUD from '@/components/hud/HeaderHUD';
import AsciiPlates from '@/components/sections/ascii-plates/AsciiPlates';
import CvAstOverlay from '@/components/sections/cv/CvAstOverlay';
import { CertificationsSection, EducationSection } from '@/components/sections/education/RecordSections';
import FooterConsole from '@/components/sections/footer/FooterConsole';
import HeroSection from '@/components/sections/hero/HeroSection';
import ProjectMatrix from '@/components/sections/project-matrix/ProjectMatrix';
import SkillRaster from '@/components/sections/skill-raster/SkillRaster';
import { useContent } from '@/content/ContentContext';
import { SECTION_ORDER } from '@/content/types';
import { visibleNav } from '@/lib/portfolioPure';
import { currentPath, go } from '@/lib/route';

export default function App() {
  const [path, setPath] = useState(currentPath);
  const { content } = useContent();
  const [activeSection, setActiveSection] = useState('hero');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const nav = useMemo(
    () =>
      visibleNav(
        SECTION_ORDER.map((id) => ({
          id,
          enabled: content.sections[id].enabled,
          navLabel: content.sections[id].navLabel,
        })),
      ),
    [content],
  );

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    const elements = nav
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (id && nav.some((section) => section.id === id)) setActiveSection(id);
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.35] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [nav]);

  if (path === '/console') return <AdminConsole />;

  const cvEnabled = content.sections.cv.enabled;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <BlueprintGridBackground />
      <AsciiRasterBackground />
      <BlueprintCrosshairCursor />

      <div className="relative z-[1] min-w-0">
        <HeaderHUD
          nav={nav.map((item) => ({ id: item.id, label: item.navLabel }))}
          activeSection={activeSection}
          onNavigate={scrollToSection}
          onAdmin={() => go('/console')}
          onLaunchChatbot={() => {
            setChatbotOpen(true);
            setCvOpen(false);
          }}
        />

        {cvOpen && cvEnabled ? <CvAstOverlay onClose={() => setCvOpen(false)} /> : null}

        {content.sections.hero.enabled ? (
          <HeroSection
            cvOpen={cvOpen}
            onOpenCv={
              cvEnabled
                ? () => {
                    setCvOpen((open) => {
                      const next = !open;
                      if (next) setChatbotOpen(false);
                      return next;
                    });
                  }
                : undefined
            }
            onExploreSystems={() => scrollToSection('project-matrix')}
          />
        ) : null}

        <main className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          {content.sections['project-matrix'].enabled ? <ProjectMatrix /> : null}
          {content.sections.skills.enabled ? <SkillRaster /> : null}
          {content.sections.education.enabled ? <EducationSection entries={content.education} /> : null}
          {content.sections.certifications.enabled ? (
            <CertificationsSection entries={content.certifications} />
          ) : null}
          {content.sections.contact.enabled ? <FooterConsole /> : null}
        </main>

        <AsciiPlates />
      </div>

      <AIChatDrawer open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
}
