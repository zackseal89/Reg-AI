import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Select } from '@/components/ui/select'

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

const PAGE_SIZE = 50

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; user?: string; page?: string }>
}) {
  const {
    action: actionFilter,
    user: userFilter,
    page: pageParam,
  } = await searchParams
  const admin = createAdminClient()
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = admin
    .from('audit_logs')
    .select(
      `id, action, entity_type, entity_id, details, created_at,
      profiles ( email, first_name, last_name, role )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (actionFilter) query = query.eq('action', actionFilter)
  if (userFilter) query = query.eq('user_id', userFilter)

  const [{ data: logs, count }, { data: performers }] = await Promise.all([
    query,
    admin
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('role', ['admin', 'lawyer'])
      .order('first_name'),
  ])

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const hasFilters = Boolean(actionFilter || userFilter)

  const pageLink = (nextPage: number) => {
    const params = new URLSearchParams()
    if (actionFilter) params.set('action', actionFilter)
    if (userFilter) params.set('user', userFilter)
    params.set('page', String(nextPage))
    return `/admin/audit-logs?${params.toString()}`
  }

  const actionBadgeVariant = (
    action: string
  ): 'approved' | 'sent' | 'draft' | 'accent' | 'inactive' | 'default' => {
    if (
      action === 'briefing_sent' ||
      action === 'briefing_approved' ||
      action === 'client_activated' ||
      action === 'lawyer_reactivated' ||
      action === 'document_published'
    )
      return 'sent'
    if (
      action === 'client_suspended' ||
      action === 'lawyer_deactivated'
    )
      return 'accent'
    if (action === 'briefing_created' || action === 'document_uploaded')
      return 'draft'
    if (action === 'client_created' || action === 'lawyer_created')
      return 'approved'
    return 'default'
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Audit Logs"
        description="Every significant action on the platform, in order."
      >
        <span className="text-sm text-primary/50 font-medium">
          {count ?? 0} entries
        </span>
      </PageHeader>

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <div className="min-w-[200px]">
          <Select name="action" defaultValue={actionFilter ?? ''}>
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[200px]">
          <Select name="user" defaultValue={userFilter ?? ''}>
            <option value="">All users</option>
            {performers?.map(p => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Filter</Button>
        {hasFilters && (
          <Link href="/admin/audit-logs">
            <Button type="button" variant="outline">
              Clear
            </Button>
          </Link>
        )}
      </form>

      {!logs || logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="w-6 h-6" />}
          title="No audit entries"
          description={
            hasFilters
              ? 'No entries match the current filters.'
              : 'Activity will appear here as lawyers and admins use the platform.'
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02] border-b border-primary/5">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Time
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Action
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Entity
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Performed By
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {logs.map(log => {
                const profile = log.profiles as unknown as {
                  email: string
                  first_name: string
                  last_name: string
                  role: string
                } | null
                const label =
                  ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')
                const details = log.details as Record<string, unknown> | null

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-primary/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5 text-sm text-primary/50 whitespace-nowrap">
                      <div className="text-primary/70 font-medium">
                        {new Date(log.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-primary/40">
                        {new Date(log.created_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={actionBadgeVariant(log.action)}>
                        {label}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="capitalize text-primary/70">
                        {log.entity_type.replace(/_/g, ' ')}
                      </div>
                      {log.entity_id && (
                        <div className="text-xs text-primary/40 font-mono mt-0.5">
                          {log.entity_id.slice(0, 8)}…
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {profile ? (
                        <>
                          <div className="font-medium text-primary">
                            {profile.first_name} {profile.last_name}
                          </div>
                          <div className="text-xs text-primary/50 capitalize mt-0.5">
                            {profile.role}
                          </div>
                        </>
                      ) : (
                        <span className="text-primary/40">System</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-xs text-primary/60 max-w-[240px]">
                      {details
                        ? Object.entries(details)
                            .filter(([, v]) => v !== null && v !== undefined)
                            .map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="text-primary/40">{k}: </span>
                                <span className="text-primary/70 font-medium">
                                  {Array.isArray(v) ? v.join(', ') : String(v)}
                                </span>
                              </div>
                            ))
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-primary/50">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageLink(page - 1)}>
                <Button variant="outline" size="sm">
                  ← Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={pageLink(page + 1)}>
                <Button variant="outline" size="sm">
                  Next →
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
