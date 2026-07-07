'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function setPasswordAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=' + encodeURIComponent('Your session expired. Open the invite link again.'))
  }

  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) {
    redirect('/welcome?error=' + encodeURIComponent('Password must be at least 8 characters.'))
  }
  if (password !== confirm) {
    redirect('/welcome?error=' + encodeURIComponent('Passwords do not match.'))
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    redirect('/welcome?error=' + encodeURIComponent(error.message))
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  await logAudit(admin, {
    userId: user.id,
    action: 'password_set',
    entityType: 'profile',
    entityId: user.id,
  })

  const role = profile?.role || 'client'
  redirect(role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : '/dashboard')
}
