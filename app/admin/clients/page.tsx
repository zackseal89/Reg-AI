import { createAdminClient } from '@/lib/supabase/admin'
import { activateClientAction, suspendClientAction } from './actions'

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; jurisdiction?: string; status?: string }>
}) {
  const { error, jurisdiction: jurisdictionFilter, status: statusFilter } = await searchParams
  const admin = createAdminClient()

  const [
    { data: clients },
    { data: { users: authUsers } },
    { data: jurisdictions },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select(`
        id, email, first_name, last_name, created_at,
        companies ( name, sector ),
        client_jurisdictions ( jurisdictions ( id, name ) )
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('jurisdictions').select('id, name').order('name'),
  ])

  // Build a map of auth user ban status
  const authMap = new Map(
    (authUsers ?? []).map(u => [
      u.id,
      u.banned_until && new Date(u.banned_until) > new Date() ? 'suspended' : 'active',
    ])
  )

  // Flatten clients with status
  const enriched = (clients ?? []).map(c => {
    const company = c.companies as unknown as { name: string; sector: string } | null
    const cjs = c.client_jurisdictions as unknown as { jurisdictions: { id: string; name: string } }[] | null
    return {
      ...c,
      company,
      jurisdictions: cjs?.map(cj => cj.jurisdictions) ?? [],
      status: authMap.get(c.id) ?? 'active',
    }
  })

  // Apply filters
  const filtered = enriched.filter(c => {
    if (jurisdictionFilter && !c.jurisdictions.some(j => j.id === jurisdictionFilter)) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">All Clients</h1>
          <p className="text-zinc-500">Platform-wide client accounts across all lawyers.</p>
        </div>
        <span className="text-sm text-zinc-500">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <select
          name="jurisdiction"
          defaultValue={jurisdictionFilter ?? ''}
          className="px-3 py-2 text-sm border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        >
          <option value="">All Jurisdictions</option>
          {jurisdictions?.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={statusFilter ?? ''}
          className="px-3 py-2 text-sm border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Filter
        </button>
        {(jurisdictionFilter || statusFilter) && (
          <a href="/admin/clients" className="px-4 py-2 text-sm border border-black/10 rounded-md hover:bg-cream/50 transition-colors">
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="border border-black/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 border-b border-black/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Company</th>
              <th className="text-left px-4 py-3 font-medium">Jurisdictions</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                  No clients found.
                </td>
              </tr>
            )}
            {filtered.map(client => (
              <tr key={client.id} className="border-b border-black/5 hover:bg-cream/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{client.first_name} {client.last_name}</div>
                  <div className="text-zinc-400 text-xs">{client.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{client.company?.name ?? '—'}</div>
                  {client.company?.sector && (
                    <div className="text-zinc-400 text-xs">{client.company.sector}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {client.jurisdictions.length > 0
                      ? client.jurisdictions.map(j => (
                          <span key={j.id} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                            {j.name}
                          </span>
                        ))
                      : <span className="text-zinc-400">—</span>
                    }
                  </div>
                </td>
                <td className="px-4 py-3">
                  {client.status === 'active' ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                      Suspended
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(client.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {client.status === 'suspended' && (
                      <form action={activateClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                        >
                          Activate
                        </button>
                      </form>
                    )}
                    {client.status === 'active' && (
                      <form action={suspendClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
                        >
                          Suspend
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
