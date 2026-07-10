---
last_verified: 2026-07-09
applies_to: scripts/seed-test-users.ts
---

# Seeding test users

## Symptom

A fresh (or wiped) Supabase project has no data — there's nothing to log in as, no client company, no jurisdiction to assign, and manually clicking through the admin UI to create an admin/lawyer/client chain from scratch is slow and easy to get wrong.

## Root cause

There's no default seed data. `scripts/seed-test-users.ts` exists specifically to create a full, working three-role account chain in one run, but it's easy to not know it exists or to forget it needs three separate env vars to fully succeed.

## Fix

Run:
```bash
npm run seed:test
```
which invokes `npx tsx scripts/seed-test-users.ts`. Required environment variables (read directly from `.env.local` or your shell):
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — required; the script exits immediately with an error if either is missing.
- `GEMINI_API_KEY` — optional. If absent, the script skips FileSearchStore creation with a `[skip] GEMINI_API_KEY not set` log line and continues; everything else still gets created.

The script is **idempotent** — it checks for existing auth users, profiles, the company, and the jurisdiction link before creating anything, logging `[skip] ...already exists` and moving on rather than erroring or duplicating. Safe to re-run.

It creates exactly these accounts (quoted from the script's own printed summary):
```
  Role    Email                          Password
  ------  -----------------------------  -----------
  Admin   zacharyongeri121@gmail.com     Admin2026!
  Lawyer  lawyer@mnladvocates.com        Lawyer2026!
  Client  james@paystackkenya.com        Client2026!
```
plus a "Paystack Kenya" (Fintech) company for the client, linked to the CBK jurisdiction, and CBK/ODPC jurisdiction rows if they don't already exist.

## How to confirm it's fixed

The script prints `=== Test Accounts Ready ===` followed by the account table above and a suggested test flow (upload a document as the lawyer, ask about it as the client, verify audit log entries as the admin). You should be able to sign in at `/login`, `/lawyer-login`, and `/admin-login` with the three respective accounts immediately after the script completes.
