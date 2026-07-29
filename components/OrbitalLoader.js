'use client';

export default function OrbitalLoader({ size = 'md', inline = false }) {
  const cls = 'loader-ring' + (size !== 'md' ? ' loader-ring-' + size : '');
  if (inline) {
    return (
      <span className="inline-flex items-center justify-center align-middle">
        <span className="morph-dots">
          <span className="morph-dot" />
          <span className="morph-dot" />
          <span className="morph-dot" />
          <span className="morph-dot" />
        </span>
      </span>
    );
  }
  return (
    <span className={cls} role="status" aria-label="Loading">
      <span className="loader-orbit" />
      <span className="loader-orbit" />
      <span className="loader-orbit" />
      <span className="loader-core" />
    </span>
  );
}
