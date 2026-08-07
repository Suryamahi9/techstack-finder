'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* Scroll-driven fullscreen 3D line field: a perspective grid of streaming
   lines on the floor plus faint verticals, all receding into the dark. The
   whole field travels forward as you scroll and sways gently with the mouse.
   Lives at z-index -1 behind all content, so it never intercepts clicks. */

const C = {
  accent: new THREE.Color(0xc8f24e),
  bright: new THREE.Color(0x9aa3b8),
  mid: new THREE.Color(0x626d85),
  faint: new THREE.Color(0x2c3446),
};

const Z_FAR = -58; // far edge of the grid
const Z_NEAR = 15; // near edge (camera plane)
const SPAN = Z_NEAR - Z_FAR;
const SPACING = 2.8; // spacing of streaming depth lines
const DEPTH_COUNT = Math.floor(SPAN / SPACING);
const HALF = 56; // half-extent along X
const LONG_STEP = 4.6; // spacing of longitude lines
const LONG_COUNT = Math.floor((2 * HALF) / LONG_STEP);
const VERT_COUNT = 46;
const TRAVEL = 90; // world units traveled over a full scroll

const LERP = (a, b, t) => a + (b - a) * t;

function buildDepthLines() {
  const count = DEPTH_COUNT + 1;
  const positions = new Float32Array(count * 6);
  const colors = new Float32Array(count * 8);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  return { geo, mat, lines: new THREE.LineSegments(geo, mat), positions, colors, count };
}

