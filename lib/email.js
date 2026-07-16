import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'TechStack Finder <noreply@techstackfinder.com>';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function sendWelcomeEmail(to, name) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to TechStack Finder',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;margin-bottom:16px;">Welcome${name ? ', ' + name : ''}!</h1>
        <p style="color:#555;line-height:1.6;">
          Your account is set up. You have <strong>50 free scans/month</strong> to start with.
        </p>
        <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#333;"><strong>Quick start:</strong></p>
          <p style="margin:8px 0 0;font-size:14px;color:#555;">
            1. Enter any website URL on the homepage<br/>
            2. Get a full tech stack breakdown in seconds<br/>
            3. Export as PDF or embed badges
          </p>
        </div>
        <p style="color:#555;line-height:1.6;">
          Need more? <a href="${APP_URL}/pricing" style="color:#4d7a00;">Upgrade to Pro</a> for 2,000 scans/month.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;">TechStack Finder — Detect any website's technology stack</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  if (!resend) return;
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;margin-bottom:16px;">Password Reset</h1>
        <p style="color:#555;line-height:1.6;">
          You requested a password reset. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#4d7a00;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#999;font-size:13px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendScanLimitEmail(to, name, tier, scansUsed, limit) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Scan limit reached (${scansUsed}/${limit})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;margin-bottom:16px;">Scan Limit Reached</h1>
        <p style="color:#555;line-height:1.6;">
          Hi${name ? ', ' + name : ''}, you've used <strong>${scansUsed} of ${limit}</strong> scans on your <strong>${tier}</strong> plan this month.
        </p>
        <p style="color:#555;line-height:1.6;">
          Your limit resets on the 1st of next month. Need more scans now?
        </p>
        <a href="${APP_URL}/pricing" style="display:inline-block;background:#4d7a00;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Upgrade Plan
        </a>
      </div>
    `,
  });
}
