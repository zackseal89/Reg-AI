import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MoreHorizontal, Users } from 'lucide-react'
import {
  createClientAction,
  activateClientAction,
  suspendClientAction,
} from './actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { CreateClientModal } from '@/components/modals/create-client-modal'
import { ConfirmModal } from '@/components/modals/confirm-modal'

export default async function LawyerClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select(
      `id, email, first_name, last_name, created_at,
      companies ( name, sector ),
      client_jurisdictions ( jurisdictions ( name ) )`
    )
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Client Portfolio"
        description="Onboard and manage your client organisations."
      >
        <CreateClientModal
          jurisdictions={jurisdictions ?? []}
          action={createClientAction}
        />
      </PageHeader>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {!clients || clients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No clients yet"
          description="Onboard your first client to start building their regulatory portal."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02] border-b border-primary/5">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Contact
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Company
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Regulators
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Added
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {clients.map(client => {
                const company = client.companies as unknown as {
                  name: string
                  sector: string
                } | null
                const cjs = client.client_jurisdictions as unknown as {
                  jurisdictions: { name: string }
                }[] | null
                const jurisdictionNames =
                  cjs?.map(cj => cj.jurisdictions.name) ?? []

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-primary/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="font-medium text-primary">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-primary/50 text-xs mt-0.5">
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-primary">
                        {company?.name || '—'}
                      </div>
                      {company?.sector && (
                        <div className="text-xs text-primary/50 mt-0.5">
                          {company.sector}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {jurisdictionNames.length > 0 ? (
                          jurisdictionNames.map(j => (
                            <Badge key={j}>{j}</Badge>
                          ))
                        ) : (
                          <span className="text-primary/30">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-primary/50">
                      {new Date(client.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link
                          href={`/lawyer/clients/${client.id}/onboarding`}
                        >
                          <Button variant="subtle" size="sm">
                            Onboarding
                          </Button>
                        </Link>
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
                            <ConfirmModal
                              title="Activate client account?"
                              description={`Confirm the email for ${client.first_name} ${client.last_name} so they can sign in.`}
                              confirmLabel="Activate"
                              hiddenFields={{ clientId: client.id }}
                              action={activateClientAction}
                              trigger={
                                <DropdownMenuItem
                                  onSelect={e => e.preventDefault()}
                                >
                                  Activate account
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuSeparator />
                            <ConfirmModal
                              title="Suspend client?"
                              description={`${client.first_name} ${client.last_name} will lose access until reactivated.`}
                              confirmLabel="Suspend"
                              destructive
                              hiddenFields={{ clientId: client.id }}
                              action={suspendClientAction}
                              trigger={
                                <DropdownMenuItem
                                  destructive
                                  onSelect={e => e.preventDefault()}
                                >
                                  Suspend
                                </DropdownMenuItem>
                              }
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
