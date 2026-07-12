'use client';
import { useRef, useEffect, useState, useMemo } from 'react';

const DEPS = {
  'Next.js':       ['React', 'Node.js'],
  'React':         [],
  'Vue.js':        [],
  'Angular':       [],
  'Svelte':        [],
  'Nuxt':          ['Vue.js', 'Node.js'],
  'Gatsby':        ['React', 'Node.js'],
  'Remix':         ['React', 'Node.js'],
  'Astro':         [],
  'Solid.js':      [],
  'Tailwind CSS':  [],
  'Bootstrap':     [],
  'Bulma':         [],
  'Foundation':    [],
  'Material UI':   ['React'],
  'Chakra UI':     ['React'],
  'Ant Design':    ['React'],
  'Vuetify':       ['Vue.js'],
  'jQuery':        [],
  'Lodash':        [],
  'Three.js':      [],
  'D3.js':         [],
  'GSAP':          [],
  'Framer Motion': ['React'],
  'Node.js':       [],
  'Express':       ['Node.js'],
  'Django':        ['Python'],
  'Laravel':       ['PHP'],
  'Ruby on Rails': ['Ruby'],
  'Spring Boot':   ['Java'],
  'Flask':         ['Python'],
  'FastAPI':       ['Python'],
  'WordPress':     ['PHP', 'MySQL'],
  'Drupal':        ['PHP', 'MySQL'],
  'Webpack':       ['Node.js'],
  'Vite':          ['Node.js'],
  'Parcel':        ['Node.js'],
  'esbuild':       [],
  'Turbopack':     ['Node.js'],
  'TypeScript':    ['JavaScript'],
  'Prisma':        ['Node.js'],
  'Docker':        [],
  'Kubernetes':    ['Docker'],
  'Terraform':     [],
  'GraphQL':       [],
  'Jest':          ['Node.js'],
  'Cypress':       ['Node.js'],
  'Playwright':    ['Node.js'],
  'Storybook':     ['Node.js'],
  'Sentry':        [],
  'New Relic':     [],
  'Datadog':       [],
  'Firebase':      ['Node.js'],
  'Supabase':      ['Node.js'],
  'Algolia':       [],
  'Elasticsearch': [],
  'Redis':         [],
  'MongoDB':       [],
  'PostgreSQL':    [],
  'MySQL':         [],
  'Contentful':    ['Node.js'],
  'Sanity':        ['Node.js'],
  'Strapi':        ['Node.js'],
  'NextAuth.js':   ['Next.js', 'Node.js'],
  'Clerk':         ['Node.js'],
  'Auth0':         ['Node.js'],
  'Firebase Auth': ['Firebase'],
  'Stripe':        [],
  'PayPal':        [],
  'Google Analytics': ['Google Tag Manager'],
  'Cloudflare':    [],
  'AWS':           [],
  'Vercel':        ['Node.js'],
  'Netlify':       [],
  'Nginx':         [],
  'Apache':        [],
};

const TYPE_COLORS = { frontend: '#3b82f6', backend: '#10b981', infra: '#f59e0b' };

