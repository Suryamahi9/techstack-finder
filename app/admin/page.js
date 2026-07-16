'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-fg">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-faint">{sub}</p>}
    </div>
  );
}

function Badge({ children, color = 'accent' }) {
  const colors = {
    accent: 'bg-accent/15 text-accent',
    blue: 'bg-blue-500/15 text-blue-400',
    red: 'bg-red-500/15 text-red-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
    green: 'bg-green-500/15 text-green-400',
    muted: 'bg-white/5 text-muted',
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[color]}`}>{children}</span>;
}

function TierBadge({ tier }) {
  const map = { free: 'muted', pro: 'accent', enterprise: 'blue' };
  return <Badge color={map[tier] || 'muted'}>{tier}</Badge>;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setError(data.error);
    } catch { setError('Failed to load stats.'); }
    setLoading(false);
  }

  async function loadUsers(s = '') {
    const params = new URLSearchParams({ limit: '50' });
    if (s) params.set('search', s);
    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {}
  }

  async function updateUser(userId, updates) {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...data.user } : u));
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><p className="text-sm text-muted">Loading admin panel...</p></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><p className="text-sm text-red-400">{error}</p></div>;
  if (!stats) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><p className="text-sm text-red-400">Access denied.</p></div>;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-fg">Admin Dashboard</h1>
          <p className="mt-1 text-xs text-muted">Signed in as {session?.user?.email}</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Users" value={stats.users.total} sub={`${stats.users.new30d} new (30d)`} />
          <StatCard label="Total Scans" value={stats.scans.total} sub={`${stats.scans.thisMonth} this month`} />
          <StatCard label="Active Monitors" value={stats.engagement.monitors} />
          <StatCard label="Active API Keys" value={stats.engagement.apiKeys} />
        </div>

        {stats.users.byTier && Object.keys(stats.users.byTier).length > 0 && (
          <div className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-3 text-sm font-semibold text-fg">Users by Tier</h2>
            <div className="flex gap-4">
              {Object.entries(stats.users.byTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center gap-2">
                  <TierBadge tier={tier} />
                  <span className="text-sm font-medium text-fg">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.topDomains?.length > 0 && (
          <div className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-3 text-sm font-semibold text-fg">Most Scanned Domains</h2>
            <div className="flex flex-col gap-1.5">
              {stats.topDomains.map((d, i) => (
                <div key={d.domain} className="flex items-center justify-between text-xs">
                  <span className="text-fg/80 font-mono">{i + 1}. {d.domain}</span>
                  <span className="text-muted">{d.count} scans</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="mb-3 text-sm font-semibold text-fg">User Management</h2>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); loadUsers(e.target.value); }}
            placeholder="Search by name or email..."
            className="mb-3 w-full max-w-md rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-fg outline-none focus:border-accent/30 placeholder:text-faint"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 font-medium text-muted">User</th>
                <th className="px-4 py-3 font-medium text-muted">Tier</th>
                <th className="px-4 py-3 font-medium text-muted">Role</th>
                <th className="px-4 py-3 font-medium text-muted">Scans</th>
                <th className="px-4 py-3 font-medium text-muted">Joined</th>
                <th className="px-4 py-3 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-fg">{u.name || 'Unnamed'}</div>
                    <div className="text-faint">{u.email}</div>
                  </td>
                  <td className="px-4 py-3"><TierBadge tier={u.tier} /></td>
                  <td className="px-4 py-3"><Badge color={u.role === 'admin' ? 'red' : 'muted'}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-fg/80">{u.scansThisMonth}</td>
                  <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {u.tier !== 'pro' && (
                        <button onClick={() => updateUser(u.id, { tier: 'pro' })} className="rounded border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] text-accent hover:bg-accent/20">Set Pro</button>
                      )}
                      {u.tier !== 'enterprise' && (
                        <button onClick={() => updateUser(u.id, { tier: 'enterprise' })} className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400 hover:bg-blue-500/20">Set Enterprise</button>
                      )}
                      {u.tier !== 'free' && (
                        <button onClick={() => updateUser(u.id, { tier: 'free' })} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted hover:bg-white/10">Set Free</button>
                      )}
                      {u.role !== 'admin' && (
                        <button onClick={() => updateUser(u.id, { role: 'admin' })} className="rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-500/20">Make Admin</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
