# Active Navigation Design

## Goal

Highlight the current item in the public site header and preserve the existing
active-item behavior in the back-office sidebar. Parent items must remain active
on nested routes.

## Route Matching

Add a shared route-matching helper used by both navigation components. A link is
active when the current pathname:

- exactly matches the link target; or
- starts with the link target followed by `/`.

The second rule uses a path-segment boundary so `/careers-old` does not activate
`/careers`. Root links only use exact matching so the public home item and the
back-office Dashboard item do not remain active throughout their sections.
External public links are never active.

## Presentation and Accessibility

Public desktop and mobile links use blue text for the active state while
retaining their existing inactive and hover styles. Back-office links retain
their existing blue-background and white-text active state. Every active link
sets `aria-current="page"`; inactive links omit the attribute.

## Scope

The change affects:

- the public desktop navigation;
- the public mobile navigation;
- the shared route-matching logic used by the back-office sidebar; and
- focused component tests for both menus.

It does not change CMS navigation data, route definitions, permissions, locale
switching, or external-link behavior.

## Testing

Tests will verify exact matches, nested matches, unrelated path prefixes, root
links, external links, and the active styles and `aria-current` attributes in
both public and back-office navigation.