function buildLongitudeLines() {
  const count = LONG_COUNT + 1;
  const positions = new Float32Array(count * 6);
  const colors = new Float32Array(count * 8);
  for (let k = 0; k <= LONG_COUNT; k += 1) {
    const x = -HALF + k * LONG_STEP;
    const idx = k * 6;
    positions[idx] = x;
    positions[idx + 1] = 0;
    positions[idx + 2] = Z_FAR;
    positions[idx + 3] = x;
    positions[idx + 4] = 0;
    positions[idx + 5] = Z_NEAR;
    const isAccent = k % 5 === 0;
    const xN = Math.abs(x) / HALF;
    for (let v = 0; v < 2; v += 1) {
      const z = v === 0 ? Z_FAR : Z_NEAR;
      const d = (z - Z_FAR) / SPAN;
      const col = isAccent ? C.accent : v === 0 ? C.mid : C.bright;
      const a = isAccent
        ? 0.55 * (1 - xN * 0.6) * (0.3 + d * 0.7)
        : 0.4 * (1 - xN * 0.7) * (0.25 + d * 0.75);
      const ci = (k * 2 + v) * 4;
      colors[ci] = col.r;
      colors[ci + 1] = col.g;
      colors[ci + 2] = col.b;
      colors[ci + 3] = Math.max(0, a);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  return { geo, mat, lines: new THREE.LineSegments(geo, mat) };
}

function buildVerticals(rnd) {
  const positions = new Float32Array(VERT_COUNT * 6);
  const colors = new Float32Array(VERT_COUNT * 8);
  const heights = new Float32Array(VERT_COUNT);
  const baseZ = new Float32Array(VERT_COUNT);
  const accentFlags = new Uint8Array(VERT_COUNT);
  for (let i = 0; i < VERT_COUNT; i += 1) {
    const x = (rnd() - 0.5) * (HALF * 1.6);
    const z = Z_FAR + rnd() * (SPAN * 0.8);
    const h = 4 + rnd() * 12;
    baseZ[i] = z;
    heights[i] = h;
    accentFlags[i] = rnd() < 0.18 ? 1 : 0;
    const idx = i * 6;
    positions[idx] = x;
    positions[idx + 1] = 0;
    positions[idx + 2] = z;
    positions[idx + 3] = x;
    positions[idx + 4] = h;
    positions[idx + 5] = z;
    const d = (z - Z_FAR) / SPAN;
    const col = accentFlags[i] ? C.accent : C.mid;
    const a = (accentFlags[i] ? 0.5 : 0.28) * (0.3 + d * 0.7);
    for (let v = 0; v < 2; v += 1) {
      const ci = (i * 2 + v) * 4;
      colors[ci] = col.r;
      colors[ci + 1] = col.g;
      colors[ci + 2] = col.b;
      colors[ci + 3] = Math.max(0, a);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  return { geo, mat, lines: new THREE.LineSegments(geo, mat), positions, colors, heights, baseZ, accentFlags };
}

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
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 160);
    camera.position.set(0, 8.2, 14);

    const group = new THREE.Group();
    scene.add(group);

    const depth = buildDepthLines();
    const longitude = buildLongitudeLines();
    const verticals = buildVerticals(seededRandom(5));
    group.add(depth.lines, longitude.lines, verticals.lines);

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

    const getProgress = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      return Math.min(Math.max(window.scrollY / max, 0), 1);
    };

    const renderFrame = () => {
      const p = getProgress();
      const t = performance.now();
      const offset = p * TRAVEL;

      group.position.z = -p * 2.5;
      group.rotation.y = (p - 0.5) * 0.55;
      group.rotation.x = 0.14 - p * 0.06;

      for (let i = 0; i < depth.count; i += 1) {
        const z = Z_FAR + ((i * SPACING + offset) % SPAN);
        const d = (z - Z_FAR) / SPAN;
        const isAccent = i % 6 === 0;
        const r = isAccent ? C.accent.r : LERP(C.faint.r, C.bright.r, d);
        const g = isAccent ? C.accent.g : LERP(C.faint.g, C.bright.g, d);
        const b = isAccent ? C.accent.b : LERP(C.faint.b, C.bright.b, d);
        let a = Math.pow(d, 1.5) * (isAccent ? 0.95 : 0.6);
        if (isAccent) a *= 0.78 + 0.22 * Math.sin(t * 0.0011 + i * 0.9);
        const pi = i * 6;
        depth.positions[pi + 2] = z;
        depth.positions[pi + 5] = z;
        const ci = i * 8;
        for (let v = 0; v < 2; v += 1) {
          const c2 = ci + v * 4;
          depth.colors[c2] = r;
          depth.colors[c2 + 1] = g;
          depth.colors[c2 + 2] = b;
          depth.colors[c2 + 3] = Math.max(0, Math.min(1, a));
        }
      }
      depth.geo.attributes.position.needsUpdate = true;
      depth.geo.attributes.color.needsUpdate = true;

      for (let i = 0; i < VERT_COUNT; i += 1) {
        const bob = reduceMotion ? 0 : Math.sin(t * 0.0006 + i * 1.7) * 0.8;
        verticals.positions[i * 6 + 4] = verticals.heights[i] + bob;
        const isAccent = verticals.accentFlags[i];
        let a = (isAccent ? 0.5 : 0.28) * (0.3 + ((verticals.baseZ[i] - Z_FAR) / SPAN) * 0.7);
        if (isAccent) a *= 0.8 + 0.2 * Math.sin(t * 0.001 + i);
        const ci = i * 8;
        for (let v = 0; v < 2; v += 1) {
          const c2 = ci + v * 4;
          verticals.colors[c2 + 3] = Math.max(0, Math.min(1, a));
        }
      }
      verticals.geo.attributes.position.needsUpdate = true;
      verticals.geo.attributes.color.needsUpdate = true;

      camX += (mouseX * 1.1 - camX) * 0.04;
      camY += (mouseY * 0.7 - camY) * 0.04;
      camera.position.x = camX;
      camera.position.y = 8.2 + camY;
      camera.lookAt(0, 0.5, -20);

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
      [depth, longitude, verticals].forEach(({ geo, mat }) => {
        geo.dispose();
        mat.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div className="webgl-bg" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
