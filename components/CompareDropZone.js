'use client';
import { useState } from 'react';

export default function CompareDropZone() {
  const [items, setItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    try {
      const tech = JSON.parse(e.dataTransfer.getData('application/json'));
      setItems((prev) => {
        if (prev.find((i) => i.name === tech.name)) return prev;
        return [...prev, { ...tech, id: tech.name + Date.now() }];
      });
      setOpen(true);
    } catch {}
  };

  const handleDragLeave = () => setDragging(false);

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  if (!open) {
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition-all duration-300 ${
          dragging
            ? 'scale-110 border-accent bg-accent/20 text-accent shadow-[0_0_24px_-4px_rgba(217,119,6,0.3)]'
            : 'border-white/10 bg-white/5 text-muted hover:border-accent/20 hover:text-fg'
        }`}
        onClick={() => items.length > 0 && setOpen(true)}
        title="Compare technologies"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M16 3h5v5M8 3H3v5M16 21h5v-5M8 21H3v-5M21 3l-7 7M3 3l7 7M21 21l-7-7M3 21l7-7" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-bg">
            {items.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <span className="text-sm font-medium">Compare ({items.length})</span>
          <button onClick={() => { setOpen(false); if (items.length === 0) return; }} className="text-xs text-muted hover:text-fg">Close</button>
        </div>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          className={`space-y-2 p-3 transition-all ${dragging ? 'bg-accent/5' : ''}`}
        >
          {items.length === 0 && (
            <p className="py-6 text-center text-xs text-muted">
              {dragging ? 'Drop here' : 'Drag a technology card here to compare'}
            </p>
          )}
          {items.map((tech) => (
            <div key={tech.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{tech.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span>{tech.category}</span>
                  {tech.version && <><span className="text-white/10">|</span><span>v{tech.version}</span></>}
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${tech.confidence === 'high' ? 'bg-green-400' : tech.confidence === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
                  <span className="capitalize">{tech.confidence}</span>
                </div>
              </div>
              <button onClick={() => removeItem(tech.id)} className="shrink-0 text-muted hover:text-red-400">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              className="w-full rounded-lg border border-white/10 py-2 text-xs text-muted hover:text-fg"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
