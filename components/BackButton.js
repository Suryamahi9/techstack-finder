'use client';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted transition-all duration-300 hover:border-accent/20 hover:text-fg active:scale-95"
      aria-label="Back to home"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
