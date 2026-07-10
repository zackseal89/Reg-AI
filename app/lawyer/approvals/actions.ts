'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ApprovalItemRef = { id: string; kind: 'briefing' | 'document' }

// Redirect-free counterparts to approveBriefingAction / publishDocumentAction —
// this page keeps the user on /lawyer/approvals and updates in place instead of
// navigating away after every single approval, so triaging several items in a
// row doesn't bounce between pages.

async function approveOne(
  admin: SupabaseClient,
  userId: string,
  item: ApprovalItemRef
) {
  if (item.kind === 'briefing') {
    await admin
      .from('briefings')
      .update({
        status: 'approved',
        approved_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    await logAudit(admin, {
      userId,
      action: 'briefing_approved',
      entityType: 'briefing',
      entityId: item.id,
    })
  } else {
    await admin
      .from('documents')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', item.id)

    await logAudit(admin, {
      userId,
      action: 'document_published',
      entityType: 'document',
      entityId: item.id,
    })
  }
}

export async function approveApprovalItemAction(item: ApprovalItemRef) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await approveOne(admin, user.id, item)
}

export async function bulkApproveAction(items: ApprovalItemRef[]) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  for (const item of items) {
    await approveOne(admin, user.id, item)
  }
}
