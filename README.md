# thesimple — website + backend

The site is still one plain HTML/CSS/JS file — nothing was rewritten into
components. This just adds a dev server in front of it and a small Node API
behind it, so click handlers (like the contact form) can talk to a real
backend instead of only `mailto:`.

## Structure

```
client/            the website, unchanged except the contact form's submit handler
  index.html       your original file, moved here as-is
  vite.config.js   dev server + build config (no framework, no JSX)
server/            the backend
  src/app.js       express app: middleware + routes
  src/routes/      one file per API area (contact.js so far)
  src/index.js     starts the server
```

## Run it locally

```bash
npm install          # installs both client and server (npm workspaces)
npm run dev           # runs Vite (client) and Express (server) together
```

- Site: http://localhost:5173
- API health check: http://localhost:3001/api/health

While `npm run dev` is running, the client's `fetch('/api/...')` calls are
proxied to the API automatically (see `client/vite.config.js`), so there's no
CORS setup to think about locally.

Open the contact form ("What should become possible?") and submit it — it
POSTs to `POST /api/contact`, which validates the payload and emails it via
[Resend](https://resend.com) (see `server/src/routes/contact.js`). To enable
sending:

1. Create a Resend account and API key.
2. In `server/.env`, set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (must be on a
   domain verified in Resend — use `onboarding@resend.dev` to test before
   you've verified your own domain), and `CONTACT_TO_EMAIL` (where
   submissions should land).

Without `RESEND_API_KEY` set, submissions are still validated and logged
server-side but no email is sent — handy for local dev without Resend set up.

## Adding another backend-connected button

1. Add a route file under `server/src/routes/`, mount it in `server/src/app.js`.
2. In `client/index.html`, find the element's existing `.onclick = ...`
   handler and make it `async`, `fetch('/api/your-route', ...)` inside, same
   pattern as the contact form.

No new tooling needed per button — same request/response loop every time.

## Production

```bash
npm run build     # builds client/dist
npm start          # express serves client/dist AND the /api routes on one port
```

That's one deployable Node process — point PORT/CLIENT_ORIGIN via
`server/.env`.

## Deploying to Vercel

Vercel doesn't run `server/`'s persistent Express process (`app.listen()`
never gets invoked there) — it builds `client/dist` as static files and runs
anything under `/api` as its own serverless function. `api/contact.js` is
that function; it shares its Resend logic with `server/src/routes/contact.js`
via `shared/contactEmail.js` so the two can't drift apart. `vercel.json` at
the repo root tells Vercel how to build the monorepo (`npm run build` →
publish `client/dist`).

**`server/.env` is never uploaded to Vercel** (it's git-ignored, and Vercel
doesn't run that process anyway). Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`,
and `CONTACT_TO_EMAIL` in the Vercel project's **Settings → Environment
Variables** instead — that's what `api/contact.js` actually reads in
production. Without them, `/api/contact` still 200s (logged, no email sent)
so the form doesn't fall back to `mailto:`.

## Node vs Vite vs React — what's actually needed

- **Node.js**: required. It's the backend — nothing else here does that job.
- **Vite**: optional but worth keeping. Against a static HTML file it's just
  a fast dev server (instant reload) and a build step (minify, cache-bust
  assets). It doesn't force any component model or rewrite your markup —
  your file works in it unchanged, which is why it's wired in here.
- **React**: not required, and not added. Rewriting this page into React
  components would be exactly the time sink you wanted to avoid, for a
  page that already updates the DOM directly and works. If you later want
  one genuinely stateful/complex widget (a dashboard, a multi-step wizard),
  you can drop React into *just that one element* via Vite without touching
  anything else — but that's a "later, if needed" call, not a default.
- **Tailwind**: not added, since the page already ships a complete hand-written
  CSS system. If a future new section is faster to build with utility
  classes, `npm install -D tailwindcss -w client` slots in without disturbing
  the existing CSS.

## Git / GitHub

This folder is a git repo (`git init` was run) but nothing has been committed
yet — that's left for you:

```bash
git add -A
git commit -m "Base project: Vite client + Express API"
git remote add origin <your-repo-url>
git push -u origin main
```
