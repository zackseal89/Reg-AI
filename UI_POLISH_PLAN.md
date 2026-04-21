# RegWatch — UI Polish Plan

**Status:** Plan. No code written yet beyond the domain swap in this PR.
**Date:** 2026-04-21
**Author:** Zachary (with Claude)
**Scope:** Every route under [app/](app/). Desktop + mobile. Client, Lawyer, Admin.

---

## 1. Goals & Non-Goals

### Goals
1. **Every "create" surface is a button-first pattern.** Inline forms on page load are gone. A primary CTA opens a modal; the form lives inside. Applies to client, lawyer, admin.
2. **Consistent navigation shell** across roles — same grammar, same spacing, same interaction vocabulary.
3. **Hierarchy is visual, not hoped-for.** Pages open with *content* (the work to be done), not with *a form* (the thing a lawyer adds once a week).
4. **Full client-portal redesign with a sidepanel.** The client portal moves from bottom-nav mobile-first to a **left sidepanel desktop-first** layout, same grammar as lawyer/admin. Mobile parity via a collapsible drawer (see §6.3).
5. **One source of truth for components** in a new [components/ui/](components/ui/) folder — no more duplicated Tailwind soup across pages.

### Non-Goals (do NOT pull into this pass)
- No new features. No WhatsApp, CMA, payments, self-signup. See [CLAUDE.md](CLAUDE.md) — "Out of scope for MVP."
- No backend changes to RLS, server actions, or the Gemini pipeline. UI only.
- No rebranding. Navy `#1a2744` / burgundy `#8b1c3f` / cream `#f5f3ef` / Playfair + Inter stay.
- No animation library. Use Tailwind transitions + `data-state` attributes — Radix primitives handle state, we style.

---

## 2. Libraries to Add

| Package | Why | Alternative considered |
|---|---|---|
| `@radix-ui/react-dialog` | Headless modal primitive — a11y, focus trap, escape, scroll lock | Build from scratch (rejected — a11y is hard) |
| `@radix-ui/react-dropdown-menu` | Row actions, user menu | Custom popover (rejected — same a11y cost) |
| `@radix-ui/react-tabs` | Lawyer briefings/documents filter tabs | Query-param buttons (keep as fallback if we skip tabs) |
| `class-variance-authority` | Button variants + Tailwind | Hand-roll (rejected — gets ugly past 3 variants) |
| `clsx` + `tailwind-merge` | Component class composition | Already partial in repo |
| `lucide-react` | Consistent icon set — replace inline SVG pastes | Keep inline SVGs (rejected — noisy, inconsistent stroke) |

**Already in repo and reused:** `sonner` (toasts, wired in root), `react-hook-form` (not yet installed but needed for modal forms with client-side validation), `zod` (not yet installed — pair with RHF).

> **Install step (single PR):**
> `npm i @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs class-variance-authority clsx tailwind-merge lucide-react react-hook-form zod @hookform/resolvers`

---

## 3. Component Library — [components/ui/](components/ui/)

The one directory to rule them all. Every primitive below is a thin wrapper over Radix + Tailwind, with brand tokens baked in.

```
components/
  ui/
    button.tsx          — variants: primary | accent | ghost | destructive | outline
    dialog.tsx          — Radix Dialog + brand styling (backdrop, motion, close x)
    form-field.tsx      — label + input + error + helper in one
    input.tsx           — text, email, tel, number
    textarea.tsx
    select.tsx          — native <select> with our chevron bg (keep simple)
    checkbox.tsx
    radio.tsx
    card.tsx            — bordered white container used on every list page
    table.tsx           — thead/tbody primitives matching current look
    badge.tsx           — status pills (draft / approved / sent / published / etc.)
    empty-state.tsx     — "No clients yet" surface with optional CTA slot
    page-header.tsx     — h1 + description + right-slot (CTA button)
    section-title.tsx   — h2 with optional counter
    dropdown-menu.tsx
    tabs.tsx
    icon.tsx            — re-export lucide with brand defaults (size, stroke)
  modals/
    create-client-modal.tsx
    create-briefing-modal.tsx
    upload-document-modal.tsx
    assign-document-modal.tsx
    invite-lawyer-modal.tsx
    create-jurisdiction-modal.tsx     (admin-only, post-MVP trigger)
    request-access-modal.tsx          (public landing)
```

