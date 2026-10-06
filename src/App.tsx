import { useCallback, useEffect, useState } from 'react';
import BlueprintCard from './components/BlueprintCard';
import BlueprintGridBackground from './components/BlueprintGridBackground';
import HeaderHUD from './components/HeaderHUD';
import HeroSection from './components/HeroSection';
import ProjectMatrix from './components/ProjectMatrix';
import { PORTFOLIO_NAV, type PortfolioSectionId } from './data/navSections';

const SECTIONS = [
  { id: 'domains' as const, label: 'Domains Grid', note: 'WEB / MOBILE / BACKEND / CLOUD — Phase 2' },
  {
    id: 'footer-console' as const,
    label: 'Footer Console',
    note: 'Terminal log & CTAs — Phase 4',
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<PortfolioSectionId>('hero');
  const [chatbotOpen, setChatbotOpen] = useState(false);

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

      <div className="relative z-[1]">
        <HeaderHUD
          activeSection={activeSection}
          onNavigate={scrollToSection}
          onLaunchChatbot={() => setChatbotOpen(true)}
        />

        <HeroSection onExploreSystems={() => scrollToSection('project-matrix')} />

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          <ProjectMatrix />
          {SECTIONS.map((section) => (
            <BlueprintCard key={section.id} id={section.id} className="scroll-mt-24">
              <p className="font-mono text-xs text-[var(--accent-cyan)]">[{section.label.toUpperCase()}]</p>
              <h2 className="mt-2 font-sans text-xl">{section.label}</h2>
              <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">{section.note}</p>
            </BlueprintCard>
          ))}
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
