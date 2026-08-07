'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* Active Theory–style scrolling image backdrop: a fixed, scroll-driven WebGL
   field of tech-themed texture planes behind the whole site. Content paints
   above it (canvas lives at z-index -1), so it never intercepts clicks. */

const PALETTE = {
  base: '#080d17',
  muted: 'rgba(139, 147, 167, 0.55)',
  faint: 'rgba(139, 147, 167, 0.28)',
  accent: 'rgba(200, 242, 78, 0.85)',
  accentDim: 'rgba(200, 242, 78, 0.3)',
  cyan: 'rgba(96, 165, 250, 0.7)',
};

function makeCanvas(w = 1024, h = 1024) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ——— procedural "tech stack" textures ——— */

function drawCode(c, w, h) {
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.base;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = PALETTE.accentDim;
  ctx.fillRect(0, 0, w, 5);
  ctx.font = '28px "JetBrains Mono", ui-monospace, monospace';
  const lines = [
    ["import", " { NextResponse } from 'next/server'"],
    ["const", " stack = await fingerprint(url);"],
    ["if", " (rules[i].match(html)) {"],
    ["  hits.push({ tech: '", "React", "', confidence: 'high' });"],
    ["}", ""],
    ["export", " default async function GET(", "req", ") {"],
    ["  return NextResponse.json(", "stack", ");"],
    ["}", ""],
    ["const", " ui = render(<", "StackFingerprint", " />);"],
    ["", "// 2,300+ rules · 1,870 hand-crafted · 8,384 generated"],
  ];
  const startY = h * 0.16;
  const step = (h * 0.68) / lines.length;
  lines.forEach(([kw, rest, hl], i) => {
    const y = startY + i * step;
    let x = w * 0.08;
    if (kw) {
      ctx.fillStyle = PALETTE.accent;
      ctx.fillText(kw, x, y);
      x += ctx.measureText(kw).width;
    }
    if (rest) {
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(rest, x, y);
      x += ctx.measureText(rest).width;
    }
    if (hl) {
      ctx.fillStyle = PALETTE.cyan;
      ctx.fillText(hl, x, y);
    }
  });
}