Modals are **server-action bound**: the `<form action={serverAction}>` pattern stays. We wrap it inside a `<Dialog>` that closes on successful `redirect()` (Next App Router closes it naturally on navigation). For client-side validation, RHF+Zod validates before submit.

---

## 4. Button-First Entry Pattern (the headline change)

### Rule
> **A page never opens with an editable form.** Every "create/add/invite/upload" entry collapses behind a single primary CTA in the page header. Clicking it opens a modal. The modal contains the existing form untouched except for styling.

### Page-by-page mapping

| Page | Today (inline form) | After (button → modal) |
|---|---|---|
| [app/lawyer/clients/page.tsx](app/lawyer/clients/page.tsx) | "Onboard New Client" form takes 60% of the page | `+ New Client` button top-right → `CreateClientModal` |
| [app/lawyer/briefings/page.tsx](app/lawyer/briefings/page.tsx) | "New Briefing" form + assign checkboxes above the list | `+ New Briefing` button → `CreateBriefingModal` |
| [app/lawyer/documents/page.tsx](app/lawyer/documents/page.tsx) | Upload form + `?assign=` panel | `+ Upload Document` button → `UploadDocumentModal`. Assign = row action (`⋯` menu) → `AssignDocumentModal`. Kill the `?assign=` query-param pattern. |
| [app/admin/lawyers/page.tsx](app/admin/lawyers/page.tsx) | "Invite New Lawyer" form above table | `+ Invite Lawyer` button → `InviteLawyerModal` |
| [app/admin/clients/page.tsx](app/admin/clients/page.tsx) | Read-only today | No change — but add filter chips |
| [app/page.tsx](app/page.tsx) landing | "Request Access" form inline | Hero CTA `Request Access` opens `RequestAccessModal`. Keep a second inline copy at the footer for scroll-to-bottom users. |
| [app/dashboard/profile/page.tsx](app/dashboard/profile/page.tsx) | Inline profile fields | `Edit Profile` button → `EditProfileModal` |
| Client doc/briefing read pages | No forms today | No change — these are read-only by design. |

### Modal anatomy (all modals)
```
┌─ backdrop (primary/60 + backdrop-blur) ────────────┐
│  ┌─ panel (max-w-[540px] md:max-w-[640px]) ────┐   │
│  │ Header:                                     │   │
│  │   h2 (serif, primary)                       │   │
│  │   description (sans, primary/60)            │   │
│  │   close × (top-right)                       │   │
│  │ ───────────────────────────────             │   │
│  │ Body: form fields, 1 column on mobile,      │   │
│  │       2 columns ≥ md for compact forms      │   │
│  │ ───────────────────────────────             │   │
│  │ Footer (sticky): [Cancel] [Primary action]  │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```
- Escape closes. Backdrop click closes. Submit closes on success (via `redirect()`).
- Focus ring traps inside.
- Mobile: full-screen sheet, slides up, footer sticks to bottom above `env(safe-area-inset-bottom)`.
- Long forms (briefing content, doc upload) are internally scrollable — modal panel never exceeds `90vh`.

### Row actions
Replace stacked per-row `<form>` buttons (Activate/Suspend/Approve/Reject/etc.) with a `⋯` dropdown per row.
- Destructive actions (Suspend, Reject, Unpublish) live at the bottom of the menu, red text, confirm-modal on click.
- Primary action (Approve, Send, Publish) stays as a visible pill next to the `⋯`.

---

## 5. Navigation — unified shell

### Lawyer + Admin (desktop-first)
Same sidebar skeleton, different items. Both already have sidebars; fold the admin one into the lawyer shell's polish level.

```
┌ sidebar (w-64, bg-primary) ┬ main ─────────────────────┐
│  • wordmark + role badge   │ ┌─ page-header (sticky)─┐ │
│  • nav items (lucide icon  │ │  h1  · description     │ │
│    + label, active state   │ │                [+ CTA] │ │
│    with accent underline)  │ └────────────────────────┘ │
│  • section divider         │ ┌─ filters (tabs/chips)─┐  │
│  • secondary items         │ └────────────────────────┘ │
│  • footer:                 │ main content                │
│    - user email            │   (cards / table / list)    │
│    - user dropdown menu    │                             │
│      (Profile, Sign out)   │                             │
└────────────────────────────┴─────────────────────────────┘
```

