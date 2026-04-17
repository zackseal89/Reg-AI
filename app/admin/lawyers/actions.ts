'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function inviteLawyerAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email = formData.get('email') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name: firstName, last_name: lastName },
  })

  if (authError) redirect('/admin/lawyers?error=' + encodeURIComponent(authError.message))

  const { error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    role: 'lawyer',
  })

  if (profileError) redirect('/admin/lawyers?error=' + encodeURIComponent(profileError.message))

  await logAudit(admin, {
    userId: user.id,
    action: 'lawyer_created',
    entityType: 'profile',
    entityId: authData.user.id,
    details: { email, first_name: firstName, last_name: lastName },
  })

  redirect('/admin/lawyers')
}

export async function deactivateLawyerAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const lawyerId = formData.get('lawyerId') as string

  const { error } = await admin.auth.admin.updateUserById(lawyerId, {
    ban_duration: '876600h', // ~100 years
  })

  if (error) redirect('/admin/lawyers?error=' + encodeURIComponent(error.message))

  await logAudit(admin, {
    userId: user.id,
    action: 'lawyer_deactivated',
    entityType: 'profile',
    entityId: lawyerId,
  })

  redirect('/admin/lawyers')
}

export async function reactivateLawyerAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const lawyerId = formData.get('lawyerId') as string

  const { error } = await admin.auth.admin.updateUserById(lawyerId, {
    ban_duration: 'none',
  })

  if (error) redirect('/admin/lawyers?error=' + encodeURIComponent(error.message))

  await logAudit(admin, {
    userId: user.id,
    action: 'lawyer_reactivated',
    entityType: 'profile',
    entityId: lawyerId,
  })

  redirect('/admin/lawyers')
}
