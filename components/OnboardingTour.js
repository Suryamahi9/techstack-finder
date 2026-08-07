'use client';
import { useState, useEffect } from 'react';

const STEPS = [
  {
    title: 'Welcome to TechStack Finder',
    description: 'Discover what technologies any website is built with. This quick tour will show you around.',
    target: null,
  },
  {
    title: 'Search any website',
    description: 'Enter a URL in the search bar and hit Enter. Try amazon.com, github.com, or any site you\'re curious about.',
    target: 'search-bar',
  },
  {
    title: 'Real-time scan progress',
    description: 'Watch as we analyze DNS, fetch HTML, scan CSS/JS assets, probe paths, and match against 10,000+ detection rules.',
    target: 'scan-progress',
  },
  {
    title: 'Results overview',
    description: 'See a 6-dimension health score, detected technologies, security analysis, and more — all in one place.',
    target: 'results-overview',
  },
  {
    title: 'Technologies breakdown',
    description: 'Every detected technology is listed with version, confidence, and category. Filter by Main vs Rare tech.',
    target: 'tech-tab',
  },
  {
    title: 'Export & share',
    description: 'Export your scan as CSV, JSON, or PDF. Share the public URL or bookmark it for later.',
    target: 'export-buttons',
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') {
      setStep(0);
      setVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('tsf-onboarding-done', 'true');
      setVisible(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tsf-onboarding-done', 'true');
    setVisible(false);
  };

  if (!visible || step < 0) return null;

  const current = STEPS[step];

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-fg/40 backdrop-blur-sm" onClick={handleSkip} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="animate-fade-up mx-auto w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Step {step + 1} of {STEPS.length}</span>
            <button onClick={handleSkip} className="text-xs text-muted hover:text-fg">Skip</button>
          </div>

          <div className="mb-1 flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-accent' : 'bg-border'}`} />
            ))}
          </div>

          <h3 className="mt-5 text-lg font-semibold">{current.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{current.description}</p>

          <div className="mt-6 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="text-sm text-muted hover:text-fg">&larr; Back</button>
            ) : <div />}
            <button onClick={handleNext} className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg transition-all duration-300 hover:brightness-110 active:scale-95">
              {step < STEPS.length - 1 ? 'Next' : 'Get started'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
