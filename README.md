# Vyala

Quiet, simple practice management for doctors in Greece and Cyprus. Patients, appointments, visit notes, documents, manual payments and invoices, in one bilingual workspace. Every practice gets its own address at `/c/<slug>`, with admin, doctor and assistant roles.

English is the default language throughout. Greek is a click away and is remembered per browser.

**Stack:** Next.js 16 (App Router, server actions) · React 19 · Tailwind v4 · Clerk for auth · MongoDB Atlas for data, with patient documents in GridFS.

## Running it

1. Copy `.env.example` to `.env.local` and fill in:
   - **Clerk** publishable and secret key from [dashboard.clerk.com](https://dashboard.clerk.com)
   - **MongoDB Atlas** connection string (Connect → Drivers → Node.js)
2. `npm install`
3. `npm run seed` to create the sample practice (optional but recommended)
4. `npm run dev` and open [http://localhost:3000](http://localhost:3000)

Until real keys are present the app runs in a safe preview mode: the marketing pages work fully, and the signed-in areas show setup instructions instead of failing.

## What is where

| Route | What it is |
|---|---|
| `/` and `/el` | Marketing site, English default, Greek at `/el` |
| `/demo` | Public read-only showroom of the sample practice, no sign-in |
| `/contact`, `/el/contact` | Demo request form, writes to the `leads` collection |
| `/privacy`, `/terms`, `/gdpr` | Legal documents, both languages |
| `/app` | Picks your practice, or sends you to onboarding |
| `/c/[slug]` | Practice dashboard: today, patient count, revenue, unpaid invoices |
| `/c/[slug]/appointments` | Day view, book in seconds, complete or cancel in one click |
| `/c/[slug]/patients` | Searchable list, then tabs for overview, visits, documents, payments |
| `/c/[slug]/patients/[id]/print` | Printable full patient history |
| `/c/[slug]/payments` | Manual log: cash, card, bank transfer, other |
| `/c/[slug]/invoices` | Auto-numbered invoices, mark paid, printable |
| `/c/[slug]/team` | Practice details and member management, admin only |

## The sample practice

`npm run seed` builds a practice called **Vyala Demo Practice** at `/c/demo`, with 48 patients, five weeks of appointments either side of today, visit notes on everything already seen, payments across all four methods, and invoices in mixed states. Re-running it wipes and rebuilds only that practice and never touches real data.

It is browsable without signing in at `/demo`, which is what the landing page links to and what the tour video was recorded from. That route resolves only the practice flagged `isDemo: true` and cannot write anything.

To sign in as the demo doctor, either sign up with `demo@vyala.app` (the seeded admin, linked automatically on first sign-in), or attach it to an account you already have:

```
npm run seed -- user_yourClerkUserId
```

## How the team model works

The person who creates a practice becomes its admin. From Team and Settings they add doctors and assistants **by email address**. When that person signs up or signs in with the same email, they are attached to the practice automatically, so there are no invitation emails to chase. Someone who belongs to more than one practice picks between them at `/app`.

## The tour video

`public/demo.mp4` is a real 20 second screen recording of the running app, not a mockup. To re-record it after a UI change, start the dev server with the sample practice seeded and run `npm run record`. It drives a real browser through the product with Playwright, then transcodes with ffmpeg and grabs a poster frame.

## Deploying

Push to GitHub, import on Vercel, add the same environment variables, deploy. Add your production domain to Clerk, and allow Vercel's egress in the Atlas network access list. If your domain is not `vyala.app`, update `metadataBase` in `src/app/layout.tsx` along with `src/app/sitemap.ts` and `src/app/robots.ts`.
