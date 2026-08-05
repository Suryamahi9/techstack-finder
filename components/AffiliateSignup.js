'use client';

import { useState } from 'react';

const inputCls =
  'w-full border border-border bg-bg px-4 py-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none';

// Affiliate signup form that posts to /api/affiliates with inline status.

export default function AffiliateSignup() {
  const [form, setForm] = useState({ name: '', email: '', website: '', audience: '' });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, text: data.message });
        setForm({ name: '', email: '', website: '', audience: '' });
      } else {
        setStatus({ ok: false, text: data.error || 'Something went wrong. Try again.' });
      }
    } catch {
      setStatus({ ok: false, text: 'Network error — please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-border bg-bg px-6 py-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="aff-name" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            Name
          </label>
          <input
            id="aff-name"
            className={inputCls}
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div>
          <label htmlFor="aff-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            Email
          </label>
          <input
            id="aff-email"
            type="email"
            className={inputCls}
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="aff-website" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          Website or social profile
        </label>
        <input
          id="aff-website"
          className={inputCls}
          placeholder="https://your-blog.com"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          required
          minLength={4}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="aff-audience" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          Who is your audience?
        </label>
        <textarea
          id="aff-audience"
          rows={4}
          className={inputCls}
          placeholder="e.g. 20k monthly readers on web development and eCommerce marketing; most own or build Shopify stores."
          value={form.audience}
          onChange={(e) => update('audience', e.target.value)}
          required
          minLength={10}
        />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Submitting…' : 'Apply to the program'}
        </button>
        {status && (
          <p className={`text-xs ${status.ok ? 'text-accent' : 'text-tag-red-fg'}`}>{status.text}</p>
        )}
      </div>
    </form>
  );
}
