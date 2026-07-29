# Stella Keys

Bilingual (AR RTL / EN LTR) real-estate portal for Stella-branded resort projects in Egypt.
Built to the [Product Requirements Document v1.0](./docs/PRD.md).

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · next-intl · Supabase (Postgres + Auth + Storage) · deployed on Vercel.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in service-role key
pnpm dev
```

App runs at `http://localhost:3000` and redirects to `/ar`.

## Environment

The Supabase project `stela` (ref `pxbzovfabgpxddlibwhi`, region `eu-north-1`) is already provisioned
with the schema, RLS policies, storage buckets and seed data. See `supabase/migrations/`.

Required env for local dev:
- `NEXT_PUBLIC_SUPABASE_URL` — pre-filled in `.env.example`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — pre-filled
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Project Settings → API

## Deploying to Vercel

1. Push this branch to GitHub (already the case).
2. In Vercel, **Add New Project** → import `mrebrahim/stela`.
3. Framework preset: **Next.js**. Root directory: `/`.
4. Add environment variables from `.env.example` (paste in `SUPABASE_SERVICE_ROLE_KEY`).
5. Deploy. Preview URLs work for every PR; production tracks `main`.

## Project layout

```
src/
  app/
    [locale]/
      layout.tsx          — RTL/LTR html direction, next-intl provider
      page.tsx            — Home: hero + 3 CTAs + projects grid
      buy/page.tsx        — Buy grid with filters (URL-synced)
      rent/page.tsx       — Rent grid
      projects/[slug]/    — Project hub (SSG)
      listings/[slug]/    — Listing Detail Page (ISR)
      list-your-unit/     — Owner submission form (6 steps)
      admin/              — Approval queue skeleton
    api/
      leads/route.ts      — POST inbound lead
      listings/route.ts   — POST owner submission (server-side, service role)
  components/             — UI primitives + feature components
  lib/
    supabase/{client,server,admin}.ts
    types.ts              — generated DB types
    wa.ts                 — WhatsApp helpers
  i18n/
    request.ts            — next-intl config
    messages/{ar,en}.json — copy
supabase/
  migrations/             — SQL sources of truth (00–06)
```

## What's built vs the PRD

This scaffold covers the **foundation** for the 10-12 week MVP. Concretely shipped:

- ✅ Full DB schema, RLS, storage buckets, seed of 5 Stella projects + sample listings
- ✅ AR/EN routing with RTL flip
- ✅ Home, Buy grid, Rent grid, Project hub, LDP, List-Your-Unit (6 steps), Admin queue — all wired to live Supabase data
- ✅ WhatsApp CTA (`wa.me` deep link with prefilled message)
- ✅ Owner submission API (server-side, no RLS bypass in the browser)
- ✅ Analytics event hooks (client)

Deferred to later iterations (per PRD §5 "Out of scope"):
- WhatsApp OTP (Evolution API integration — form has the seam; add the fetch when the instance is up)
- Mapbox integration (map toggle is stubbed)
- hCaptcha (form has the seam)
- SEO polish (sitemap generator is stubbed)
- Admin actions beyond viewing the queue (edit forms are minimal)
