import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// POST /api/contact — backs the "What should become possible?" form.
// Called via fetch() from client/index.html's #contactForm handler.
router.post('/', async (req, res) => {
  const { name, email, type, budget, challenge } = req.body || {};

  if (!name || !email || !challenge) {
    return res.status(400).json({ ok: false, error: 'name, email and challenge are required.' });
  }

  console.log('[contact] new submission', { name, email, type, budget, challenge, receivedAt: new Date().toISOString() });

  if (!resend) {
    // No RESEND_API_KEY configured (e.g. local dev without server/.env set
    // up yet) — log-only, same as before, so the form still "works".
    console.warn('[contact] RESEND_API_KEY not set — submission logged but no email was sent.');
    return res.status(201).json({ ok: true, message: 'Thanks — we got it. We will get back to you shortly.' });
  }

  try {
    const { error } = await resend.emails.send({
      from: `thesimple.design <${process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: process.env.CONTACT_TO_EMAIL ,
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

    // resend.emails.send() resolves (doesn't throw) on API-level failures
    // like the sandbox "unverified domain" recipient restriction — it just
    // returns { error }. Without this check those failures were silently
    // reported to the client as success.
    if (error) {
      console.error('[contact] Resend rejected the email', error);
      return res.status(502).json({ ok: false, error: 'We could not send that just now — please try again shortly.' });
    }

    res.status(201).json({ ok: true, message: 'Thanks — we got it. We will get back to you shortly.' });
  } catch (err) {
    console.error('[contact] failed to send email', err);
    res.status(502).json({ ok: false, error: 'We could not send that just now — please try again shortly.' });
  }
});

export default router;
