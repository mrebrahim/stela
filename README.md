# Stella Keys

Bilingual (AR RTL / EN LTR) real-estate portal for Stella-branded resort projects in Egypt.
Built to [PRD v1.0](./docs/PRD.md).

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · next-intl · Supabase (Postgres + Auth + Storage) · deployed on Vercel.

## Quick start (local)

```bash
pnpm install
cp .env.example .env.local     # then paste in SUPABASE_SERVICE_ROLE_KEY
pnpm dev
```

App runs at `http://localhost:3000` and redirects to `/ar`.

## Environment variables

| Variable | Where | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | ✅ (prefilled) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | ✅ (prefilled) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | ✅ — Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SITE_URL` | For sitemap + JSON-LD | ✅ (set to prod URL) |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GTM_ID` | Analytics | Optional |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Map view (not yet wired) | Optional |
| `NEXT_PUBLIC_HCAPTCHA_SITEKEY`, `HCAPTCHA_SECRET` | Public form protection (not yet wired) | Optional |

## Deploying to Vercel

1. Push this branch to GitHub — this repo is `mrebrahim/stela`; production branch is `main`.
2. Sign in at [vercel.com](https://vercel.com) → **Add New… → Project** → import `mrebrahim/stela`.
3. Framework preset auto-detects **Next.js**. Root directory: `/`. Build command: default (`next build`). Output: default.
4. **Environment Variables** — paste every row from `.env.example` for the **Production**, **Preview**, and **Development** environments:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://pxbzovfabgpxddlibwhi.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_K0UfYnZdQra1thgkg5zBpg_XLdxZhG8`
   - `SUPABASE_SERVICE_ROLE_KEY` = (paste from Supabase dashboard)
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-vercel-domain>` (update after first deploy if custom domain differs)
5. Click **Deploy**. First build takes ~90s.
6. After deploy: add your custom domain in **Settings → Domains**. Vercel auto-issues an SSL cert.

Every push to `main` deploys to production; every PR gets a preview URL.

### Supabase already provisioned

The Supabase project `stela` (ref `pxbzovfabgpxddlibwhi`, region `eu-north-1`) has schema, RLS,
storage buckets and seed data applied. See `supabase/migrations/` for the source-of-truth SQL.

## Contact / lead capture (current)

WhatsApp is deferred. The Listing Detail Page shows a **Contact us** button that opens an in-app
inquiry form. Submissions land in the `leads` table via `POST /api/leads`. Admin sees them in the
approval queue view.

To turn WhatsApp back on later: reintroduce a WhatsApp CTA component (git history has the previous
implementation) and configure Evolution API in the env.

## Project layout

```
src/
  app/
    [locale]/
      layout.tsx          — RTL/LTR html dir, next-intl provider
      page.tsx            — Home: hero + 3 CTAs + projects grid
      buy/page.tsx        — Buy grid with filters (URL-synced)
      rent/page.tsx       — Rent grid
      projects/[slug]/    — Project hub (SSG, one per project × locale)
      listings/[slug]/    — Listing Detail Page (ISR)
      list-your-unit/     — Owner submission form (6 steps)
      admin/              — Approval queue skeleton (RLS-gated)
    api/
      leads/route.ts      — POST inbound lead (in-app form + import)
      listings/route.ts   — POST owner submission (server-side, service-role)
  components/             — UI primitives + feature components
  lib/
    supabase/{client,server,admin,public}.ts
    types.ts              — hand-authored DB types
i18n/
  request.ts              — next-intl config
  messages/{ar,en}.json   — copy
supabase/
  migrations/             — SQL source of truth (00–06)
```

## What's built vs the PRD

Solid **foundation** for the 10-12 week MVP. Concretely shipped:

- ✅ Full DB schema, RLS, storage buckets, seed of 5 Stella projects + 10 sample listings
- ✅ AR/EN routing with RTL flip
- ✅ Home, Buy grid, Rent grid, Project hub (SSG), LDP (ISR), List-Your-Unit (6 steps), Admin queue — all wired to live Supabase data
- ✅ In-app contact form → `POST /api/leads`
- ✅ Owner submission API (server-side, no RLS bypass in the browser)
- ✅ Sitemap + robots.txt + hreflang + schema.org JSON-LD on hub + LDP
- ✅ Analytics event hooks (client)

Deferred (per PRD §5 out-of-scope + §12 milestones):
- WhatsApp OTP + Evolution API integration
- Mapbox map view (toggle stubbed)
- hCaptcha on public forms
- Admin actions beyond viewing the queue (approve/reject UI)
- Virtual tours / drone reel library
- Payments / featured-listing purchases
