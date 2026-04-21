import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './admin-nav'
import { PortalBadge } from '@/components/ui/portal-badge'

export default async function AdminLayout({
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
    .select('role, first_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <aside className="w-64 bg-zinc-950 text-white flex flex-col border-r border-black shadow-2xl relative z-10 overflow-hidden">
        <div className="px-6 py-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(139,28,63,0.8)]" />
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              RegWatch
            </h2>
          </div>
          <span className="text-accent text-[11px] font-bold uppercase tracking-widest block ml-4">
            Admin Operations
          </span>
        </div>

        <AdminNav />

        <div className="p-6 border-t border-white/5 bg-black/30 relative">
          <span className="text-[11px] text-white/50 block mb-1 uppercase tracking-widest font-semibold">
            Signed in as
          </span>
          <span
            className="text-sm font-medium text-white/90 truncate block"
            title={profile?.email}
          >
            {profile?.email}
          </span>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white/60 m-3 md:m-4 rounded-xl shadow-lg border border-primary/10 relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10 rounded-xl" />
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 md:px-10 pt-5 pb-3 border-b border-primary/5 bg-white/50 backdrop-blur rounded-t-xl">
          <PortalBadge variant="admin" tone="light" />
          <span
            className="font-sans text-[11px] text-primary/45 tracking-widest uppercase truncate max-w-[60%]"
            title={profile?.email}
          >
            {profile?.email}
          </span>
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  )
}
