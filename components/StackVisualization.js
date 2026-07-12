'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

const TYPE_COLORS = {
  frontend: '#3b82f6',
  backend: '#10b981',
  infra: '#f59e0b',
};

function buildGraph(categories) {
  const nodes = [];
  const edges = [];
  const catNodes = new Map();

  nodes.push({ id: '__center__', label: 'Tech Stack', type: 'center', x: 0, y: 0, vx: 0, vy: 0, radius: 28, fixed: true });

  (categories || []).forEach((cat) => {
    const catId = `cat_${cat.category}`;
    catNodes.set(cat.category, catId);
    nodes.push({ id: catId, label: cat.category, type: 'category', x: 0, y: 0, vx: 0, vy: 0, radius: 18, count: cat.technologies.length });
    edges.push({ source: '__center__', target: catId, strength: 0.3 });

    (cat.technologies || []).forEach((tech) => {
      const techId = `tech_${tech.name}`;
      nodes.push({ id: techId, label: tech.name, type: tech.type, x: 0, y: 0, vx: 0, vy: 0, radius: 10, tech });
      edges.push({ source: catId, target: techId, strength: 0.15 });
    });
  });

  return { nodes, edges };
}

function simulate(nodes, edges, width, height) {
  const cx = width / 2;
  const cy = height / 2;

  nodes.forEach((n) => {
    if (n.fixed) { n.x = cx; n.y = cy; return; }
    if (!n.x && !n.y) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 150;
      n.x = cx + Math.cos(angle) * dist;
      n.y = cy + Math.sin(angle) * dist;
    }
  });

  for (let iter = 0; iter < 300; iter++) {
    nodes.forEach((a) => {
      nodes.forEach((b) => {
        if (a.id === b.id) return;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = -800 / (dist * dist);
        let fx = (dx / dist) * force;
        let fy = (dy / dist) * force;
        if (!a.fixed) { a.vx += fx; a.vy += fy; }
        if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
      });
    });

    edges.forEach((e) => {
      const a = nodes.find((n) => n.id === e.source);
      const b = nodes.find((n) => n.id === e.target);
      if (!a || !b) return;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let targetDist = a.type === 'center' || b.type === 'center' ? 160 : 80;
      let force = (dist - targetDist) * e.strength * 0.01;
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;
      if (!a.fixed) { a.vx += fx; a.vy += fy; }
      if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
    });

    nodes.forEach((n) => {
      if (n.fixed) return;
      n.vx *= 0.85;
      n.vy *= 0.85;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
      n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
    });
  }
}

export default function StackVisualization({ categories }) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [graph, setGraph] = useState(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const animRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    if (!categories || categories.length === 0) return;
    const g = buildGraph(categories);
    simulate(g.nodes, g.edges, dims.w, dims.h);
    setGraph(g);
    nodesRef.current = g.nodes;
  }, [categories, dims]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = dims.w + 'px';
    canvas.style.height = dims.h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dims.w, dims.h);

    graph.edges.forEach((e) => {
      const a = graph.nodes.find((n) => n.id === e.source);
      const b = graph.nodes.find((n) => n.id === e.target);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = hovered && (hovered === a.id || hovered === b.id) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = hovered && (hovered === a.id || hovered === b.id) ? 1.5 : 0.5;
      ctx.stroke();
    });

    graph.nodes.forEach((n) => {
      const isHovered = hovered === n.id;
      const isCenter = n.type === 'center';
      const isCat = n.type === 'category';

      let color = isCenter ? 'var(--accent)' : isCat ? '#6366f1' : (TYPE_COLORS[n.type] || '#8b5cf6');
      let r = n.radius * (isHovered ? 1.2 : 1);

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

      if (isCenter) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
        grad.addColorStop(0, 'rgba(197,251,69,0.4)');
        grad.addColorStop(1, 'rgba(197,251,69,0.1)');
        ctx.fillStyle = grad;
      } else if (isCat) {
        ctx.fillStyle = isHovered ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)';
      } else {
        const alpha = isHovered ? 0.6 : 0.25;
        const hex = color;
        const r2 = parseInt(hex.slice(1, 3), 16);
        const g2 = parseInt(hex.slice(3, 5), 16);
        const b2 = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`;
      }
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = isHovered ? 2 : 0.5;
      ctx.stroke();

      ctx.fillStyle = isHovered ? '#fff' : isCenter ? '#fff' : isCat ? '#c7d2fe' : '#cbd5e1';
      ctx.font = isCenter ? 'bold 11px sans-serif' : isCat ? '600 9px sans-serif' : '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxLabelW = r * 2 - 4;
      let label = n.label;
      if (ctx.measureText(label).width > maxLabelW && label.length > 6) {
        label = label.slice(0, 5) + '…';
      }
      ctx.fillText(label, n.x, n.y);

      if (n.count && isCat) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '7px sans-serif';
        ctx.fillText(`${n.count}`, n.x, n.y + r + 10);
      }
    });
  }, [graph, hovered, dims]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const resize = () => {
      const el = canvasRef.current?.parentElement;
      if (el) setDims({ w: el.clientWidth, h: Math.min(500, Math.max(350, el.clientWidth * 0.55)) });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = null;
    for (const n of graph.nodes) {
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy < (n.radius + 6) * (n.radius + 6)) {
        found = n.id;
        break;
      }
    }
    setHovered(found);
    canvas.style.cursor = found ? 'pointer' : 'default';
  }, [graph]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const n of graph.nodes) {
      if (n.type === 'center' || n.type === 'category') continue;
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy < (n.radius + 6) * (n.radius + 6)) {
        window.open(`/results?site=${encodeURIComponent(n.tech?.detectedVia || '')}`, '_blank');
        break;
      }
    }
  }, [graph]);

  const tooltip = graph?.nodes.find((n) => n.id === hovered);

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Stack Graph</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> Frontend</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Backend</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Infra</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400" /> Category</span>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#0a0e1a]">
        <canvas
          ref={canvasRef}
          className="w-full"
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
          onClick={handleClick}
        />
        {tooltip && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs backdrop-blur-sm">
            <div className="font-semibold text-fg">{tooltip.label}</div>
            {tooltip.type !== 'center' && tooltip.type !== 'category' && (
              <div className="mt-0.5 text-muted">{tooltip.type} · {tooltip.id.split('_')[0]}</div>
            )}
            {tooltip.count && <div className="mt-0.5 text-muted">{tooltip.count} technologies</div>}
          </div>
        )}
      </div>
    </div>
  );
}
