---
last_verified: 2026-07-09
applies_to: supabase/functions/, Supabase Database Webhooks
---

# Deploying Edge Functions

## Symptom

You've changed `supabase/functions/on_document_upload/index.ts` or `supabase/functions/on_briefing_sent/index.ts`, or briefings are marked `sent` in the database but no email arrives, and you need to (re)deploy the function and confirm it's actually the code you think it is.

## Root cause

Edge Functions are deployed independently of the Next.js app — a Vercel deploy of the frontend does **not** redeploy them. They also don't participate in `npx tsc --noEmit`: `tsconfig.json` explicitly excludes `supabase/functions/**/*`, because these files run on **Deno**, not Node, and use `npm:`/`jsr:` module specifiers (`npm:resend@4.0.0`, `jsr:@supabase/supabase-js@2`) that Node's TypeScript resolution doesn't understand. A clean `tsc` run tells you nothing about whether these functions compile or run correctly.

`on_briefing_sent` specifically only runs when triggered — a Supabase **Database Webhook** on the `briefings` table (UPDATE event), configured in the Supabase dashboard, not in a migration file. If that webhook was never created, or was pointed at the wrong function, deploying the function itself changes nothing observable.

## Fix

1. Deploy the function(s) that changed:
   ```bash
   supabase functions deploy on_document_upload
   supabase functions deploy on_briefing_sent
   ```
2. If this is a fresh environment or the webhook doesn't exist yet, create it in the Supabase dashboard: **Database → Webhooks** → new webhook on `briefings`, event `UPDATE`, pointed at the `on_briefing_sent` function's invoke URL.
3. The function reads a shared secret via `Deno.env.get('WEBHOOK_SECRET')` and checks it against the `x-webhook-secret` request header (see `index.ts:44-49`) — if `WEBHOOK_SECRET` is set as a Function secret, the webhook configuration in the dashboard must send that same value in an `x-webhook-secret` header, or every invocation gets a `401 Unauthorized`.
4. The webhook secret itself is read from **Supabase Vault**, not a Postgres GUC (`current_setting`) — see commit `e76c491` for the fix that changed this. If secrets aren't resolving, confirm they're set as Function secrets (`supabase secrets set ...` or via the dashboard's Edge Functions → Secrets panel), not as a database configuration parameter.

## How to confirm it's fixed

Approve and send a test briefing, then check the `audit_logs` table for a `briefing_sent` entry followed by either `briefing_email_sent` (with `success: true` and a `resend_message_id`) or `briefing_email_failed` (with the specific error — see `docs/runbooks/debugging-failed-briefing-emails.md` if it's a Resend domain-verification error, which is a separate problem from the function being deployed correctly). Getting *any* `briefing_email_*` entry at all — sent or failed — confirms the webhook fired and the function ran; getting neither means the webhook isn't wired up.
