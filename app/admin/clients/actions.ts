'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function activateClientAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clientId = formData.get('clientId') as string

  const { error } = await admin.auth.admin.updateUserById(clientId, {
    ban_duration: 'none',
  })

  if (error) redirect('/admin/clients?error=' + encodeURIComponent(error.message))

  await logAudit(admin, {
    userId: user.id,
    action: 'client_activated',
    entityType: 'profile',
    entityId: clientId,
  })

  redirect('/admin/clients')
}

export async function suspendClientAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clientId = formData.get('clientId') as string

  const { error } = await admin.auth.admin.updateUserById(clientId, {
    ban_duration: '876600h', // ~100 years
  })

  if (error) redirect('/admin/clients?error=' + encodeURIComponent(error.message))

  await logAudit(admin, {
    userId: user.id,
    action: 'client_suspended',
    entityType: 'profile',
    entityId: clientId,
  })

  redirect('/admin/clients')
}
