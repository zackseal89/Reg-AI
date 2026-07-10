---
status: accepted
date: 2026-07-07
---

# 0002: One AppShell for all three portals, with real-data-only dashboards

## Context

RegWatch has three distinct portals — client, lawyer, admin — each with its own routes, RLS policies, and middleware guards. A confirmed reference design specified a navy sectioned sidebar, a top bar, and dense dashboard grids of stat cards and panels for all three. Building three separate shell implementations risked drift between portals on every future layout tweak; building three separate dashboards risked leaving some sidebar nav items pointing nowhere while their pages were still unbuilt.

The reference design's dashboard mockups also included several widgets with no backing data model: a compliance score, a client-risk donut chart, a platform activity trend chart, and a "system health" service-status panel.

## Decision

Build a single `AppShell` component (`components/layout/app-shell.tsx`), parameterized by a `role: 'client' | 'lawyer' | 'admin'` prop, that composes one `Sidebar` and one `TopBar` — both of which branch on the same `role` prop rather than existing as three separate component trees. Each portal's `layout.tsx` (`app/dashboard/layout.tsx`, `app/lawyer/layout.tsx`, `app/admin/layout.tsx`) does its own auth/role check and data fetch, then renders `<AppShell role="...">`.

The sidebar's nav config (`NAV: Record<PortalRole, NavSection[]>` in `sidebar.tsx`) is a static per-role array where every declared item has a real route. Where the reference design named a feature that doesn't exist yet, the route renders a generic `ComingSoon` component (`components/ui/coming-soon.tsx` — icon, title, description, "Back to dashboard") instead of being omitted or left as a dead link. As of this writing `ComingSoon` is used in 17 route files across the three portals.

For the dashboards themselves: only database-backed numbers are shown. The compliance score, risk donut, activity trend chart, and system health panel from the reference design were not built as fake widgets — they were either replaced with a real equivalent (e.g. a real per-jurisdiction or per-document-type breakdown backed by an actual query) or dropped from the grid entirely. This was a deliberate stance, not a shortcut: a legal-compliance product showing a client or lawyer a fabricated number is a trust failure, not a cosmetic gap.

## Consequences

- One shell means one place to fix layout, spacing, or responsiveness bugs across all three portals — but role-branching (`role === 'client' ? ... : ...`) accumulates inside `Sidebar` and `TopBar` as the portals' chrome diverges further. Worth watching if those branches grow harder to follow.
- The `ComingSoon` pattern keeps every nav link honest, but the backlog of "what's actually left to build" now lives only as an implicit count of `ComingSoon` usages — there is no roadmap document tracking it (see the dead `ROADMAP.md` link removed from `README.md` in this same documentation pass). Anyone wanting to know what's unbuilt has to `grep -r "ComingSoon" app/`.
- This pattern is not yet applied everywhere: the sidebar's "Settings" link is still a literal `href="#"` in all three portals — a leftover exception to the "no dead links" principle this ADR otherwise describes.
- Real-data-only dashboards means the shipped dashboards are visually sparser in places than the reference mockup — some grid slots were dropped rather than filled with a plausible-looking substitute. That gap is intentional and should not be "fixed" by adding a fabricated metric.
