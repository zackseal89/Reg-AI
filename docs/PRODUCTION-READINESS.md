# Production Readiness — Milestones & Critical Workflows

Status tracker for taking RegWatch from working MVP to production ahead of the
June 18–20, 2026 summit demo (target: live product, 2 active paying clients).

Check items off as they land. Each milestone lists concrete, verifiable outcomes.

---

## Milestone 1 — Public marketing surface ✅ (mostly complete)

- [x] Landing page with Request Access slide-over (no self-signup)
- [x] Dedicated marketing pages: `/coverage`, `/how-it-works`, `/governance`, `/firm`, `/contact`
- [x] Header/footer navigation wired — every nav link resolves to a real page
- [x] Middleware allowlist for public marketing routes (unauthenticated visitors no longer bounced to `/login`)
- [x] Button system redesigned — flat editorial style, 4px corners, no pill/outline borders
- [x] SEO metadata + JSON-LD on all public pages
- [ ] **Request Access form actually submits** — currently simulated (`RequestAccessForm.tsx` fakes a 1.4s delay). Needs a server action / API route that emails the firm via Resend and writes an `audit_logs` row
- [ ] **Contact form actually submits** — same simulation gap (`app/contact/contact-client.tsx`)
- [ ] Privacy policy & terms of use pages (required for a law-firm platform collecting enquiry data under Kenya's DPA)
- [ ] Favicon/OG image assets finalised (currently default favicon only)

## Milestone 2 — Portals & auth ✅ (complete, needs verification pass)

- [x] Three role portals (admin / lawyer / client) with navy sidebar design
- [x] Role-based middleware redirects + RLS as the authoritative guard
- [x] Cross-linked login pages (`/login`, `/lawyer-login`, `/admin-login`)
- [x] Client onboarding by lawyer only (no self-signup)
- [ ] Password reset / recovery flow verified end-to-end
- [ ] Invite-link flow (`/auth/confirm`) verified with a real email round-trip

## Milestone 3 — Briefing pipeline hardening (from 2026-07-14 investigation)

The one-briefing → many-clients flow works, but personalization and
send-side enforcement have gaps:

- [ ] **Close the email/RLS mismatch** — `on_briefing_sent` emails every assigned client regardless of jurisdiction; RLS hides the briefing in-portal if jurisdiction doesn't match. The Edge Function must join `client_jurisdictions` and skip + audit-log non-matching recipients so send obeys the same rule as read
- [ ] **Per-assignment personal note** — add `personal_note` to `briefing_assignments`; lawyer writes an optional per-client note at assignment; rendered above shared content in email + portal detail page (RLS already scopes assignment rows per client)
- [ ] **Token substitution** — `{{client_name}}`, `{{company_name}}`, `{{sector}}` expanded per recipient at render time (Edge Function + detail page). Deterministic — no AI required
- [ ] **Jurisdiction indicators in the create-briefing modal** — show each client's jurisdictions beside their checkbox; warn on mismatch before send
- [ ] Organization-level assignment — assignments key on `profiles.id`; multi-user companies require ticking each user. Decide: assign per company and fan out, or keep per-user with a company grouping in the picker
- [ ] Sent-briefing immutability — content is editable after `sent` via admin client; lock or version it

## Milestone 4 — RAG / document pipeline

- [x] Gemini File Search indexing on publish, per-client stores (`companies.gemini_store_name`)
- [x] Unpublish removes document from client store
- [x] Chat SSE endpoint with citations, scoped to the client's own store
- [ ] Indexing failure surfaced to the lawyer (polling failure currently leaves `processed = false` silently — needs retry UI or status column)
- [ ] Load-test chat with a realistic corpus (20+ documents) for latency and citation quality
- [ ] Gemini API quota/billing alarms configured

## Milestone 5 — Launch operations

- [ ] Vercel production env vars set and verified (`GEMINI_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, `WEBHOOK_SECRET`)
- [ ] Resend domain (`mnladvocates.com`) verified — SPF/DKIM pass, briefing emails land in inbox not spam
- [ ] Supabase DB webhook on `briefings` confirmed firing in production (secret from Vault)
- [ ] Both Edge Functions deployed to production project
- [ ] Custom domain `www.regwatchmnl.net` live with SSL
- [ ] Error monitoring (Vercel logs review cadence at minimum; Sentry optional)
- [ ] Database backup/PITR confirmed on Supabase plan
- [ ] Seed data removed from production; real client accounts only
- [ ] 2 paying clients onboarded with real documents and at least one sent briefing each

---

## Critical workflows — must pass end-to-end before launch

Each of these must be walked through manually in production (or staging against
production config) and signed off:

1. **Client onboarding** — lawyer creates company + client profile + jurisdictions
   → invite email arrives → client sets password → lands on `/dashboard` with correct
   company name and empty states.
2. **Document lifecycle** — lawyer uploads PDF → assigns to client → publishes →
   document indexed into the client's Gemini store (`processed = true`) → client sees
   it in portal → client chat answers a question about it **with citations** →
   lawyer unpublishes → document disappears from portal and chat can no longer cite it.
3. **Briefing lifecycle** — lawyer drafts (optionally from template) → assigns
   multiple clients → second lawyer/admin approves → send → each assigned client with a
   **matching jurisdiction** receives the email AND sees it in-portal; a non-matching
   client receives **nothing in either channel** (currently fails on the email side —
   see Milestone 3).
4. **Isolation proof** — client A can never see client B's documents, briefings,
   chat answers, or personal notes: verify by logging in as both seeded test clients
   and attempting direct URL access to each other's briefing detail pages.
5. **Request Access → onboarding handoff** — visitor submits the form → firm
   receives the enquiry → lawyer onboards them → requester becomes an active client
   (blocked on the Milestone 1 form-wiring items).
6. **Approval gate integrity** — a draft or rejected briefing is invisible to
   clients in portal, email, and chat, under every path (RLS-enforced; re-verify after
   any policy change).
7. **Audit trail** — every action in workflows 1–3 produces an `audit_logs` row;
   admin can reconstruct who approved and sent what, to whom, and when.

---

*Last updated: 2026-07-14. Update this file in the same PR as the work it tracks.*
