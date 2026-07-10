---
last_verified: 2026-07-09
applies_to: supabase/functions/on_briefing_sent, Resend
---

# Debugging failed briefing emails

## Symptom

A lawyer approves and sends a briefing (`sendBriefingAction` flips `briefings.status` to `sent`), but the client reports never receiving an email. In `audit_logs`, filtering by action `Briefing Email Failed` shows one row per recipient with `success: false` and one of:

```
The regwatchmnl.net domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

or, on Resend accounts that haven't set a `from` domain at all:

```
You can only send testing emails to your own email address (<account-owner-email>). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.
```

## Root cause

This is not a bug in `on_briefing_sent` — the webhook fires correctly, the function runs, and it calls the Resend API correctly. The pipeline works end-to-end; delivery fails because the **Resend account has no verified sending domain**, which puts it in sandbox mode. In sandbox mode, Resend only accepts sends to the exact email address that owns the Resend account — no exceptions, and no alias matching. A Gmail `+alias` (e.g. `owner+test@gmail.com`) does **not** count as "your own address" even though Gmail delivers it to the same inbox — Resend does an exact string match on the recipient address, not alias folding.

Every `Briefing Sent` audit log entry has a corresponding `Briefing Email Failed` entry per recipient whose address doesn't exactly match the account owner's — this is the reliable way to confirm the pipeline itself is healthy even when zero real clients have received email yet.

## Fix

1. Go to [resend.com/domains](https://resend.com/domains).
2. Add the domain used in `RESEND_FROM` (check the Supabase Edge Function's environment — the code default is `RegWatch <briefings@mnladvocates.com>`, but a project-specific `RESEND_FROM` secret can override this; the exact domain in the error message tells you which one is actually configured).
3. Add the SPF and DKIM DNS records Resend provides, at the domain's DNS provider.
4. Wait for Resend to confirm verification (usually minutes, can take longer depending on DNS propagation).
5. No code changes needed — once verified, the exact same `on_briefing_sent` function will deliver to any recipient.

## How to confirm it's fixed

Send a real briefing to a real client address and check `audit_logs` for a `Briefing Email Sent` entry (not `Failed`) with `success: true` and a populated `resend_message_id` in `details`. That message ID is proof Resend accepted the send, independent of whether you can check the recipient's actual inbox.