function drawNetwork(c, w, h) {
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.base;
  ctx.fillRect(0, 0, w, h);
  const rnd = seededRandom(7);
  const nodes = [];
  for (let i = 0; i < 42; i += 1) {
    nodes.push({ x: rnd() * w, y: rnd() * h, r: 3 + rnd() * 6, hot: rnd() < 0.14 });
  }
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.hypot(dx, dy);
      if (d < 150) {
        ctx.strokeStyle = PALETTE.faint;
        ctx.globalAlpha = 1 - d / 150;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  nodes.forEach((n) => {
    ctx.fillStyle = n.hot ? PALETTE.accent : PALETTE.muted;
    ctx.shadowBlur = n.hot ? 14 : 0;
    ctx.shadowColor = PALETTE.accent;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function drawFingerprint(c, w, h) {
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.base;
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const ringGap = 26;
  for (let i = 1; i <= 14; i += 1) {
    const r = i * ringGap;
    const arcs = 5 + Math.floor(i * 1.4);
    ctx.strokeStyle = i % 5 === 0 ? PALETTE.accentDim : PALETTE.faint;
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      const amp = Math.sin(a * arcs + i * 1.7) * 5;
      const px = cx + Math.cos(a) * (r + amp);
      const py = cy + Math.sin(a) * (r + amp);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrid(c, w, h) {
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.base;
  ctx.fillRect(0, 0, w, h);
  const hy = h * 0.52;
  const fadeTop = ctx.createLinearGradient(0, 0, 0, h);
  fadeTop.addColorStop(0, 'rgba(8, 13, 23, 0)');
  fadeTop.addColorStop(0.35, 'rgba(8, 13, 23, 1)');
  fadeTop.addColorStop(1, 'rgba(8, 13, 23, 0.55)');
  ctx.strokeStyle = PALETTE.muted;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 12; i += 1) {
    const y = hy + Math.pow(i / 12, 2) * h * 0.5;
    ctx.globalAlpha = 0.15 + (i / 12) * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = -12; i <= 12; i += 1) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 18, hy);
    ctx.lineTo(w / 2 + i * 140, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = fadeTop;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = PALETTE.accentDim;
  ctx.fillRect(0, hy, w, 2);
}

function drawWave(c, w, h) {
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.base;
  ctx.fillRect(0, 0, w, h);
  const rnd = seededRandom(21);
  const cx = w / 2;
  const barW = 7;
  ctx.fillStyle = PALETTE.accentDim;
  for (let i = -60; i <= 60; i += 1) {
    const x = cx + i * (barW + 5);
    const amp = rnd() * h * 0.34 + 14;
    ctx.globalAlpha = 0.5 + (i % 7 === 0 ? 0.4 : 0);
    ctx.fillRect(x, h / 2 - amp / 2, barW, amp);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillRect(0, h / 2 - 1, w, 2);
}

function drawHex(c, w, h) {
  const ctx = c.getContext('2d');
  ctx.fillStyle = PALETTE.base;
  ctx.fillRect(0, 0, w, h);
  const s = 44;
  const hx = s * Math.sqrt(3);
  const rnd = seededRandom(3);
  for (let row = -1; row < h / (s * 1.5) + 1; row += 1) {
    for (let col = -1; col < w / hx + 1; col += 1) {
      const cx = col * hx + (row % 2 ? hx / 2 : 0);
      const cy = row * s * 1.5;
      const hot = rnd() < 0.08;
      ctx.strokeStyle = hot ? PALETTE.accent : PALETTE.faint;
      ctx.lineWidth = hot ? 2 : 1;
      ctx.beginPath();
      for (let k = 0; k < 6; k += 1) {
        const a = (Math.PI / 3) * k;
        const px = cx + Math.cos(a) * s;
        const py = cy + Math.sin(a) * s;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

const TEXTURE_FACTORIES = [drawCode, drawNetwork, drawFingerprint, drawGrid, drawWave, drawHex];

export default function ScrollWebGLBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (typeof window === 'undefined') return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    camera.position.set(0, 0, 14);

    const group = new THREE.Group();
    scene.add(group);

    const textures = TEXTURE_FACTORIES.map((fn) => {
      const t = new THREE.CanvasTexture(makeCanvas());
      fn(t.image, t.image.width, t.image.height);
      t.needsUpdate = true;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });

    const planes = [];
    const PLACEMENTS = [
      { kind: 0, x: -4.2, y: 2.6, z: -7, rotY: 0.5, parallax: 2.2, scrollRot: 0.5, win: [0, 0.34] },
      { kind: 1, x: 4.4, y: 2.3, z: -4.5, rotY: -0.5, parallax: 1.8, scrollRot: -0.4, win: [0.12, 0.5] },
      { kind: 2, x: -4.6, y: -2.4, z: -3, rotY: 0.3, parallax: 1.4, scrollRot: 0.35, win: [0.28, 0.64] },
      { kind: 3, x: 4.6, y: -2.6, z: -1.5, rotY: -0.4, parallax: 1.1, scrollRot: -0.3, win: [0.44, 0.8] },
      { kind: 4, x: -4.0, y: 1.5, z: 1.2, rotY: 0.4, parallax: 0.8, scrollRot: 0.25, win: [0.6, 0.92] },
      { kind: 5, x: 3.8, y: -0.6, z: 2.8, rotY: -0.3, parallax: 0.5, scrollRot: -0.2, win: [0.76, 1.01] },
    ];

    PLACEMENTS.forEach((p, i) => {
      const geo = new THREE.PlaneGeometry(9, 9);
      const mat = new THREE.MeshBasicMaterial({ map: textures[p.kind], transparent: true, opacity: 0, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.y = p.rotY;
      mesh.userData = {
        rotY: p.rotY,
        baseY: p.y,
        parallax: p.parallax,
        scrollRot: p.scrollRot,
        phase: i * 1.3,
        winStart: p.win[0],
        winEnd: p.win[1],
      };
      group.add(mesh);
      planes.push(mesh);
    });

    const particleGeo = new THREE.BufferGeometry();
    const rnd = seededRandom(11);
    const count = 420;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      posArr[i * 3] = (rnd() - 0.5) * 24;
      posArr[i * 3 + 1] = (rnd() - 0.5) * 14;
      posArr[i * 3 + 2] = (rnd() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0x9aa1b2, size: 0.035, transparent: true, opacity: 0.4, depthWrite: false })
    );
    group.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    let camX = 0;
    let camY = 0;

    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    let visible = true;
    const onVisibility = () => { visible = !document.hidden; };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const smoothstep = (a, b, x) => {
      const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
      return t * t * (3 - 2 * t);
    };

    const getProgress = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      return Math.min(Math.max(window.scrollY / max, 0), 1);
    };

    const renderFrame = () => {
      const p = getProgress();
      const t = performance.now();
      group.position.z = -p * 5;
      group.rotation.y = (p - 0.5) * 0.7;
      group.rotation.x = (p - 0.5) * 0.1;

      planes.forEach((mesh) => {
        const u = mesh.userData;
        const fadeIn = smoothstep(u.winStart - 0.07, u.winStart + 0.05, p);
        const fadeOut = 1 - smoothstep(u.winEnd - 0.05, u.winEnd + 0.09, p);
        const drift = reduceMotion ? 0 : Math.sin(t * 0.0003 + u.phase) * 0.03;
        mesh.material.opacity = 0.92 * fadeIn * fadeOut;
        mesh.position.y = u.baseY + p * u.parallax;
        mesh.rotation.y = u.rotY + drift + p * u.scrollRot;
      });

      particles.rotation.z = p * 0.5;
      particles.position.y = p * -1.2;

      camX += (mouseX * 0.9 - camX) * 0.035;
      camY += (-mouseY * 0.6 - camY) * 0.035;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    if (reduceMotion) {
      renderFrame();
      return undefined;
    }

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    renderFrame();
    let raf;
    const loop = () => {
      if (visible) renderFrame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      planes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      textures.forEach((t) => t.dispose());
      particleGeo.dispose();
      particles.material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="webgl-bg" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
