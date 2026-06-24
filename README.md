# Solidra Construction

Bilingual corporate website and back-office foundation built with Next.js App Router, TypeScript, and Tailwind CSS.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`; the root redirects to Indonesian at `/id`. English is available at `/en`, and the CMS shell is at `/back-office`.

## Quality checks

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Unit tests run by default. Database-backed tests are opt-in:

```bash
RUN_INTEGRATION=1 pnpm test:integration
pnpm test:e2e
```

Copy `.env.example` to `.env`, configure PostgreSQL, then initialize and seed it:

```bash
pnpm prisma:generate
pnpm prisma:deploy
pnpm prisma:seed
```

## Infrastructure setup

See `docs/deployment.md` for Redis, Supabase, PostgreSQL, Better Auth, and production checklist details.

Create the PostgreSQL `solidra` schema and grant the migration/runtime role ownership or `USAGE, CREATE` before deployment. The committed migration creates all application tables, enums, indexes, and constraints in this schema; it creates no application tables in `public`.

In Supabase Storage create these private buckets:

- `solidra-public`: CMS images.
- `solidra-documents`: investor PDFs.
- `solidra-cvs`: applicant files.

Only the server may receive `SUPABASE_SERVICE_ROLE_KEY`. Storage object paths are saved in PostgreSQL, and public previews/downloads are served through server-generated signed Supabase URLs. Upstash credentials are also server-only. Submission APIs fail closed when Redis cannot verify rate limits; public reads bypass unavailable Redis and query PostgreSQL.

Better Auth uses credential accounts with registration disabled. Seed the first `SUPER_ADMIN` using `SEED_ADMIN_EMAIL` and a password of at least 12 characters. Roles are `SUPER_ADMIN`, `EDITOR`, and `REVIEWER`; user administration is restricted to super administrators.

## Production deployment

1. Configure all variables documented in `.env.example`.
2. Run `pnpm install --frozen-lockfile`, `pnpm prisma:generate`, and `pnpm prisma:deploy`.
3. Run `pnpm prisma:seed` once; repeated runs are safe.
4. Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
5. Verify PostgreSQL application objects exist only under `solidra` and physical identifiers are snake_case.
6. Verify all Supabase buckets are private, `/back-office` is disallowed in `robots.txt`, and service-role credentials are absent from client bundles.
7. Run `NODE_ENV=production pnpm verify:production`.
8. Smoke-test both locales, authentication, contact submission, vacancy application, publication, and authorized CV download.

## Team

- Abdul Dzaki Mahdi — 25120300034
- Arico Hartanta Sembiring Meliala — 25120300022
- Antonius Harry — 25120300031
- Ahmad Ichwanudin Zuhri — 25120300018
- Adam Febriansyah — 25120300001
