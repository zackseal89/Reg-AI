import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { BriefingEmail } from './_templates/briefing.tsx'

// ---------------------------------------------------------------------------
// on_briefing_sent — Phase B email delivery.
//
// Trigger: Supabase DB webhook on briefings UPDATE where status -> 'sent'.
// Configured in Supabase dashboard (not in a migration). Send Option B is
// the chosen flow (separate Approve and Send clicks) — see REG-13.
// ---------------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const APP_URL = Deno.env.get('APP_URL') ?? 'https://www.regwatchmnl.net'
const FROM_ADDRESS = Deno.env.get('RESEND_FROM') ?? 'RegWatch <briefings@mnladvocates.com>'
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') // optional shared-secret check

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const resend = new Resend(RESEND_API_KEY)

interface BriefingRecord {
  id: string
  title: string
  content: string
  status: string
  sent_at: string | null
  approved_by: string | null
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: BriefingRecord | null
  old_record: BriefingRecord | null
}

Deno.serve(async (req) => {
  // Optional shared-secret guard — pair this with a custom header on the webhook.
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get('x-webhook-secret')
    if (provided !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // Idempotency: only proceed on a transition INTO 'sent'.
  if (
    payload.type !== 'UPDATE' ||
    payload.table !== 'briefings' ||
    !payload.record ||
    payload.record.status !== 'sent' ||
    payload.old_record?.status === 'sent'
  ) {
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const briefingId = payload.record.id
  const briefingTitle = payload.record.title
  const briefingContent = payload.record.content
  const approvedBy = payload.record.approved_by

  // Fetch assigned recipients
  const { data: assignments, error: assignErr } = await supabase
    .from('briefing_assignments')
    .select('client_id, profiles:client_id(id, email, first_name)')
    .eq('briefing_id', briefingId)

  if (assignErr) {
    console.error('[on_briefing_sent] assignments fetch failed:', assignErr.message)
    return new Response(JSON.stringify({ error: assignErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!assignments || assignments.length === 0) {
    await supabase.from('audit_logs').insert({
      user_id: approvedBy,
      action: 'briefing_email_skipped_no_recipients',
      entity_type: 'briefing',
      entity_id: briefingId,
    })
    return new Response(JSON.stringify({ sent: 0, reason: 'no recipients' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let sent = 0
  let failed = 0

  for (const row of assignments) {
    const profile = (row as unknown as {
      profiles: { id: string; email: string; first_name: string | null } | null
    }).profiles
    if (!profile?.email) {
      failed++
      continue
    }

    try {
      const html = await renderAsync(
        React.createElement(BriefingEmail, {
          clientName: profile.first_name ?? 'Client',
          briefingTitle,
          briefingContent,
          briefingId,
          dashboardUrl: APP_URL,
        }),
      )

      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [profile.email],
        subject: briefingTitle,
        html,
      })

      if (error) throw error

      await supabase.from('audit_logs').insert({
        user_id: approvedBy,
        action: 'briefing_email_sent',
        entity_type: 'briefing',
        entity_id: briefingId,
        details: {
          recipient_id: profile.id,
          recipient_email: profile.email,
          resend_message_id: data?.id ?? null,
          success: true,
        },
      })
      sent++
    } catch (err) {
      const message = (err as Error).message ?? String(err)
      console.error('[on_briefing_sent] send failed for', profile.email, message)
      await supabase.from('audit_logs').insert({
        user_id: approvedBy,
        action: 'briefing_email_failed',
        entity_type: 'briefing',
        entity_id: briefingId,
        details: {
          recipient_id: profile.id,
          recipient_email: profile.email,
          error: message,
          success: false,
        },
      })
      failed++
    }
  }

  return new Response(
    JSON.stringify({ briefing_id: briefingId, sent, failed, total: assignments.length }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
