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

Copy `.env.example` to `.env`, configure PostgreSQL, then initialize and seed it:

```bash
npx prisma migrate dev --name init
SEED_ADMIN_PASSWORD='use-a-strong-unique-password' npx prisma db seed
```

## Current integration status

The public route surface, responsive design system, bilingual content, forms, API validation, CMS route shell, sitemap, robots configuration, environment contract, complete Prisma schema, and seed data are implemented. API submissions currently validate and acknowledge requests but intentionally do not persist them.

Production deployment still requires wiring PostgreSQL queries into routes, Better Auth sessions and role checks, Supabase Storage, Upstash rate limiting and caching, publication/audit workflows, and database-backed CMS editors. Do not deploy the submission or back-office routes as production-ready until those integrations are complete.

## Team

- Abdul Dzaki Mahdi — 25120300034
- Arico Hartanta Sembiring Meliala — 25120300022
- Antonius Harry — 25120300031
- Ahmad Ichwanudin Zuhri — 25120300018
- Adam Febriansyah — 25120300001