export default function DependencyGraph({ categories }) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const nodesRef = useRef([]);
  const animRef = useRef(null);

  const { nodes, edges } = useMemo(() => {
    const names = new Set();
    const typeOf = {};
    (categories || []).forEach((cat) => {
      cat.technologies.forEach((t) => {
        names.add(t.name);
        typeOf[t.name] = t.type;
      });
    });

    const nodesArr = [];
    const edgesArr = [];
    const added = new Set();

    names.forEach((name) => {
      const deps = (DEPS[name] || []).filter((d) => names.has(d));
      if (!added.has(name)) {
        nodesArr.push({ name, type: typeOf[name] || 'infra' });
        added.add(name);
      }
      deps.forEach((dep) => {
        if (!added.has(dep)) {
          nodesArr.push({ name: dep, type: typeOf[dep] || 'infra' });
          added.add(dep);
        }
        edgesArr.push({ from: name, to: dep });
      });
    });

    return { nodes: nodesArr, edges: edgesArr };
  }, [categories]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nodes.length) return;

    const ctx = canvas.getContext('2d');
    const W = 600;
    const H = 400;
    canvas.width = W;
    canvas.height = H;

    const nodeMap = {};
    const padding = 60;
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      const r = 120 + Math.random() * 40;
      nodeMap[n.name] = {
        ...n,
        x: W / 2 + Math.cos(angle) * r,
        y: H / 2 + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        radius: 14,
      };
    });

    nodesRef.current = nodeMap;

    function tick() {
      const strength = 0.005;
      const repulsion = 800;
      const damping = 0.85;
      const centerPull = 0.001;

      edges.forEach((e) => {
        const a = nodeMap[e.from];
        const b = nodeMap[e.to];
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * strength;
        a.vx += (dx / dist) * force;
        a.vy += (dy / dist) * force;
        b.vx -= (dx / dist) * force;
        b.vy -= (dy / dist) * force;
      });

      Object.values(nodeMap).forEach((a) => {
        Object.values(nodeMap).forEach((b) => {
          if (a === b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 150) {
            const force = repulsion / (dist * dist);
            a.vx -= (dx / dist) * force;
            a.vy -= (dy / dist) * force;
          }
        });
      });

      Object.values(nodeMap).forEach((n) => {
        n.vx += (W / 2 - n.x) * centerPull;
        n.vy += (H / 2 - n.y) * centerPull;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(padding, Math.min(W - padding, n.x));
        n.y = Math.max(padding, Math.min(H - padding, n.y));
      });
    }

    let frame = 0;
    function draw() {
      tick();
      ctx.clearRect(0, 0, W, H);

      edges.forEach((e) => {
        const a = nodeMap[e.from];
        const b = nodeMap[e.to];
        if (!a || !b) return;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(100,116,139,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.beginPath();
        ctx.moveTo(mx + 4 * Math.cos(angle), my + 4 * Math.sin(angle));
        ctx.lineTo(mx - 4 * Math.cos(angle) + 4 * Math.cos(angle + Math.PI / 2), my - 4 * Math.sin(angle) + 4 * Math.sin(angle + Math.PI / 2));
        ctx.lineTo(mx - 4 * Math.cos(angle) - 4 * Math.cos(angle + Math.PI / 2), my - 4 * Math.sin(angle) - 4 * Math.sin(angle + Math.PI / 2));
        ctx.closePath();
        ctx.fillStyle = 'rgba(100,116,139,0.4)';
        ctx.fill();
      });

      Object.values(nodeMap).forEach((n) => {
        const color = TYPE_COLORS[n.type] || '#8b5cf6';
        const isHovered = hovered === n.name;
        const r = isHovered ? n.radius + 3 : n.radius;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}15`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}30`;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        ctx.fillStyle = isHovered ? '#f8fafc' : '#e2e8f0';
        ctx.font = `${isHovered ? 'bold ' : ''}${isHovered ? 11 : 10}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.name, n.x, n.y);
      });

      if (frame < 200) {
        animRef.current = requestAnimationFrame(draw);
        frame++;
      }
    }

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [nodes, edges, hovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleMove(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 600 / rect.width;
      const scaleY = 400 / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      let found = null;
      nodesRef.current && Object.values(nodesRef.current).forEach((n) => {
        const dx = mx - n.x;
        const dy = my - n.y;
        if (Math.sqrt(dx * dx + dy * dy) < n.radius + 5) {
          found = n.name;
        }
      });
      setHovered(found);
    }

    function handleLeave() {
      setHovered(null);
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  if (!nodes.length) return null;

  const hoveredDeps = hovered ? (DEPS[hovered] || []).filter((d) => nodes.find((n) => n.name === d)) : [];

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Dependency Graph
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {type}
            </span>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg/50">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ aspectRatio: '3/2' }}
        />
        {hovered && (
          <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-elevated/95 px-3 py-2 backdrop-blur-sm">
            <div className="text-xs font-semibold text-fg">{hovered}</div>
            {hoveredDeps.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-muted">
                depends on:
                {hoveredDeps.map((d) => (
                  <span key={d} className="text-accent">{d}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
