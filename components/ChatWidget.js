'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const SUGGESTIONS = [
  'Scan example.com',
  'What is React?',
  'Top CMS platforms',
  'Compare vercel.com and netlify.com',
];

function loadHistory() {
  try {
    const raw = sessionStorage.getItem('tsf-chat-session');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(false);
  const audioRef = useRef(null);
  const unlockedRef = useRef(false);

  const playChime = useCallback(function playChime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
        if (!unlockedRef.current) {
          const unlock = () => {
            unlockedRef.current = true;
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
            ctx
              .resume()
              .then(() => {
                if (ctx.state === 'running') playChime();
              })
              .catch(() => {});
          };
          window.addEventListener('pointerdown', unlock);
          window.addEventListener('keydown', unlock);
        }
        return;
      }
      if (ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const note = (freq, at, dur, vol, type) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + at);
        gain.gain.exponentialRampToValueAtTime(vol, now + at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + at);
        osc.stop(now + at + dur + 0.05);
      };
      note(523.25, 0, 0.16, 0.07, 'sine');
      note(783.99, 0.12, 0.24, 0.05, 'sine');
    } catch {}
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const prime = () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('keydown', prime);
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx || audioRef.current) return;
      const ctx = new Ctx();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      audioRef.current = ctx;
    };
    window.addEventListener('pointerdown', prime);
    window.addEventListener('keydown', prime);
    return () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('keydown', prime);
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/') return undefined; // fullscreen cinematic homepage — no auto-open
    const t = setTimeout(() => {
      if (!openRef.current) {
        setOpen(true);
        playChime();
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [playChime]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    try {
      sessionStorage.setItem('tsf-chat-session', JSON.stringify(messages.slice(-20)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setError(null);
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setError('Network error — are you online?');
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    try {
      sessionStorage.removeItem('tsf-chat-session');
    } catch {}
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="AI chat assistant"
          className="fixed bottom-24 right-4 z-[80] flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border-strong bg-elevated/95 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.75)] animate-fade-up"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-accent/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <div>
                <p className="text-sm font-semibold text-fg">Stack Assistant</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-faint">AI · scans & trends</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                aria-label="Clear conversation"
                className="rounded-md p-1.5 text-faint transition-colors hover:bg-border/40 hover:text-fg"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-md p-1.5 text-faint transition-colors hover:bg-border/40 hover:text-fg"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex max-h-[min(60vh,440px)] flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !loading && (
              <div>
                <p className="text-xs leading-relaxed text-muted">
                  Hi! I can scan any website, look up technology trends, and compare stacks. Try one of these:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-accent px-3.5 py-2.5 text-[13px] text-bg'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-fg'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: '0.2s' }} />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-tag-red-bg bg-tag-red-bg px-3.5 py-2.5 text-[12px] text-tag-red-fg">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-border px-3 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-accent">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask me about any website or tech…"
                className="max-h-24 flex-1 resize-none bg-transparent text-[13px] text-fg outline-none placeholder:text-faint"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="shrink-0 rounded-lg bg-accent p-2 text-bg transition-all hover:brightness-110 disabled:opacity-40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-faint">Scans may take a few seconds. AI can make mistakes — verify important findings.</p>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) playChime();
        }}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className={`fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-elevated text-accent shadow-[0_0_24px_rgba(200,242,78,0.25)] transition-transform hover:scale-105 active:scale-95 ${open ? 'rotate-90' : ''}`}
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.36-6.36-2.12 2.12M7.76 16.24l-2.12 2.12M18.36 18.36l-2.12-2.12M7.76 7.76 5.64 5.64" />
          </svg>
        )}
      </button>
    </>
  );
}
