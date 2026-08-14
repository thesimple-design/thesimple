import { Router } from 'express';
import { sendContactEmail } from '../../../shared/contactEmail.js';

const router = Router();

// POST /api/contact — backs the "What should become possible?" form.
// Called via fetch() from client/index.html's #contactForm handler.
//
// This is the local-dev / persistent-server path (npm run dev, npm start).
// The production-on-Vercel path is api/contact.js at the repo root, which
// shares the same send logic via shared/contactEmail.js.
router.post('/', async (req, res) => {
  const { name, email, type, budget, challenge } = req.body || {};

  if (!name || !email || !challenge) {
    return res.status(400).json({ ok: false, error: 'name, email and challenge are required.' });
  }

  console.log('[contact] new submission', { name, email, type, budget, challenge, receivedAt: new Date().toISOString() });

  try {
    await sendContactEmail({ name, email, type, budget, challenge });
    res.status(201).json({ ok: true, message: 'Thanks — we got it. We will get back to you shortly.' });
  } catch (err) {
    console.error('[contact] failed to send email', err);
    res.status(502).json({ ok: false, error: 'We could not send that just now — please try again shortly.' });
  }
});

export default router;
