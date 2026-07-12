'use client';
import { useState } from 'react';

export default function WebhookPanel({ data }) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [platform, setPlatform] = useState('slack');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const send = async () => {
    if (!webhookUrl.trim() || !data) return;
    setSending(true);
    setResult(null);

    const techs = (data.categories || []).flatMap((c) => c.technologies.map((t) => t.name));
    const summary = `Scanned ${data.site?.domain}: ${data.summary?.total || 0} technologies detected (${data.summary?.frontend || 0} FE, ${data.summary?.backend || 0} BE, ${data.summary?.infra || 0} Infra). Top techs: ${techs.slice(0, 8).join(', ')}`;

    let payload;
    if (platform === 'slack') {
      payload = { text: summary, blocks: [{ type: 'section', text: { type: 'mrkdwn', text: `*TechStack Finder Scan: ${data.site?.domain}*\n${summary}\n\n<${window.location.origin}/results?site=${encodeURIComponent(data.site?.url)}|View Full Report>` } }] };
    } else if (platform === 'discord') {
      payload = { content: summary, embeds: [{ title: `TechStack Scan: ${data.site?.domain}`, description: summary, color: 0x8b5cf6, url: `${window.location.origin}/results?site=${encodeURIComponent(data.site?.url)}` }] };
    } else {
      payload = { event: 'scan_complete', domain: data.site?.domain, url: data.site?.url, total: data.summary?.total, techs, summary };
    }

    try {
      await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setResult({ ok: true, message: 'Sent successfully!' });
    } catch (e) {
      setResult({ ok: false, message: 'Failed to send — check the webhook URL.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Send to Webhook</h3>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          {['slack', 'discord', 'generic'].map((p) => (
            <button key={p} onClick={() => setPlatform(p)} className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${platform === p ? 'bg-accent/10 text-accent border border-accent/30' : 'text-faint border border-transparent'}`}>
              {p === 'generic' ? 'Generic' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <input
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder={platform === 'slack' ? 'https://hooks.slack.com/services/...' : platform === 'discord' ? 'https://discord.com/api/webhooks/...' : 'https://your-webhook-url.com/...'}
          className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <button onClick={send} disabled={sending || !webhookUrl.trim()} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:brightness-110 disabled:opacity-40">
          {sending ? 'Sending...' : 'Send Scan Results'}
        </button>
        {result && (
          <p className={`text-xs ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>{result.message}</p>
        )}
      </div>
    </div>
  );
}