- **Lawyer nav items:** Dashboard, Clients, Briefings, Documents. [admin → add: Lawyers, All Clients, Audit Logs, Settings.]
- **Active state:** accent-colored left border (3px) + semi-bold. Kill the current `bg-white/10` pill — too heavy.
- **Collapse to icon-only** on `lg` breakpoint down → iconbar (w-16) with tooltips. Don't support on mobile — redirect to mobile layout.
- **User menu:** lucide `User` avatar circle bottom-left, dropdown has Profile, Sign out, "Switch role" if admin.

### Client (sidepanel-first, full redesign)

**Retire the bottom nav** ([app/dashboard/bottom-nav.tsx](app/dashboard/bottom-nav.tsx)) as the primary navigation. Replace with a left sidepanel that matches the lawyer/admin grammar, tuned to client tone.

```
┌ sidepanel (w-72, cream bg) ────┬ main (scrollable) ──────────┐
│  ┌ brand block ──────────────┐ │ ┌─ top bar (sticky, 64px)─┐ │
│  │ • accent dot + "RegWatch" │ │ │ page crumbs · search     │ │
│  │ • company name (truncate) │ │ │                 · bell · │ │
│  │ • sector tag (sm muted)   │ │ └──────────────────────────┘ │
│  └───────────────────────────┘ │                              │
│  ┌ primary nav ──────────────┐ │ page content                 │
│  │ ◉ Home                    │ │                              │
│  │ ◉ Briefings  ·  [3]       │ │                              │
│  │ ◉ Documents ·  [12]       │ │                              │
│  │ ◉ Ask RegWatch (chat)     │ │                              │
│  └───────────────────────────┘ │                              │
│  ┌ secondary ────────────────┐ │                              │
│  │ • Your regulators (CBK)   │ │                              │
│  │ • Your regulators (ODPC)  │ │                              │
│  └───────────────────────────┘ │                              │
│  ┌ footer ───────────────────┐ │                              │
│  │ avatar · firstName        │ │                              │
│  │ dropdown: Profile, Sign out│ │                              │
│  └───────────────────────────┘ │                              │
└────────────────────────────────┴──────────────────────────────┘
```

- **Background:** cream (`#f5f3ef`) — unlike the lawyer's dark sidebar. Clients get warmth. Lawyer/admin get operational density.
- **Active state:** accent burgundy 3px left-border + primary navy text + `bg-primary/[0.03]`. Kill the active-dot from the current bottom nav.
- **Count badges:** unread briefings and unread documents get a burgundy pill next to the label. Drives the "you have work to read" signal.
- **Regulators section:** a read-only list of the client's assigned jurisdictions (CBK, ODPC, CMA). Click → filters briefings + docs by that regulator. Doubles as a reassurance that we know their scope.
- **User footer:** avatar + first name + dropdown (Profile, Sign out). Replaces the header avatar link currently in [app/dashboard/layout.tsx](app/dashboard/layout.tsx).

**Top bar (right side of the sidepanel).**
- Sticky, 64px, cream-on-cream with 1px primary/5 border-bottom.
- Left: breadcrumbs (e.g. `Briefings / CBK Capital Adequacy Update`) — contextual, replaces the current "RegWatch | Company" brand repeat (already in the sidepanel).
- Center-right: global search bar (⌘K). Scope: briefings + docs by title. Hidden below `md`, replaced by a search icon that opens a search modal.
- Right: `Bell` icon (unread count), click → drawer showing recent briefings. `Avatar` circle → same dropdown as sidepanel footer (dual-affordance for reach).

**Mobile client layout (`< md`).**
- Sidepanel collapses into a drawer. Trigger: `Menu` icon top-left of a new 56px top bar.
- Drawer slides in from left over a primary/60 backdrop. Close on route change, backdrop click, and escape.
- Bottom nav **removed entirely** — we don't maintain two nav systems. Mobile clients use the drawer. If testing shows friction, reintroduce a 3-item bottom nav (Home, Chat, Menu) as a thin affordance — flag as post-PR QA.
- Chat route goes full-bleed on mobile: no drawer, a back chevron returns to the prior page.

**Why this change (the "why" for future Zachary).**
- Clients need information density, not app-like tabs. Sidebar is the correct metaphor for a regulatory intelligence workspace.
- Matches how lawyers see the platform — when a lawyer looks over a client's shoulder, nothing's dissonant.
- Count badges + regulator chips are load-bearing UX — they can't live cleanly in a bottom nav.
- Desktop-first aligns with our audience: COOs/founders at their desk, not commuting.

