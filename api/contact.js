import { sendContactEmail } from '../shared/contactEmail.js';

// Vercel serverless function — this is what actually runs in production.
// Vercel deploys client/dist as static files and treats every file under
// /api as its own function (filesystem routing: this file → POST /api/contact).
// It does NOT run server/src/index.js's Express app — that's only for local
// dev (npm run dev) and a persistent-Node deployment (npm start) elsewhere.
//
// Env vars (RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL) must be set
// in the Vercel project's Settings → Environment Variables. server/.env is a
// local-only file and is never uploaded to Vercel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const { name, email, type, budget, challenge } = req.body || {};

  if (!name || !email || !challenge) {
    return res.status(400).json({ ok: false, error: 'name, email and challenge are required.' });
  }

  console.log('[contact] new submission', { name, email, type, budget, challenge, receivedAt: new Date().toISOString() });

  try {
    await sendContactEmail({ name, email, type, budget, challenge });
    return res.status(201).json({ ok: true, message: 'Thanks — we got it. We will get back to you shortly.' });
  } catch (err) {
    console.error('[contact] failed to send email', err);
    return res.status(502).json({ ok: false, error: 'We could not send that just now — please try again shortly.' });
  }
}
