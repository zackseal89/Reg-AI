import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'lawyer' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const [{ count: draftBriefings }, { count: assignedDocs }, { data: latestClient }] =
    await Promise.all([
      supabase
        .from('briefings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft'),
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'assigned'),
      supabase
        .from('profiles')
        .select('companies ( name )')
        .eq('role', 'client')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  const currentClient = latestClient?.companies as unknown as {
    name: string
  } | null

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || '?'

  return (
    <AppShell
      role="lawyer"
      companyName={currentClient?.name}
      userEmail={profile?.email}
      displayName={
        [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
        profile?.email
      }
      roleLabel={profile?.role === 'admin' ? 'System Administrator' : 'Lawyer'}
      initials={initials}
      counts={{ approvals: (draftBriefings ?? 0) + (assignedDocs ?? 0) }}
    >
      {children}
    </AppShell>
  )
}
