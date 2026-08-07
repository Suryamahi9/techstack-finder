'use client';
import { useState, useEffect } from 'react';

/* Global aurora orbs layer (fixed, z-index -1) that gives frosted-glass cards
   colored light to blur. Hidden on the homepage: the scroll-scrubbed film is
   the background there and the aurora would only flash through while frames
   load. */
export default function AuroraBackground() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(window.location.pathname === '/');
  }, []);

  if (hidden) return null;
  return <div className="aurora" />;
}