### Landing ([app/page.tsx](app/page.tsx))
Top nav sticky, brand left, `Request Access` CTA right. No link menu — it's a one-page landing. On scroll past hero, nav gains a solid navy background.

---

## 6. Page-by-page polish — positioning checklist

For every page below, the structure is: **page header (title + CTA) → filters → content**. No inline forms, no orphan tables without cards.

### 6.1 Lawyer
- [app/lawyer/page.tsx](app/lawyer/page.tsx) — dashboard
  - 4-card KPI row: Active clients · Pending briefings · Unpublished docs · This-week audit count
  - Below: "Recent activity" feed (reuses audit_logs), 10 items max
  - Below: "Your clients" — grid of client cards (avatar, name, status pill)
  - CTA row with shortcuts: `+ New Client` · `+ New Briefing` · `+ Upload Doc` (all buttons open modals)

- [app/lawyer/clients/page.tsx](app/lawyer/clients/page.tsx)
  - Header: "Client Portfolio" · counter `N clients` · `+ New Client`
  - Filter chips: All · Active · Pending · Suspended
  - Table with row `⋯` menu (Onboarding, Activate, Suspend, Delete-confirm)

- [app/lawyer/clients/[id]/onboarding/page.tsx](app/lawyer/clients/[id]/onboarding/page.tsx) — already the right shape. Keep. Polish: progress bar above step list, each step CTA opens its action's modal.

- [app/lawyer/briefings/page.tsx](app/lawyer/briefings/page.tsx)
  - Header: "Briefings" · `+ New Briefing`
  - Tabs: `Draft (n)` `Approved (n)` `Sent (n)` — filter the list
  - Card list unchanged, row actions via `⋯`
  - Click card → detail route (`/lawyer/briefings/[id]`) — NEW route, shows full content + audit trail. (Post-MVP if tight.)

- [app/lawyer/documents/page.tsx](app/lawyer/documents/page.tsx)
  - Header: "Documents" · `+ Upload Document`
  - Tabs: `Uploaded` `Assigned` `Published`
  - Card list. Row `⋯`: Assign, Publish/Unpublish, Download, Delete
  - Kill the `?assign=` inline panel — becomes `AssignDocumentModal`

### 6.2 Admin
- [app/admin/page.tsx](app/admin/page.tsx) — metrics
  - Bring to lawyer dashboard's card standard. Add sparkline per KPI (static SVG, no deps).
- [app/admin/lawyers/page.tsx](app/admin/lawyers/page.tsx) — header + `+ Invite Lawyer` button + filter chips + table with `⋯`
- [app/admin/clients/page.tsx](app/admin/clients/page.tsx) — header + filter chips (Active/Pending/Suspended) + lawyer owner column
- [app/admin/audit-logs/page.tsx](app/admin/audit-logs/page.tsx) — header + date-range + action-filter + virtualised list (post-MVP if rows < 1000)

### 6.3 Client — full redesign

The client portal is the one audiences *pay* for. It's getting a ground-up pass: new layout shell, new home, new list/detail patterns, new chat, new profile. Everything below assumes the sidepanel from §5 is in place.

**Layout shell** — new [app/dashboard/layout.tsx](app/dashboard/layout.tsx):
- Replace header + bottom-nav with `<ClientSidepanel>` + `<ClientTopBar>` + main scroll container.
- Delete [app/dashboard/bottom-nav.tsx](app/dashboard/bottom-nav.tsx). Add `app/dashboard/_components/client-sidepanel.tsx` + `client-top-bar.tsx` + `mobile-drawer.tsx`.
- Main container: `max-w-6xl mx-auto px-6 md:px-10 py-8` — wider than the current 5xl to let briefing detail pages breathe.

