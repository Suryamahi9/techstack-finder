'use client';
import { useState, useEffect } from 'react';
import AnimatedMesh from './AnimatedMesh';
import ConstellationBg from './ConstellationBg';
import ParticleField from './ParticleField';
import AuroraWaves from './AuroraWaves';

const BACKGROUNDS = [
  { id: 'mesh', name: 'Mesh', icon: '◉' },
  { id: 'constellation', name: 'Stars', icon: '✦' },
  { id: 'particles', name: 'Dust', icon: '·' },
  { id: 'aurora', name: 'Waves', icon: '≋' },
  { id: 'off', name: 'None', icon: '—' },
];

export default function BackgroundManager() {
  const [bg, setBg] = useState('mesh');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tsf-bg');
      if (saved && BACKGROUNDS.find(b => b.id === saved)) setBg(saved);
    } catch {}
  }, []);

  const select = (id) => {
    setBg(id);
    try { localStorage.setItem('tsf-bg', id); } catch {}
    setOpen(false);
  };

  return (
    <>
      {bg === 'mesh' && <AnimatedMesh />}
      {bg === 'constellation' && <ConstellationBg />}
      {bg === 'particles' && <ParticleField />}
      {bg === 'aurora' && <AuroraWaves />}

      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-elevated/90 px-2.5 text-xs font-medium text-fg backdrop-blur-md transition-all hover:border-border-strong hover:bg-elevated"
          title="Background animation"
        >
          <span className="text-faint">
            {BACKGROUNDS.find(b => b.id === bg)?.icon}
          </span>
          <span className="hidden sm:inline">
            {BACKGROUNDS.find(b => b.id === bg)?.name}
          </span>
          <svg className={`h-3 w-3 text-faint transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute bottom-11 right-0 w-36 rounded-xl border border-white/[0.08] bg-elevated/95 p-1.5 shadow-2xl backdrop-blur-xl"
            style={{ animation: 'slideUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {BACKGROUNDS.map(b => (
              <button
                key={b.id}
                onClick={() => select(b.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all ${
                  bg === b.id
                    ? 'bg-accent/10 text-fg'
                    : 'text-fg/70 hover:bg-white/[0.04]'
                }`}
              >
                <span className="w-4 text-center text-faint">{b.icon}</span>
                <span>{b.name}</span>
                {bg === b.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
