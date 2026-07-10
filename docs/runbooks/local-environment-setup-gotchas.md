---
last_verified: 2026-07-09
applies_to: local dev environment, .env.local, Turbopack
---

# Local environment setup gotchas

## Symptom 1: `/admin` and lawyer approve/send actions throw "supabaseKey is required"

```
Runtime Error
supabaseKey is required.
lib\supabase\admin.ts (5:22) @ createAdminClient
```

This crashes every page and Server Action that calls `createAdminClient()` — not just the obviously admin-only pages. `approveBriefingAction` and `sendBriefingAction` use it too, so lawyer workflows break the same way.

### Root cause

`SUPABASE_SERVICE_ROLE_KEY` is missing from `.env.local`. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` alone are enough to run `npm run dev` and browse client-facing pages, which makes it easy to think the environment is fully configured when it isn't — the failure only surfaces the first time something calls the admin/service-role client.

### Fix

1. Supabase dashboard → your project → **Project Settings → API**.
2. Copy the **`service_role`** key (not `anon`) — never commit this or paste it into a chat/PR.
3. Add `SUPABASE_SERVICE_ROLE_KEY=<key>` to `.env.local`.
4. Restart the dev server — see Symptom 2 below, a plain `Ctrl+C` + `npm run dev` is not always enough.

### How to confirm it's fixed

`/admin` loads without a runtime error dialog, and approving a draft briefing at `/lawyer/briefings` succeeds (status flips to `Approved`) instead of crashing.

---

## Symptom 2: Edited `app/globals.css` `@theme` tokens, but the browser still shows old colors after saving

Computed styles (`getComputedStyle(el).backgroundColor`) return the *old* value, and fetching the served CSS bundle directly shows it's missing the new `--color-*` custom properties entirely — even immediately after a fresh `npm run dev`.

### Root cause

A stale Turbopack build cache in `.next/`. This can persist across `npm run dev` restarts if the previous dev server process didn't actually terminate — on Windows, `pkill -f "next dev"` from Git Bash frequently fails to kill the real Node process because of how npm spawns child processes through `cmd.exe`. The result: a new `npm run dev` invocation silently fails to bind to port 3000 (already in use) while the *old*, stale server keeps serving requests, making it look like your edits aren't taking effect.

### Fix

1. Confirm what's actually listening on port 3000 (PowerShell, not Git Bash — more reliable on Windows):
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Get-Process -Id $_ }
   ```
2. Force-kill that specific PID:
   ```powershell
   Stop-Process -Id <pid> -Force
   ```
3. Delete the build cache: `rm -rf .next`
4. Start fresh: `npm run dev`

### How to confirm it's fixed

```js
getComputedStyle(document.documentElement).getPropertyValue('--color-sidebar')
```
returns the new value, and the served CSS chunk (check `document.querySelectorAll('link[rel=stylesheet]')`) contains your latest edit when fetched directly.
