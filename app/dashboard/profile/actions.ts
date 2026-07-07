'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) {
    redirect(
      '/dashboard/profile?error=' +
        encodeURIComponent('Password must be at least 8 characters.')
    )
  }
  if (password !== confirm) {
    redirect(
      '/dashboard/profile?error=' + encodeURIComponent('Passwords do not match.')
    )
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    redirect('/dashboard/profile?error=' + encodeURIComponent(error.message))
  }

  await logAudit(createAdminClient(), {
    userId: user.id,
    action: 'password_changed',
    entityType: 'profile',
    entityId: user.id,
  })

  redirect('/dashboard/profile?success=' + encodeURIComponent('Password updated.'))
}
