'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="mb-4 text-sm font-semibold text-fg">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-fg outline-none transition-colors focus:border-accent/30 focus:ring-1 focus:ring-accent/20 placeholder:text-faint"
      />
    </div>
  );
}

function Button({ children, variant = 'default', loading, ...props }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50';
  const variants = {
    default: 'border border-white/10 bg-white/5 text-fg hover:bg-white/10',
    accent: 'bg-accent text-black hover:brightness-110',
    danger: 'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  };
  return (
    <button {...props} disabled={loading} className={`${base} ${variants[variant]}`}>
      {loading ? 'Saving...' : children}
    </button>
  );
}

function UpgradeButton({ plan }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {}
    setLoading(false);
  }

  return (
    <Button variant="accent" onClick={handleUpgrade} loading={loading}>
      Upgrade to {plan === 'pro' ? 'Pro ($19/mo)' : 'Enterprise ($79/mo)'}
    </Button>
  );
}

function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {}
    setLoading(false);
  }

  return (
    <Button onClick={handlePortal} loading={loading}>Manage Billing</Button>
  );
}

const TIER_INFO = {
  free: { name: 'Free', scans: '50/month', rate: '10/min', color: 'text-muted' },
  pro: { name: 'Pro', scans: '2,000/month', rate: '100/min', color: 'text-accent' },
  enterprise: { name: 'Enterprise', scans: '20,000/month', rate: '500/min', color: 'text-purple-400' },
};

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const tier = session?.user?.tier || 'free';
  const tierInfo = TIER_INFO[tier] || TIER_INFO.free;

  async function saveProfile() {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Profile updated.');
        await update();
      } else {
        setMsg(data.error || 'Failed to update.');
      }
    } catch {
      setMsg('Network error.');
    }
    setSaving(false);
  }

  async function changePassword() {
    if (newPw.length < 8) { setPwMsg('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match.'); return; }
    setPwSaving(true);
    setPwMsg('');
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (data.success) {
        setPwMsg('Password changed.');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        setPwMsg(data.error || 'Failed to change password.');
      }
    } catch {
      setPwMsg('Network error.');
    }
    setPwSaving(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-8 text-xl font-bold text-fg">Account Settings</h1>

        <div className="flex flex-col gap-5">
          <Section title="Subscription">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fg">
                  Current plan: <span className={`font-semibold ${tierInfo.color}`}>{tierInfo.name}</span>
                </p>
                <p className="mt-1 text-xs text-muted">Scans: {tierInfo.scans} &middot; Rate limit: {tierInfo.rate}</p>
              </div>
              <div className="flex gap-2">
                {tier === 'free' ? (
                  <Link href="/pricing" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:brightness-110">Upgrade</Link>
                ) : (
                  <ManageBillingButton />
                )}
              </div>
            </div>
          </Section>

          <Section title="Profile">
            <div className="flex flex-col gap-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <Input label="Email" value={email} disabled className="opacity-50 cursor-not-allowed" />
              <div className="flex items-center gap-3">
                <Button variant="accent" onClick={saveProfile} loading={saving}>Save Changes</Button>
                {msg && <span className="text-xs text-muted">{msg}</span>}
              </div>
            </div>
          </Section>

          <Section title="Change Password">
            <div className="flex flex-col gap-3">
              <Input label="Current password" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              <Input label="New password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              <Input label="Confirm new password" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              <div className="flex items-center gap-3">
                <Button onClick={changePassword} loading={pwSaving}>Change Password</Button>
                {pwMsg && <span className="text-xs text-muted">{pwMsg}</span>}
              </div>
            </div>
          </Section>

          <Section title="Danger Zone">
            {!showDelete ? (
              <Button variant="danger" onClick={() => setShowDelete(true)}>Delete Account</Button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-red-400/80">Type <span className="font-mono font-semibold text-red-400">DELETE</span> to confirm account deletion. This is irreversible.</p>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full max-w-xs rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-fg outline-none focus:border-red-500/40 placeholder:text-faint"
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    disabled={deleteConfirm !== 'DELETE'}
                    onClick={async () => {
                      await fetch('/api/user/delete', { method: 'DELETE' });
                      window.location.href = '/';
                    }}
                  >
                    Permanently Delete
                  </Button>
                  <Button onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>Cancel</Button>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
