import { Router } from 'express';

const router = Router();

// POST /api/contact — backs the "What should become possible?" form.
// Called via fetch() from client/index.html's #contactForm handler.
router.post('/', (req, res) => {
  const { name, email, type, budget, challenge } = req.body || {};

  if (!name || !email || !challenge) {
    return res.status(400).json({ ok: false, error: 'name, email and challenge are required.' });
  }

  // TODO: replace this with real delivery once you're ready — e.g. send via
  // nodemailer/Resend/SendGrid, post to a CRM webhook, or write to a
  // database. For now the submission is just logged so you can confirm it
  // reached the backend.
  console.log('[contact] new submission', { name, email, type, budget, challenge, receivedAt: new Date().toISOString() });

  res.status(201).json({ ok: true, message: 'Thanks — we got it. We will get back to you shortly.' });
});

export default router;
