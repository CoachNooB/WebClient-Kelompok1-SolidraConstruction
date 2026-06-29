# Active Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Highlight the active public navigation item and keep public and back-office nested-route matching consistent and accessible.

**Architecture:** Add one pure segment-aware route matcher in `lib/navigation.ts`. Use it in both client navigation components, while each component retains its own visual style and the public header excludes external links from active matching.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library

---

## File Structure

- Create `lib/navigation.ts`: pure active-route matching with exact-root behavior.
- Create `tests/unit/navigation-active.test.ts`: focused unit coverage for route matching.
- Create `tests/unit/site-header.test.tsx`: public desktop/mobile active-state coverage.
- Create `tests/unit/sidebar.test.tsx`: back-office active-state regression coverage.
- Modify `components/public/site-header.tsx`: use the matcher and render active semantics/styles.
- Modify `components/back-office/sidebar.tsx`: replace inline matching with the shared helper.

### Task 1: Shared Route Matcher

**Files:**
- Create: `lib/navigation.ts`
- Test: `tests/unit/navigation-active.test.ts`

- [ ] **Step 1: Write the failing matcher tests**

```ts
import { describe, expect, it } from "vitest";
import { isActivePath } from "@/lib/navigation";

describe("isActivePath", () => {
  it("matches an exact route", () => {
    expect(isActivePath("/en/careers", "/en/careers")).toBe(true);
  });

  it("matches a nested route", () => {
    expect(isActivePath("/en/careers/site-engineer", "/en/careers")).toBe(true);
  });

  it("does not match an unrelated route with the same prefix", () => {
    expect(isActivePath("/en/careers-old", "/en/careers")).toBe(false);
  });

  it("only matches root targets exactly", () => {
    expect(isActivePath("/back-office/pages", "/back-office", true)).toBe(false);
    expect(isActivePath("/back-office", "/back-office", true)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the matcher tests and verify RED**

Run: `pnpm vitest run tests/unit/navigation-active.test.ts`

Expected: FAIL because `@/lib/navigation` does not exist.

- [ ] **Step 3: Implement the minimal matcher**

```ts
export function isActivePath(
  pathname: string,
  target: string,
  exact = false,
): boolean {
  if (pathname === target) return true;
  if (exact) return false;
  return pathname.startsWith(`${target}/`);
}
```

- [ ] **Step 4: Run the matcher tests and verify GREEN**

Run: `pnpm vitest run tests/unit/navigation-active.test.ts`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the matcher**

```bash
git add lib/navigation.ts tests/unit/navigation-active.test.ts
git commit -m "feat: add active route matcher"
```

### Task 2: Public Header Active State

**Files:**
- Create: `tests/unit/site-header.test.tsx`
- Modify: `components/public/site-header.tsx`

- [ ] **Step 1: Write failing public-header tests**

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/public/site-header";

let pathname = "/en/careers/site-engineer";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const items = [
  { id: "home", label: "Home", url: "", external: false, children: [] },
  {
    id: "careers",
    label: "Careers",
    url: "/careers",
    external: false,
    children: [],
  },
  {
    id: "external",
    label: "Partner",
    url: "https://example.com",
    external: true,
    children: [],
  },
];

describe("SiteHeader", () => {
  beforeEach(() => {
    pathname = "/en/careers/site-engineer";
  });

  it("marks an internal parent link active on a nested route", () => {
    render(<SiteHeader locale="en" items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    const links = screen.getAllByRole("link", { name: "Careers" });

    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("aria-current", "page");
      expect(link).toHaveClass("text-blue-600");
    }
  });

  it("does not mark an external link active", () => {
    pathname = "https://example.com";
    render(<SiteHeader locale="en" items={items} />);

    expect(screen.getAllByRole("link", { name: "Partner" })[0]).not.toHaveAttribute(
      "aria-current",
    );
  });
});
```

- [ ] **Step 2: Run the public-header tests and verify RED**

Run: `pnpm vitest run tests/unit/site-header.test.tsx`

Expected: FAIL because the Careers links lack `aria-current="page"` and active styling.

- [ ] **Step 3: Add active state to desktop and mobile links**

Import `isActivePath` from `@/lib/navigation`. In each `items.map`, calculate:

```ts
const target = item.external ? item.url : `/${locale}${item.url}`;
const active =
  !item.external && isActivePath(path, target, item.url === "");
```

Render each link with:

```tsx
aria-current={active ? "page" : undefined}
className={
  desktop
    ? `text-sm font-semibold ${active ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`
    : `min-h-11 py-3 font-semibold ${active ? "text-blue-600" : ""}`
}
```

Use `target` for `href` and preserve the existing external-link attributes and mobile close handler.

- [ ] **Step 4: Run the public-header tests and verify GREEN**

Run: `pnpm vitest run tests/unit/site-header.test.tsx`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the public-header behavior**

```bash
git add components/public/site-header.tsx tests/unit/site-header.test.tsx
git commit -m "feat: highlight active public navigation"
```

### Task 3: Back-Office Shared Matching

**Files:**
- Create: `tests/unit/sidebar.test.tsx`
- Modify: `components/back-office/sidebar.tsx`

- [ ] **Step 1: Write the back-office regression test**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/back-office/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/back-office/pages/page-1",
}));

describe("Sidebar", () => {
  it("marks the parent item active on a nested route", () => {
    render(<Sidebar role="SUPER_ADMIN" />);

    expect(screen.getByRole("link", { name: "Pages" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
```

- [ ] **Step 2: Run the regression test against existing behavior**

Run: `pnpm vitest run tests/unit/sidebar.test.tsx`

Expected: PASS, establishing that the refactor must preserve existing nested-route
and Dashboard behavior. The shared matcher already completed its RED/GREEN cycle
in Task 1; this task is a behavior-preserving refactor.

- [ ] **Step 3: Complete the shared-helper integration**

Add:

```ts
import { isActivePath } from "@/lib/navigation";
```

Replace:

```ts
const active =
  pathname === target ||
  Boolean(href && pathname.startsWith(`${target}/`));
```

with:

```ts
const active = isActivePath(pathname, target, href === "");
```

- [ ] **Step 4: Run navigation tests and verify GREEN**

Run:

```bash
pnpm vitest run tests/unit/navigation-active.test.ts tests/unit/site-header.test.tsx tests/unit/sidebar.test.tsx
```

Expected: all navigation tests PASS.

- [ ] **Step 5: Commit the sidebar integration**

```bash
git add components/back-office/sidebar.tsx tests/unit/sidebar.test.tsx
git commit -m "refactor: share active navigation matching"
```

### Task 4: Full Verification

**Files:**
- Modify only if verification exposes a defect in the files above.

- [ ] **Step 1: Run formatting and static checks**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: both commands exit 0.

- [ ] **Step 2: Run the complete unit suite**

Run: `pnpm test:unit`

Expected: all unit tests PASS.

- [ ] **Step 3: Inspect the final diff**

Run:

```bash
git diff HEAD~3 --check
git status --short
```

Expected: no whitespace errors and only the implementation-plan document may remain uncommitted.

- [ ] **Step 4: Commit the implementation plan**

```bash
git add docs/superpowers/plans/2026-06-29-active-navigation.md
git commit -m "docs: add active navigation implementation plan"
```
