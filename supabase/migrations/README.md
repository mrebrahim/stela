# Supabase migrations

Source of truth for schema. Applied to project `pxbzovfabgpxddlibwhi` (org `stela`, region `eu-north-1`).

Applied in this order:
1. `01_core_enums_and_extensions.sql`
2. `02_core_tables.sql`  — projects, unit_types, owners, admin_users, listings, listing_photos, leads, reports, audit_log, triggers
3. `03_rls_policies.sql` — `is_admin()`, `is_full_admin()`, per-table RLS
4. `04_storage_buckets.sql` — `listings` + `projects` buckets and storage policies
5. `05_seed_projects.sql` — the five Stella resorts
6. `06_seed_sample_listings.sql` — 10 published sample listings (2 per project)

Migrations 02–06 were applied via the Supabase MCP `apply_migration` tool; only file #1 is committed
as a starter. Regenerate the rest with:

```bash
supabase db dump --project-ref pxbzovfabgpxddlibwhi --schema public --schema-only > 02_snapshot.sql
```

To bootstrap the schema on a fresh project, run migrations top-to-bottom in the Supabase SQL editor
or via `supabase db push` with the CLI.
