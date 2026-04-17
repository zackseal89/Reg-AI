import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalClients },
    { count: activeLawyers },
    { count: docsPublished },
    { count: briefingsSent },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lawyer'),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
  ])

  const metrics = [
    { label: 'Total Clients', value: totalClients ?? 0 },
    { label: 'Active Lawyers', value: activeLawyers ?? 0 },
    { label: 'Docs Published', value: docsPublished ?? 0 },
    { label: 'Briefings Sent', value: briefingsSent ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Platform Metrics</h1>
      <p className="text-zinc-500 mb-8">Overview of system usage, active clients, and audit trails.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map(({ label, value }) => (
          <div key={label} className="p-6 border border-black/10 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">{label}</h3>
            <p className="text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
