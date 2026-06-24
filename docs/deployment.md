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

- `solidra-public`: CMS images.
- `solidra-documents`: investor PDFs.
- `solidra-cvs`: applicant CV files.

Keep every bucket private. `SUPABASE_SERVICE_ROLE_KEY` must only be available server-side. The application stores object paths in PostgreSQL and generates signed Supabase URLs for previews and downloads.

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
TRUSTED_CLIENT_IP_HEADER=x-vercel-forwarded-for
```

Seed creates the initial administrator account. Registration remains disabled.

Set `TRUSTED_CLIENT_IP_HEADER` to the single client IP header normalized by the hosting platform or trusted reverse proxy. Do not set this to raw `x-forwarded-for` unless the proxy strips untrusted inbound values.

## Request Body Limits

Upload endpoints require a valid `Content-Length` header and reject unknown-size bodies with `411 Length Required`.

Configure the reverse proxy or hosting platform to reject oversized bodies before they reach Next.js:

- Career CV uploads: 7 MB
- CMS image uploads: 10 MB
- CMS section card image uploads: 10 MB
- Investor documents: 17 MB

## Production URLs

Production requires HTTPS values for:

- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

Do not use localhost or plain HTTP in production.

## CSP Hardening

Production removes `unsafe-eval` from `script-src`. `unsafe-inline` remains temporarily for compatibility with current Next.js inline scripts/styles; nonce-based CSP is a follow-up hardening item because it requires request-aware header generation.

## Production Checklist

- Run `pnpm prisma:deploy`.
- Run `pnpm build`.
- Run `NODE_ENV=production pnpm verify:production`.
- Confirm `/back-office` is excluded from indexing.
- Confirm the Supabase service-role key is server-only.
- Confirm every Supabase bucket is private.
- Confirm Redis credentials and `REDIS_KEY_PREFIX` are set.
