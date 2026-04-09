## Project: RegWatch
Law firm regulatory intelligence platform — MNL Advocates

## Stack
- Next.js 14 App Router
- Supabase (auth, db, storage, pgvector, edge functions)
- Claude API (claude-sonnet-4-20250514)
- Resend + React Email
- Tailwind CSS
- Deployed on Vercel

## Roles
- Admin: full access
- Lawyer: onboard clients, upload docs, approve briefings
- Client: view dashboard, briefings, docs, AI chat

## Rules
- Nothing reaches a client without lawyer approval
- Jurisdiction gating enforced at DB level via RLS, not just UI
- Jurisdictions at launch: CBK, ODPC only
- No self-signup — lawyer-initiated onboarding only
- No WhatsApp, no CMA, no payment rails in MVP

## Status flows
- Client: pending → active → suspended
- Briefing: draft → approved → sent
- Document: uploaded → assigned → published

## Environment variables needed
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY
- RESEND_API_KEY