**[app/dashboard/page.tsx](app/dashboard/page.tsx) — new Home (replaces the current redirect-to-briefings)**
- Stop redirecting. The Home page becomes a real surface.
- Hero block: *"Good afternoon, {firstName}."* + today's date + a one-line regulatory weather report ("3 new briefings this week, 1 awaiting your review").
- **Latest briefing** — full-width card, burgundy accent on the left edge, title + 3-line excerpt + `Read briefing →` CTA + jurisdiction pill.
- **Unread briefings** — grid of 2–3 small cards. Empty state: "You're caught up." with a subtle illustration.
- **Your regulators** — horizontal row of regulator chips (CBK / ODPC / CMA) with a live count of documents per regulator. Click → filtered list.
- **Ask RegWatch** — a conversational card with a suggested prompt ("What changed in CBK guidelines this quarter?"). Click → deep-link into chat with the prompt pre-filled.
- **Recent documents** — 4-card grid. Each card: icon, title, issuing body, effective date, jurisdiction pill.
- Bottom: quiet "Your counsel" block with lawyer name + `Contact` button (mailto from [app/dashboard/profile/page.tsx](app/dashboard/profile/page.tsx)).

**[app/dashboard/briefings/page.tsx](app/dashboard/briefings/page.tsx) — list**
- Two-column layout at `≥ lg`: filter rail left (w-56), card list right.
- Filter rail contents: search · jurisdiction chips · date range (This week / This month / All) · read status toggle · author (if multiple lawyers).
- Card list: each card shows read/unread indicator (burgundy dot), title, sent-date, jurisdiction pill, 3-line excerpt, `By Sarah Kamau` byline. Click → detail.
- At `< lg`, filter rail collapses into a `Filters` sheet (opens from right edge).
- Empty state: "No briefings match these filters." with a `Clear filters` button.

**[app/dashboard/briefings/[id]/page.tsx](app/dashboard/briefings/[id]/page.tsx) — detail**
- Article layout, `max-w-[720px] mx-auto`, generous line-height (1.7), serif H1, sans body.
- Header: jurisdiction pill, sent-date, lawyer byline (`Reviewed & approved by Sarah Kamau · Advocate of the High Court of Kenya`), estimated read time.
- Body: markdown-rendered briefing content. Pull quotes for key regulatory citations.
- Right-rail (desktop only, `≥ xl`): source documents cited in this briefing as cards; click → doc detail.
- Sticky floating CTA bottom-right: `Ask a follow-up` (burgundy pill) → opens chat pre-loaded with the briefing title + id as context.
- Bottom: "Next briefing →" + "← Previous briefing" paging.

**[app/dashboard/documents/page.tsx](app/dashboard/documents/page.tsx) — list**
- Same two-column pattern as briefings.
- Filter rail: search · regulator · doc type (circular / gazette / regulation / ...) · effective-date range.
- Card list: file-type icon, title, issuing body, reference number, effective date, jurisdiction pill.
- Sort dropdown (top-right of list): Newest · Oldest · By regulator · By type.

**[app/dashboard/documents/[id]/page.tsx](app/dashboard/documents/[id]/page.tsx) — detail**
- Two-pane desktop layout: left = PDF viewer (embed via `<object>` or `react-pdf` if already in deps — check first), right = metadata panel.
- Metadata panel: title, issuing body, reference number, effective date, regulator pill, lawyer's summary (if set), `Download original` button.
- Below viewer: "Related briefings" — briefings that cite this doc (via `groundingMetadata` if feasible; else a manual curation post-MVP).
- Mobile: viewer stacks above metadata; tap-to-expand into full-screen PDF.

**[app/dashboard/chat/page.tsx](app/dashboard/chat/page.tsx) — new chat**
- Full-height conversation view inside the shell. Sidepanel stays visible on desktop; mobile goes full-bleed.
- Message bubbles:
  - Assistant: cream-white bg, 1px primary/10 border, serif for any pulled quotes, inline citation pill chips at the bottom (`[1] CBK Prudential Guidelines 2024 p.12`).
  - User: navy bg, cream text, right-aligned, max-w-[80%].
- Composer: bottom-sticky, rounded-xl, primary/10 border, `Send` button burgundy. Placeholder: "Ask anything about your regulations…"
- Above composer: quick-prompt chips (3 suggestions) that disappear after first message.
- Left rail (collapse-able): chat history list — "Today / Yesterday / This week" groupings. Starts hidden to keep focus on conversation; toggle via `History` icon.
- Streaming indicator: soft pulsing dot + "RegWatch is thinking…" while SSE text delta is streaming.
- Copy-to-clipboard on hover per assistant message. `Share` (→ copy link with conversation ID) post-MVP.
- Empty chat state: centered brand lockup + three suggested prompts tied to the client's jurisdictions ("What are the latest CBK capital requirements?", "Summarise ODPC enforcement trends this year", etc.)

