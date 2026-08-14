import { Resend } from 'resend';

// Shared by both deployment shapes:
//  - server/src/routes/contact.js   → the persistent Express server (local dev, npm start)
//  - api/contact.js                 → the Vercel serverless function (production on Vercel)
// Keeping the Resend call in one place means the two can't drift apart.

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Throws on failure (missing config is not a failure — it's treated as
// "log-only" so the form still works without Resend set up). Callers decide
// how to turn a thrown error into an HTTP response.
export async function sendContactEmail({ name, email, type, budget, challenge }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[contact] RESEND_API_KEY not set — submission logged but no email was sent.');
    return { sent: false };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `thesimple.design <${process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'}>`,
    to: process.env.CONTACT_TO_EMAIL,
    // TODO: temporary CC for review — requested to be removed later.
    cc: 'pooja@thesimple.design',
    replyTo: email,
    subject: `New project inquiry — ${name}${type ? ` (${type})` : ''}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Project type:</strong> ${escapeHtml(type || 'Not specified')}</p>
      <p><strong>Working investment range:</strong> ${escapeHtml(budget || 'Not specified')}</p>
      <p><strong>The difficult part:</strong></p>
      <p>${escapeHtml(challenge).replace(/\n/g, '<br/>')}</p>
    `,
  });

  // resend.emails.send() resolves (doesn't throw) on API-level failures like
  // the sandbox "unverified domain" recipient restriction — it just returns
  // { error }. Without this check those failures were silently reported to
  // the client as success.
  if (error) {
    console.error('[contact] Resend rejected the email', error);
    throw new Error('Resend rejected the email');
  }

  return { sent: true };
}
