# Vyala

Clinic management SaaS for Greece and Cyprus. See README.md for setup.

Key facts for agents:
- Next.js 16 App Router, React 19, Tailwind v4 (@theme in src/app/globals.css).
- Auth: Clerk. Data: MongoDB Atlas via the raw driver (src/lib/mongo.ts, server-only).
  Patient documents live in GridFS, streamed back through /c/[slug]/documents/[id].
- Multi-tenant by path: /c/[slug]. requireClinic() in src/lib/tenancy.ts resolves the
  clinic plus the caller's membership, and links members added by email on first visit.
  EVERY query must be scoped by clinicId. There is no RLS to fall back on.
- Reads live in src/lib/queries.ts, writes are server actions in src/lib/actions.ts.
- /demo is a deliberate public read-only showroom (src/lib/demo.ts). It resolves only the
  clinic flagged isDemo:true and must never gain a write path.
- i18n: hand-rolled dictionaries. src/lib/i18n.ts for the app, src/lib/landing-copy.ts and
  src/lib/legal-*.ts for marketing. English is the default; Greek lives under /el and in a
  vyala_locale cookie.
- House style for copy: plain human sentences, no em dashes anywhere in user-facing text.
- Placeholder or missing keys keep the app in preview mode via src/lib/config.ts, which
  gates Clerk in both src/proxy.ts and src/app/layout.tsx.
- npm run seed rebuilds the demo practice. npm run record re-records public/demo.mp4.
