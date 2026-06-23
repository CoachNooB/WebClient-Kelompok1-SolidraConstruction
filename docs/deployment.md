# Deployment and Local Services

## Redis

Use one of two setups for local development:

1. Existing Upstash Redis with a unique key prefix.
2. Local Redis exposed through an Upstash-compatible REST proxy.

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=solidra-local:v1
```

Production should use a stable prefix such as `solidra:v1`. Changing the prefix invalidates old cached public content.

## Supabase Storage

Create these buckets:

- `solidra-public`: public CMS images.
- `solidra-documents`: public investor PDFs.
- `solidra-cvs`: private applicant CV files.

`SUPABASE_SERVICE_ROLE_KEY` must only be available server-side. The CV bucket must not expose public read access.

## PostgreSQL

Create the application schema before migrations:

```sql
CREATE SCHEMA IF NOT EXISTS solidra;
```

Then run:

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

Use `pnpm prisma:deploy` instead of `pnpm prisma:migrate` in production.

## Better Auth

Configure:

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

Seed creates the initial administrator account. Registration remains disabled.

## Production Checklist

- Run `pnpm prisma:deploy`.
- Run `pnpm build`.
- Run `NODE_ENV=production pnpm verify:production`.
- Confirm `/back-office` is excluded from indexing.
- Confirm the Supabase service-role key is server-only.
- Confirm the CV bucket is private.
- Confirm Redis credentials and `REDIS_KEY_PREFIX` are set.