**[app/dashboard/profile/page.tsx](app/dashboard/profile/page.tsx) — new**
- Card grid: **Your account** (name, email, phone), **Your company** (name, sector, KRA PIN if stored, address), **Your regulators** (read-only chips), **Your counsel** (lawyer name, email, direct-line).
- Each card has an `Edit` button where applicable (account + company) → opens `EditProfileModal`.
- Below: "Security" block with `Change password` button → password modal. Sign-in history (post-MVP).
- Bottom: `Sign out` destructive button (muted), full-width on mobile.

### 6.4 Sign-in — role-aware entry ([app/(auth)/login/page.tsx](app/(auth)/login/page.tsx) + new routes)

Today there is **one** shared login page. Middleware routes by `profiles.role` after auth. That works — but the brand moment before sign-in differs by audience. Two changes:

**(a) Split into three entry URLs, one shared component.**

```
app/(auth)/
  login/page.tsx           — default, client-facing (current split-screen, tuned)
  lawyer-login/page.tsx    — lawyer variant  (URL: /lawyer-login)
  admin-login/page.tsx     — admin variant   (URL: /admin-login, unlisted)
  _components/
    SignInShell.tsx        — the split-screen layout (left brand panel + right form)
    SignInForm.tsx         — the actual form (email / password / submit / error)
```

- The form is identical across roles — same server action, same validation, same Supabase call. Role routing still happens in [proxy.ts](proxy.ts) middleware + [lib/supabase/middleware.ts](lib/supabase/middleware.ts) based on `profiles.role`. **No auth-logic duplication.**
- What differs is **copy, left-panel content, and the "Client Access / Counsel Access / Operations" chip** above the heading.
- The three pages each import `SignInShell` and pass a `role` prop (`'client' | 'lawyer' | 'admin'`) that toggles copy + accent.

**(b) Per-role visual variants.**

| Role | Chip (top-left on form) | Heading | Subcopy | Left-panel quote |
|---|---|---|---|---|
| **Client** (default `/login`) | `CLIENT ACCESS` (accent burgundy) | "Sign in to RegWatch" | "Enter the credentials issued to you by MN Advocates." | "A confidential channel to your *regulatory counsel*." *(current copy — keep)* |
| **Lawyer** (`/lawyer-login`) | `COUNSEL ACCESS` (primary navy) | "Sign in — MNL Counsel" | "Access your client portfolio, briefings, and document library." | "Where your advisory work meets the machine — *and not the other way around.*" |
| **Admin** (`/admin-login`) | `OPERATIONS` (zinc-700) | "Sign in — Admin Operations" | "Platform operations. Authorised personnel only." | Austere: no quote, just a wordmark + "Unauthorised access is logged and prosecuted under Kenya's Computer Misuse & Cybercrimes Act, 2018." |

- Admin variant uses a darker, more utilitarian palette (`zinc-950` left panel) — signals it's not a marketing surface.
- Each page sets distinct `<title>` + `robots: { index: false }` for lawyer/admin (the client login can stay indexable).

**(c) Discoverability & routing.**

- Landing [app/page.tsx](app/page.tsx): primary CTA stays `Request Access` → modal; a secondary text link in the nav bar — `Sign in` — goes to `/login`.
- No links to `/lawyer-login` or `/admin-login` from the public site — lawyers/admins bookmark them or get them in the welcome email.
- The shared `/login` page keeps a tiny "Are you counsel?" affordance at the bottom that links to `/lawyer-login`.
- Middleware continues to be the source of truth for role-based redirects post-auth. If a lawyer signs in at `/login`, they still land on `/lawyer`. The URL choice is a UX affordance, not a security boundary.

**(d) Form polish applied uniformly.**

- Replace inline `style={{...}}` blobs in the current login with Tailwind classes tied to our tokens.
- Add `Show/hide password` toggle (lucide `Eye` / `EyeOff`), client component.
- Add `aria-live="polite"` on the error block so screen readers announce login failures.
- Rate-limit UX: if Supabase returns `too_many_requests`, show "Too many attempts — try again in a moment" instead of the raw error.
- Autofocus email field. Enter key submits.
- After sign-in success, show a 300ms branded splash ("Welcome, {firstName}") before the role redirect fires — small polish, big first-impression.

