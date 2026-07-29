# Stella Keys — PRD v1.0

The canonical PRD lives outside this repo (product doc). See the root `README.md` for how
the current scaffold maps to it. Sections implemented in v0 of this repo:

- §6 Information Architecture — all routes scaffolded
- §7 F1 Home — done
- §7 F2 Buy — done (filters: project, beds, min/max, type; extend per PRD)
- §7 F3 Rent — done (adds rental_period filter)
- §7 F4 Project hub — SSG with `generateStaticParams`, live "units available" grid
- §7 F5 LDP — WhatsApp CTA + JSON-LD `RealEstateListing` / `LodgingBusiness`
- §7 F6 List Your Unit — 6-step form; OTP + photo upload seams present
- §7 F7 Admin — approval queue skeleton (RLS-gated)
- §7 F8 Lead capture — inbound `/api/leads` for Evolution API webhook + `wa.me` click event
- §7 F9 Search — deferred
- §8 SEO — sitemap + robots + hreflang via next-intl; schema.org present on hub + LDP

Everything else (Evolution API wiring, Mapbox, hCaptcha, admin actions, virtual tours, etc.) is
sequenced per PRD §12 milestones.
