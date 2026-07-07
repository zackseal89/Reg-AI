import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'

export default async function DashboardLayout({
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
    .select('first_name, last_name, companies ( name, sector )')
    .eq('id', user.id)
    .single()

  const company = profile?.companies as unknown as {
    name: string
    sector: string
  } | null

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || '?'

  return (
    <AppShell
      role="client"
      companyName={company?.name}
      displayName={profile?.first_name || 'there'}
      initials={initials}
    >
      {children}
    </AppShell>
  )
}