**(e) Out of scope for this pass.**
- No social sign-in, no magic-link, no 2FA UI. All post-MVP. `lib/supabase` already supports them — we just don't show them.
- No password reset page redesign beyond matching the new `SignInShell` — if a reset route exists it inherits styling automatically.

### 6.5 Landing ([app/page.tsx](app/page.tsx))
Already strong. Polish targets:
- Replace the inline form with hero CTA → `RequestAccessModal`
- Keep the footer inline form as fallback
- Tighten section spacing (currently uneven between sections — see [IntelligencePreview](app/components/landing/IntelligencePreview.tsx) vs [JurisdictionGrid](app/components/landing/JurisdictionGrid.tsx))
- Add a "How it works" 3-step visual (Brief → Approve → Deliver), reusing brand colors

---

## 7. Design tokens — codify in Tailwind v4

Today the repo uses ad-hoc values (`bg-primary/15`, `text-[15px]`, bespoke radii). Codify in [app/globals.css](app/globals.css) via `@theme`:

```css
@theme {
  /* Brand */
  --color-primary: #1a2744;
  --color-accent:  #8b1c3f;
  --color-cream:   #f5f3ef;

  /* Type scale */
  --font-serif: 'Playfair Display', serif;
  --font-sans:  'Inter', system-ui, sans-serif;

  /* Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;     /* our default card */
  --radius-xl: 1.25rem;  /* modal panel */

  /* Spacing hooks */
  --spacing-section: 2.5rem;  /* 40px vertical between major sections */
  --spacing-page-x:  2rem;    /* 32px gutter */
}
```

And **retire** these tailwind smell patterns during the polish pass:
- `text-[13px]`, `text-[15px]` scattered → `text-sm` / `text-base`
- `border-primary/5`, `/10`, `/15`, `/20` soup → pick **3 values**: `border-primary/10`, `border-primary/20` (hover), `border-accent/30` (focus). Nothing else.
- Shadow soup → two shadows only: `shadow-sm` (cards) and our custom `shadow-lifted` for modals/emphasis.

---

## 8. Loading, empty, error states

Every list route must define all three. Today some have them (briefings "No briefings yet") and some don't.

- **Loading:** Next.js `loading.tsx` per route folder with skeleton rows (5 × muted bars).
- **Empty:** centered illustration slot + one-line message + optional CTA. Use `components/ui/empty-state.tsx`.
- **Error:** Next.js `error.tsx` per route folder with friendly copy + `Try again` button + mailto fallback.

Add to: every folder under `app/lawyer/`, `app/admin/`, `app/dashboard/`.

---

## 9. Accessibility & keyboard

- Modals: focus trap, escape closes, first focusable input auto-focused.
- All interactive elements have `aria-label` if icon-only.
- Color contrast: primary/accent on cream passes AA. Re-check `primary/40` and `primary/50` text — bump to `/60` minimum if under AA on cream.
- Tab order matches visual order.
- Bottom nav on client: each item has `aria-current="page"` when active.
- Forms: every `<input>` has an associated `<label>`. Error messages linked via `aria-describedby`.

---

## 10. Responsive breakpoints

| Breakpoint | Behavior |
|---|---|
| `< sm` (< 640px) | All roles: sidepanel collapses into a drawer (Menu icon top-left). Modals go full-screen sheets. Two-pane list/detail stacks. |
| `sm → md` | Client: sidepanel still drawer-based. Dashboard grids collapse to 1-col. |
| `md → lg` | Client + lawyer + admin: sidepanel expanded (w-72 client / w-64 lawyer+admin). Lists + detail side-by-side. |
| `≥ lg` | Full desktop. Client briefing detail adds the right-rail cited-source panel. Lawyer/admin tables fit without scroll. |
| `≥ xl` | Wider gutters, optional collapsed sidepanel icons for power users. |

Landing page ([app/page.tsx](app/page.tsx)) already responsive; re-verify at 390px (per [prompts/client-landing-page-agent.md](prompts/client-landing-page-agent.md) rules).

---

## 11. Implementation order (one PR per bullet ≤ 300 LOC)

