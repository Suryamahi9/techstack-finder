import { prisma } from './prisma';
import { sendEmail } from './email';

export async function checkAndNotifyStackChange(monitorId, userId, oldTechs, newTechs) {
  const added = newTechs.filter(t => !oldTechs.some(o => o.name === t.name));
  const removed = oldTechs.filter(o => !newTechs.some(t => t.name === o.name));

  if (added.length === 0 && removed.length === 0) return { notified: false, reason: 'no_changes' };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  } catch { return { notified: false, reason: 'db_error' }; }

  if (!user?.email) return { notified: false, reason: 'no_email' };

  const domain = newTechs[0]?.domain || 'Unknown';

  const addedList = added.map(t => `+ ${t.name}`).join('\n');
  const removedList = removed.map(t => `- ${t.name}`).join('\n');

  const subject = `Stack change detected on ${domain}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#d97706;">Stack Change Detected</h2>
      <p>Hi ${user.name || 'there'},</p>
      <p>We detected changes in the technology stack of <strong>${domain}</strong>:</p>
      ${added.length > 0 ? `
        <div style="background:#0a1a0a;border:1px solid #22c55e;border-radius:8px;padding:12px;margin:12px 0;">
          <strong style="color:#22c55e;">Added:</strong>
          <pre style="color:#ccc;margin:4px 0 0;">${addedList}</pre>
        </div>
      ` : ''}
      ${removed.length > 0 ? `
        <div style="background:#1a0a0a;border:1px solid #ef4444;border-radius:8px;padding:12px;margin:12px 0;">
          <strong style="color:#ef4444;">Removed:</strong>
          <pre style="color:#ccc;margin:4px 0 0;">${removedList}</pre>
        </div>
      ` : ''}
      <p style="margin-top:16px;">
        <a href="https://techstack-finder.vercel.app/results?site=${encodeURIComponent(domain)}"
           style="background:#d97706;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Full Report
        </a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:24px;">TechStack Finder Monitor</p>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject, html });
    return { notified: true, added: added.length, removed: removed.length };
  } catch {
    return { notified: false, reason: 'email_failed' };
  }
}
