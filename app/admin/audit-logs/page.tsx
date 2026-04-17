import { createAdminClient } from '@/lib/supabase/admin'

const ACTION_LABELS: Record<string, string> = {
  client_created: 'Client Created',
  client_activated: 'Client Activated',
  client_suspended: 'Client Suspended',
  document_uploaded: 'Document Uploaded',
  document_assigned: 'Document Assigned',
  document_published: 'Document Published',
  briefing_created: 'Briefing Created',
  briefing_approved: 'Briefing Approved',
  briefing_sent: 'Briefing Sent',
  lawyer_created: 'Lawyer Created',
  lawyer_deactivated: 'Lawyer Deactivated',
  lawyer_reactivated: 'Lawyer Reactivated',
}

const ACTION_COLOURS: Record<string, string> = {
  client_created: 'bg-blue-50 text-blue-700 border-blue-200',
  client_activated: 'bg-green-50 text-green-700 border-green-200',
  client_suspended: 'bg-red-50 text-red-700 border-red-200',
  document_uploaded: 'bg-purple-50 text-purple-700 border-purple-200',
  document_assigned: 'bg-purple-50 text-purple-700 border-purple-200',
  document_published: 'bg-purple-50 text-purple-700 border-purple-200',
  briefing_created: 'bg-amber-50 text-amber-700 border-amber-200',
  briefing_approved: 'bg-green-50 text-green-700 border-green-200',
  briefing_sent: 'bg-green-50 text-green-700 border-green-200',
  lawyer_created: 'bg-blue-50 text-blue-700 border-blue-200',
  lawyer_deactivated: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  lawyer_reactivated: 'bg-green-50 text-green-700 border-green-200',
}

const PAGE_SIZE = 50

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; user?: string; page?: string }>
}) {
  const { action: actionFilter, user: userFilter, page: pageParam } = await searchParams
  const admin = createAdminClient()
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Fetch logs with performer profile
  let query = admin
    .from('audit_logs')
    .select(`
      id, action, entity_type, entity_id, details, created_at,
      profiles ( email, first_name, last_name, role )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (actionFilter) query = query.eq('action', actionFilter)
  if (userFilter) query = query.eq('user_id', userFilter)

  const [
    { data: logs, count },
    { data: performers },
  ] = await Promise.all([
    query,
    admin
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('role', ['admin', 'lawyer'])
      .order('first_name'),
  ])

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Audit Logs</h1>
          <p className="text-zinc-500">Every significant action on the platform, in order.</p>
        </div>
        <span className="text-sm text-zinc-500">{count ?? 0} total entries</span>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <select
          name="action"
          defaultValue={actionFilter ?? ''}
          className="px-3 py-2 text-sm border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        >
          <option value="">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          name="user"
          defaultValue={userFilter ?? ''}
          className="px-3 py-2 text-sm border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        >
          <option value="">All Users</option>
          {performers?.map(p => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Filter
        </button>
        {(actionFilter || userFilter) && (
          <a
            href="/admin/audit-logs"
            className="px-4 py-2 text-sm border border-black/10 rounded-md hover:bg-cream/50 transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Logs Table */}
      <div className="border border-black/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 border-b border-black/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Time</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
              <th className="text-left px-4 py-3 font-medium">Entity</th>
              <th className="text-left px-4 py-3 font-medium">Performed By</th>
              <th className="text-left px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                  No audit entries found.
                </td>
              </tr>
            )}
            {logs?.map(log => {
              const profile = log.profiles as unknown as { email: string; first_name: string; last_name: string; role: string } | null
              const colour = ACTION_COLOURS[log.action] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
              const label = ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')
              const details = log.details as Record<string, unknown> | null

              return (
                <tr key={log.id} className="border-b border-black/5 hover:bg-cream/30">
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    <div>{new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="text-xs text-zinc-400">{new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${colour}`}>
                      {label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    <div className="capitalize">{log.entity_type.replace(/_/g, ' ')}</div>
                    {log.entity_id && (
                      <div className="text-xs text-zinc-400 font-mono">{log.entity_id.slice(0, 8)}…</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {profile ? (
                      <>
                        <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                        <div className="text-xs text-zinc-400 capitalize">{profile.role}</div>
                      </>
                    ) : (
                      <span className="text-zinc-400">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px]">
                    {details
                      ? Object.entries(details)
                          .filter(([, v]) => v !== null && v !== undefined)
                          .map(([k, v]) => (
                            <div key={k}>
                              <span className="text-zinc-400">{k}: </span>
                              <span>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                            </div>
                          ))
                      : '—'
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/audit-logs?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), ...(userFilter ? { user: userFilter } : {}), page: String(page - 1) })}`}
                className="px-3 py-1.5 border border-black/10 rounded-md hover:bg-cream/50 transition-colors"
              >
                ← Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/audit-logs?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), ...(userFilter ? { user: userFilter } : {}), page: String(page + 1) })}`}
                className="px-3 py-1.5 border border-black/10 rounded-md hover:bg-cream/50 transition-colors"
              >
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