1. **PR-1 Tokens + deps** — install packages, codify tokens in `globals.css`, add `components/ui/button.tsx` + `dialog.tsx` + `card.tsx` + `page-header.tsx`. No page changes yet.
2. **PR-2 Lawyer Clients** — refactor [app/lawyer/clients/page.tsx](app/lawyer/clients/page.tsx) to use button+modal + `⋯` row menu. First real use of `CreateClientModal`. Prove the pattern.
3. **PR-3 Lawyer Briefings** — same pattern. Add tabs.
4. **PR-4 Lawyer Documents** — same pattern + delete `?assign=` flow.
5. **PR-5 Admin Lawyers + Admin Clients** — button+modal for invite; filter chips on clients.
6. **PR-6 Lawyer dashboard + Admin dashboard** — KPI cards, activity feed, sparklines.
7. **PR-7 Client portal — new shell (sidepanel + top bar + drawer)** — add `app/dashboard/_components/client-sidepanel.tsx`, `client-top-bar.tsx`, `mobile-drawer.tsx`; rewrite [app/dashboard/layout.tsx](app/dashboard/layout.tsx); delete [app/dashboard/bottom-nav.tsx](app/dashboard/bottom-nav.tsx). New [app/dashboard/page.tsx](app/dashboard/page.tsx) Home (stop the redirect).
8. **PR-8 Client portal — lists & detail redesign** — briefings list + detail, documents list + detail, two-column filter layout, right-rail citations on briefing detail.
9. **PR-8b Client portal — chat + profile redesign** — new chat bubbles, composer, quick-prompts, history rail; profile as card grid with `EditProfileModal`.
8. **PR-8 Landing polish** — hero CTA → modal, section spacing cleanup, how-it-works block.
9. **PR-9 Sign-in polish + role-aware routes** — extract `SignInShell` + `SignInForm`; add `/lawyer-login` and `/admin-login`; show/hide password; rate-limit copy.
10. **PR-10 Loading/empty/error** — add `loading.tsx` + `error.tsx` + consistent empty states everywhere.
11. **PR-11 A11y + polish sweep** — contrast, keyboard, aria, final spacing audit.

Each PR must pass `npm run lint` and `npx tsc --noEmit`. No tests exist (per [CLAUDE.md](CLAUDE.md)) so manual checklist per PR in the PR description.

---

## 12. Out of scope — things I explicitly did not plan

- Rebuilding the chat route streaming contract — untouchable per [CLAUDE.md](CLAUDE.md) chat SSE protocol.
- Dark mode — not requested. Cream is the brand.
- Client ability to comment/annotate briefings — post-summit.
- Search across briefings + docs from a single bar — post-MVP.
- Internationalisation — EN only per scope.

---

## 13. Risks & open questions

1. **Server-action + modal close UX.** Next redirects on success; the modal should close on navigation. If the action `redirect()`s to the same route (our current pattern), the modal mounts in layout state — need to verify Radix Dialog's `open` state resets correctly. **Validate in PR-2.**
2. **React Hook Form inside server-action form.** RHF handles client validation; on submit we let the native `<form action={...}>` fire. Need to confirm `handleSubmit` can gate submission without hijacking the native submit. **Validate in PR-2.**
3. **Mobile lawyer/admin.** We said desktop-first — but lawyers do pick up phones. Decide: "desktop recommended" banner, or responsive everything. My recommendation: banner for MVP, responsive post-summit.
4. **Icon library size.** `lucide-react` tree-shakes per import; fine.
5. **No tests.** Any regression we introduce we catch in browser. Budget a manual QA pass per PR before merge.

---

## 14. Success criteria

- [ ] Zero inline create forms on any page load.
- [ ] Every "add" action is a button that opens a modal.
- [ ] All three roles share the same navigation grammar (spacing, active state, typography).
- [ ] All list pages have loading + empty + error states.
- [ ] `npm run lint` + `npx tsc --noEmit` clean on `main`.
- [ ] Lighthouse a11y ≥ 95 on landing, client dashboard, lawyer dashboard.
- [ ] Zachary can demo a full briefing creation (modal → approve → send → client receives email at `www.regwatchmnl.net`) without touching a URL bar.
- [ ] Client portal bottom-nav is removed. Sidepanel is live on desktop, drawer on mobile.
- [ ] Client Home page is a real surface (not a redirect), with hero briefing, unread grid, regulator chips, suggested chat prompt.
- [ ] Briefing detail has the right-rail cited-source panel at `≥ xl` and the floating `Ask a follow-up` CTA on all sizes.
