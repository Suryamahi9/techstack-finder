'use client';

import { useState } from 'react';

const SUBJECTS = [
  'General enquiry',
  'Sales',
  'Data licensing',
  'Partnerships',
  'Support',
  'Billing',
];

const inputCls =
  'w-full border border-border bg-bg px-4 py-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none';

// Contact form that posts to /api/contact and shows inline success / error state.

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, text: data.message });
        setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
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
          <label htmlFor="contact-name" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            Name
          </label>
          <input
            id="contact-name"
            className={inputCls}
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            Email
          </label>
          <input
            id="contact-email"
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
        <label htmlFor="contact-subject" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          Subject
        </label>
        <select
          id="contact-subject"
          className={inputCls}
          value={form.subject}
          onChange={(e) => update('subject', e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          className={inputCls}
          placeholder="Tell us what you are trying to do — a scan workflow, data licensing, a partnership…"
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
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
          {busy ? 'Sending…' : 'Send message'}
        </button>
        {status && (
          <p className={`text-xs ${status.ok ? 'text-accent' : 'text-tag-red-fg'}`}>{status.text}</p>
        )}
      </div>
    </form>
  );
}
