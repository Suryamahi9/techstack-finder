'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setMsg('Passwords do not match.'); return; }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Password updated! Redirecting to login...');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        setMsg(data.error || 'Failed to reset password.');
      }
    } catch {
      setMsg('Network error.');
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-400">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="mt-3 inline-block text-xs text-accent hover:underline">Request a new link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 8 chars)"
        required
        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/20 placeholder:text-faint"
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        required
        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/20 placeholder:text-faint"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-black hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {msg && <p className="text-center text-xs text-muted">{msg}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-fg">Reset Password</h1>
          <p className="mt-2 text-sm text-muted">Enter your new password below.</p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-muted">Loading...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
