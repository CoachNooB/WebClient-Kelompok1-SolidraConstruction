# Card Section CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace JSON editing for public card-based sections with form-managed CMS records and automatically render published records on public pages.

**Architecture:** Use existing page sections for layout, headings, ordering, and visibility. Add a generic `SectionCard` resource for repeatable card content used by `SERVICES`, `PROJECTS`, `TIMELINE`, `VALUES`, `LEADERSHIP`, `CERTIFICATIONS`, `FINANCIALS`, `GOVERNANCE`, `OFFICES`, `BENEFITS`, `PROCESS`, and `VACANCIES`; use the existing `InvestorDocument` resource for `DOCUMENTS`. Public rendering resolves section cards/documents at page load and falls back to legacy JSON config where no managed records exist.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, PostgreSQL, Vitest, Testing Library, Supabase Storage.

---

### Task 1: Data Model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260624000000_card_section_cms/migration.sql`
- Test: `tests/unit/database-naming.test.ts`

- [ ] Add `SectionCard` and `SectionCardTranslation` models in schema.
- [ ] Add SQL migration creating `solidra.section_cards` and `solidra.section_card_translations`.
- [ ] Include indexes for `section_type`, `status`, and `order`.
- [ ] Run `pnpm prisma:generate`.
- [ ] Run `pnpm test:unit tests/unit/database-naming.test.ts`.

### Task 2: Public Data Mapping

**Files:**
- Modify: `lib/repositories/public-content.ts`
- Modify: `components/public/database-page.tsx`
- Modify: `components/public/section-renderer.tsx`
- Test: `tests/unit/public-card-sections.test.ts`
- Test: `tests/unit/section-renderer.test.tsx`

- [ ] Write failing tests for `DOCUMENTS` using published investor documents.
- [ ] Write failing tests for card sections using managed section cards.
- [ ] Add DTO fields for resolved `items`.
- [ ] Fetch published section cards by section type and locale.
- [ ] Fetch published investor documents and convert storage paths to public URLs.
- [ ] Render `section.items` before falling back to legacy `config.items`.
- [ ] Run targeted unit tests.

### Task 3: Back-Office CRUD

**Files:**
- Modify: `lib/auth/back-office-sections.ts`
- Modify: `components/back-office/sidebar.tsx`
- Modify: `lib/repositories/back-office.ts`
- Modify: `components/back-office/resource-create-panel.tsx`
- Modify: `app/back-office/(dashboard)/[section]/[id]/page.tsx`
- Create: `app/api/back-office/section-cards/route.ts`
- Create: `app/api/back-office/section-cards/[id]/route.ts`
- Create: `components/back-office/section-card-editor-form.tsx`
- Test: `tests/unit/back-office-sections.test.ts`
- Test: `tests/unit/section-card-validation.test.ts`

- [ ] Add `section-cards` as a back-office resource.
- [ ] Add form fields for section type, order, value, URL, image upload, ID/EN title, and ID/EN description.
- [ ] Add create/update/status APIs.
- [ ] Upload images through the existing public image bucket.
- [ ] Invalidate relevant public page/report cache keys after changes.
- [ ] Run targeted unit tests.

### Task 4: Page Editor UX

**Files:**
- Modify: `components/back-office/page-editor-form.tsx`
- Test: `tests/unit/page-editor-form.test.tsx`

- [ ] Hide `Config JSON` for all managed card section types.
- [ ] Show clear CMS guidance linking users to `section-cards` or `investor-documents`.
- [ ] Keep JSON config available only for unmanaged or legacy static sections if needed.
- [ ] Run targeted unit tests.

### Task 5: Verification

**Files:**
- Modify only files already touched if verification exposes issues.

- [ ] Run `pnpm prisma:validate`.
- [ ] Run `pnpm test:unit`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm lint`.
