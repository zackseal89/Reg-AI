import { createClient } from '@/lib/supabase/server'

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
    <div>
      <h1 className="text-3xl font-semibold mb-2">Lawyer Overview</h1>
      <p className="text-primary/70 mb-8">Manage clients, upload documents, and approve AI briefings.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/lawyer/briefings" className="p-6 border border-black/10 rounded-lg hover:border-accent/30 transition-colors">
          <h3 className="font-serif text-lg font-medium mb-2">Pending Briefings</h3>
          <p className="text-2xl font-semibold">{pendingBriefings ?? 0}</p>
        </a>
        <a href="/lawyer/clients" className="p-6 border border-black/10 rounded-lg hover:border-accent/30 transition-colors">
          <h3 className="font-serif text-lg font-medium mb-2">My Clients</h3>
          <p className="text-2xl font-semibold">{clientCount ?? 0}</p>
        </a>
        <a href="/lawyer/documents" className="p-6 border border-black/10 rounded-lg hover:border-accent/30 transition-colors">
          <h3 className="font-serif text-lg font-medium mb-2">Documents Uploaded</h3>
          <p className="text-2xl font-semibold">{docCount ?? 0}</p>
        </a>
      </div>
    </div>
  )
}
