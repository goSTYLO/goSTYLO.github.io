import { useCallback, useEffect, useState } from 'react';
import BlueprintCrosshairCursor from './components/BlueprintCrosshairCursor';
import BlueprintGridBackground from './components/BlueprintGridBackground';
import HeaderHUD from './components/HeaderHUD';
import HeroSection from './components/HeroSection';
import FooterConsole from './components/FooterConsole';
import ProjectMatrix from './components/ProjectMatrix';
import SkillRaster from './components/SkillRaster';
import CvAstOverlay from './components/CvAstOverlay';
import { PORTFOLIO_NAV, type PortfolioSectionId } from './data/navSections';

export default function App() {
  const [activeSection, setActiveSection] = useState<PortfolioSectionId>('hero');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: PortfolioSectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    const elements = PORTFOLIO_NAV.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id as PortfolioSectionId | undefined;
        if (id && PORTFOLIO_NAV.some((section) => section.id === id)) {
          setActiveSection(id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.35] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <BlueprintGridBackground />
      <BlueprintCrosshairCursor />

      <div className="relative z-[1]">
        <HeaderHUD
          activeSection={activeSection}
          onNavigate={scrollToSection}
          onLaunchChatbot={() => {
            setChatbotOpen(true);
            setCvOpen(false);
          }}
        />

        {cvOpen ? <CvAstOverlay onClose={() => setCvOpen(false)} /> : null}

        <HeroSection
          cvOpen={cvOpen}
          onOpenCv={() => {
            setCvOpen((open) => {
              const next = !open;
              if (next) setChatbotOpen(false);
              return next;
            });
          }}
          onExploreSystems={() => scrollToSection('project-matrix')}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          <ProjectMatrix />
          <SkillRaster />
          <FooterConsole />
        </main>
      </div>

      {chatbotOpen ? (
        <aside
          aria-label="AI Chatbot placeholder"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-[var(--border-cyan)] bg-[var(--bg-surface)] p-6"
        >
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[var(--accent-cyan)]">[AI_CHATBOT_INTERFACE]</span>
            <button
              type="button"
              onClick={() => setChatbotOpen(false)}
              className="border border-[var(--border-cyan)] px-2 py-1 text-[var(--text-muted)]"
            >
              [X]
            </button>
          </div>
          <p className="mt-6 font-mono text-sm text-[var(--text-muted)]">
            Placeholder panel. Chat runtime ships in Phase 4.
          </p>
        </aside>
      ) : null}
    </div>
  );
}
