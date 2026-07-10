---
status: accepted
date: 2026-07-09
---

# 0004: Two separate email pipelines — Supabase Auth for invites, Resend for briefings

## Context

RegWatch sends two categorically different kinds of email: account invitations (a lawyer invited by an admin via `inviteLawyerAction` in `app/admin/lawyers/actions.ts`, or a client invited by a lawyer via `createClientAction` in `app/lawyer/clients/actions.ts`) and briefing notifications (a client-facing email sent when a lawyer marks an approved briefing as sent, via the `on_briefing_sent` Edge Function). While testing briefing-email deliverability (see `docs/runbooks/debugging-failed-briefing-emails.md`), it became apparent these two email types are not sent through the same system — a discovery made during testing, not a documented design intent found anywhere beforehand.

## Decision

Account invitations use `admin.auth.admin.inviteUserByEmail(...)` — Supabase Auth's own built-in invite mechanism, called directly from Next.js Server Actions with the Supabase service-role client. Both `inviteLawyerAction` and `createClientAction` use it identically, redirecting to `${APP_URL}/auth/confirm?next=/welcome` on acceptance.

Briefing notifications go through a completely separate path: a Supabase Database Webhook on `briefings` (UPDATE → `status='sent'`) invokes the `on_briefing_sent` Edge Function, which renders a React Email template and sends via the Resend API directly (not through Supabase Auth at all).

This split was not found to be a documented, deliberate architectural choice — it appears to be an emergent consequence of building the invite flow first (using whatever Supabase Auth provides out of the box) and the briefing flow later as its own feature (`REG-13`, per the comment in `on_briefing_sent/index.ts`) with Resend chosen specifically for transactional, template-driven email. No spec or prior ADR states an intent to keep these separate; it is simply how the system has always worked.

## Consequences

- **Verifying one pipeline proves nothing about the other.** Confirming Resend domain verification and successful briefing-email delivery (per the runbook) says nothing about whether Supabase Auth's invite emails are being delivered, rate-limited, or landing in spam — they are entirely different sending infrastructure with different failure modes. This bit us directly during testing: we assumed fixing Resend would fix "email" broadly, and it does not.
- Supabase Auth's invite email is unbranded and not customizable via React Email templates the way the Resend-sent briefing email is — a lawyer or client's first email from the platform (the invite) looks nothing like their subsequent briefing emails.
- Because this split is emergent rather than designed, there is a real risk of someone "fixing" invite-email deliverability by pointing it at Resend too, without realizing the two flows share no code today — that would be a deliberate consolidation, not a bug fix, and should be treated as new work (a spec), not a quiet patch.
- No decision has been made about whether to consolidate these onto one provider. This ADR records the current state, not a recommendation to change it.
