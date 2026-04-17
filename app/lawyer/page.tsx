import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LawyerPage() {
  const supabase = await createClient()

  const [
    { count: clientCount },
    { count: pendingBriefings },
    { count: docCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-serif font-bold text-primary mb-3">Lawyer Overview</h1>
      <p className="text-[15px] text-primary/60 mb-10 pb-6 border-b border-primary/5">
        Manage your clients, verify regulatory intelligence, and distribute briefings securely.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/lawyer/briefings" className="group p-6 bg-white border border-primary/10 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.12)] hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="font-sans text-[13px] font-bold tracking-widest uppercase text-primary/50 mb-3 group-hover:text-accent transition-colors">Pending Briefings</h3>
          <p className="text-4xl font-serif text-primary group-hover:text-accent transition-colors">{pendingBriefings ?? 0}</p>
          <div className="w-8 h-1 bg-accent/20 mt-6 rounded-full group-hover:w-full group-hover:bg-accent/40 transition-all duration-500" />
        </Link>
        <Link href="/lawyer/clients" className="group p-6 bg-white border border-primary/10 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.12)] hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="font-sans text-[13px] font-bold tracking-widest uppercase text-primary/50 mb-3 group-hover:text-primary transition-colors">Active Clients</h3>
          <p className="text-4xl font-serif text-primary">{clientCount ?? 0}</p>
          <div className="w-8 h-1 bg-primary/20 mt-6 rounded-full group-hover:w-full transition-all duration-500" />
        </Link>
        <Link href="/lawyer/documents" className="group p-6 bg-white border border-primary/10 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.12)] hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="font-sans text-[13px] font-bold tracking-widest uppercase text-primary/50 mb-3 group-hover:text-primary transition-colors">Total Documents</h3>
          <p className="text-4xl font-serif text-primary">{docCount ?? 0}</p>
          <div className="w-8 h-1 bg-primary/20 mt-6 rounded-full group-hover:w-full transition-all duration-500" />
        </Link>
      </div>
    </div>
  )
}
