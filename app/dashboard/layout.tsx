import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClientSidepanel } from './_components/client-sidepanel'
import { MobileDrawer } from './_components/mobile-drawer'

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
    <div className="flex h-screen bg-[var(--background)]">
      <aside className="hidden lg:flex w-72 shrink-0">
        <ClientSidepanel companyName={company?.name} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-[60px] bg-[var(--background)]/80 backdrop-blur-xl border-b border-primary/5 px-4 md:px-8 flex items-center justify-between shrink-0 z-40 sticky top-0"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <MobileDrawer companyName={company?.name} />
            <span className="lg:hidden text-lg font-serif font-bold text-primary tracking-tight truncate">
              {company?.name || 'RegWatch'}
            </span>
            <span className="hidden lg:block text-[13px] font-medium text-primary/50 tracking-wide">
              Welcome back, {profile?.first_name || 'there'}
            </span>
          </div>

          <Link
            href="/dashboard/profile"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-[12px] font-semibold text-white shadow hover:bg-accent transition-all active:scale-95 duration-200"
            aria-label="Profile"
          >
            {initials}
          </Link>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
