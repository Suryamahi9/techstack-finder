'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(data.message || data.error || 'Check your email.');
    } catch {
      setMsg('Network error.');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-fg">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted">Enter your email and we&apos;ll send a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/20 placeholder:text-faint"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-black hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {msg && <p className="text-center text-xs text-muted">{msg}</p>}
          <Link href="/login" className="text-center text-xs text-accent hover:underline">
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
