'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function createBriefingAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const jurisdictionId = formData.get('jurisdictionId') as string
  const clientIds = formData.getAll('clientIds') as string[]

  // Create briefing
  const { data: briefing, error } = await admin
    .from('briefings')
    .insert({
      title,
      content,
      status: 'draft',
      jurisdiction_id: jurisdictionId,
      author_id: user.id,
    })
    .select('id')
    .single()

  if (error) {
    redirect('/lawyer/briefings?error=' + encodeURIComponent(error.message))
  }

  // Assign to clients
  if (clientIds.length > 0) {
    const rows = clientIds.map(cId => ({
      briefing_id: briefing.id,
      client_id: cId,
    }))
    await admin.from('briefing_assignments').insert(rows)
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'briefing_created',
    entityType: 'briefing',
    entityId: briefing.id,
    details: { title, jurisdiction_id: jurisdictionId, assigned_clients: clientIds },
  })

  redirect('/lawyer/briefings?success=' + encodeURIComponent('Briefing created'))
}

export async function approveBriefingAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const briefingId = formData.get('briefingId') as string

  const { error } = await admin
    .from('briefings')
    .update({
      status: 'approved',
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', briefingId)

  if (error) {
    redirect('/lawyer/briefings?error=' + encodeURIComponent(error.message))
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'briefing_approved',
    entityType: 'briefing',
    entityId: briefingId,
  })

  redirect('/lawyer/briefings?success=' + encodeURIComponent('Briefing approved'))
}

export async function sendBriefingAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const briefingId = formData.get('briefingId') as string

  const { error } = await admin
    .from('briefings')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', briefingId)

  if (error) {
    redirect('/lawyer/briefings?error=' + encodeURIComponent(error.message))
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'briefing_sent',
    entityType: 'briefing',
    entityId: briefingId,
  })

  // Email delivery is handled by the on_briefing_sent Edge Function (REG-13)
  redirect('/lawyer/briefings?success=' + encodeURIComponent('Briefing sent to clients'))
}

export async function rejectBriefingAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const briefingId = formData.get('briefingId') as string

  const { error } = await admin
    .from('briefings')
    .update({
      status: 'draft',
      approved_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', briefingId)

  if (error) {
    redirect('/lawyer/briefings?error=' + encodeURIComponent(error.message))
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'briefing_rejected',
    entityType: 'briefing',
    entityId: briefingId,
  })

  redirect('/lawyer/briefings?success=' + encodeURIComponent('Briefing returned to draft'))
}
