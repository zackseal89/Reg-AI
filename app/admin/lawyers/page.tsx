import { createAdminClient } from '@/lib/supabase/admin'
import { MoreHorizontal, Scale } from 'lucide-react'
import {
  inviteLawyerAction,
  deactivateLawyerAction,
  reactivateLawyerAction,
} from './actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { InviteLawyerModal } from '@/components/modals/invite-lawyer-modal'
import { ConfirmModal } from '@/components/modals/confirm-modal'

export default async function AdminLawyersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const admin = createAdminClient()

  const [
    { data: lawyers },
    {
      data: { users: authUsers },
    },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id, email, first_name, last_name, created_at')
      .eq('role', 'lawyer')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const authMap = new Map(
    (authUsers ?? []).map(u => [
      u.id,
      u.banned_until && new Date(u.banned_until) > new Date()
        ? 'inactive'
        : 'active',
    ])
  )

  const { data: lawyerClientLogs } = await admin
    .from('audit_logs')
    .select('user_id')
    .eq('action', 'client_created')

  const clientsPerLawyer = new Map<string, number>()
  for (const log of lawyerClientLogs ?? []) {
    clientsPerLawyer.set(
      log.user_id,
      (clientsPerLawyer.get(log.user_id) ?? 0) + 1
    )
  }

  const enriched = (lawyers ?? []).map(l => ({
    ...l,
    status: (authMap.get(l.id) ?? 'active') as 'active' | 'inactive',
    clientCount: clientsPerLawyer.get(l.id) ?? 0,
  }))

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Lawyers"
        description="Manage MNL Associates accounts and access."
      >
        <InviteLawyerModal action={inviteLawyerAction} />
      </PageHeader>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {enriched.length === 0 ? (
        <EmptyState
          icon={<Scale className="w-6 h-6" />}
          title="No lawyer accounts yet"
          description="Invite your first MNL Associate to start delegating client work."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02] border-b border-primary/5">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Lawyer
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Clients Managed
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Joined
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {enriched.map(lawyer => (
                <tr
                  key={lawyer.id}
                  className="hover:bg-primary/[0.02] transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="font-medium text-primary">
                      {lawyer.first_name} {lawyer.last_name}
                    </div>
                    <div className="text-primary/50 text-xs mt-0.5">
                      {lawyer.email}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-primary/70 font-medium">
                    {lawyer.clientCount}
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      variant={lawyer.status === 'active' ? 'active' : 'inactive'}
                    >
                      {lawyer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-sm text-primary/50">
                    {new Date(lawyer.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 rounded-lg text-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {lawyer.status === 'active' ? (
                            <ConfirmModal
                              title="Deactivate lawyer?"
                              description={`${lawyer.first_name} ${lawyer.last_name} will lose platform access until reactivated.`}
                              confirmLabel="Deactivate"
                              destructive
                              hiddenFields={{ lawyerId: lawyer.id }}
                              action={deactivateLawyerAction}
                              trigger={
                                <DropdownMenuItem
                                  destructive
                                  onSelect={e => e.preventDefault()}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              }
                            />
                          ) : (
                            <ConfirmModal
                              title="Reactivate lawyer?"
                              description={`Restore platform access for ${lawyer.first_name} ${lawyer.last_name}.`}
                              confirmLabel="Reactivate"
                              hiddenFields={{ lawyerId: lawyer.id }}
                              action={reactivateLawyerAction}
                              trigger={
                                <DropdownMenuItem
                                  onSelect={e => e.preventDefault()}
                                >
                                  Reactivate
                                </DropdownMenuItem>
                              }
                            />
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
