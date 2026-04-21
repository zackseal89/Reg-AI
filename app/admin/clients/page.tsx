import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MoreHorizontal, Users } from 'lucide-react'
import { activateClientAction, suspendClientAction } from './actions'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ConfirmModal } from '@/components/modals/confirm-modal'

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    jurisdiction?: string
    status?: string
  }>
}) {
  const {
    error,
    jurisdiction: jurisdictionFilter,
    status: statusFilter,
  } = await searchParams
  const admin = createAdminClient()

  const [
    { data: clients },
    {
      data: { users: authUsers },
    },
    { data: jurisdictions },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select(
        `id, email, first_name, last_name, created_at,
        companies ( name, sector ),
        client_jurisdictions ( jurisdictions ( id, name ) )`
      )
      .eq('role', 'client')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('jurisdictions').select('id, name').order('name'),
  ])

  const authMap = new Map(
    (authUsers ?? []).map(u => [
      u.id,
      u.banned_until && new Date(u.banned_until) > new Date()
        ? 'suspended'
        : 'active',
    ])
  )

  const enriched = (clients ?? []).map(c => {
    const company = c.companies as unknown as {
      name: string
      sector: string
    } | null
    const cjs = c.client_jurisdictions as unknown as {
      jurisdictions: { id: string; name: string }
    }[] | null
    return {
      ...c,
      company,
      jurisdictions: cjs?.map(cj => cj.jurisdictions) ?? [],
      status: (authMap.get(c.id) ?? 'active') as 'active' | 'suspended',
    }
  })

  const filtered = enriched.filter(c => {
    if (
      jurisdictionFilter &&
      !c.jurisdictions.some(j => j.id === jurisdictionFilter)
    )
      return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  const filterLink = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = {
      jurisdiction: jurisdictionFilter,
      status: statusFilter,
      ...next,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `/admin/clients${qs ? `?${qs}` : ''}`
  }

  const hasFilters = Boolean(jurisdictionFilter || statusFilter)

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="All Clients"
        description="Platform-wide client accounts across every lawyer."
      >
        <span className="text-sm text-primary/50 font-medium">
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </span>
      </PageHeader>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] font-bold text-primary/50 uppercase tracking-widest mr-2">
          Status
        </span>
        <FilterChip href={filterLink({ status: undefined })} active={!statusFilter}>
          All
        </FilterChip>
        <FilterChip
          href={filterLink({ status: 'active' })}
          active={statusFilter === 'active'}
        >
          Active
        </FilterChip>
        <FilterChip
          href={filterLink({ status: 'suspended' })}
          active={statusFilter === 'suspended'}
        >
          Suspended
        </FilterChip>

        <span className="mx-2 h-4 w-px bg-primary/10" />

        <span className="text-[11px] font-bold text-primary/50 uppercase tracking-widest mr-2">
          Jurisdiction
        </span>
        <FilterChip
          href={filterLink({ jurisdiction: undefined })}
          active={!jurisdictionFilter}
        >
          All
        </FilterChip>
        {jurisdictions?.map(j => (
          <FilterChip
            key={j.id}
            href={filterLink({ jurisdiction: j.id })}
            active={jurisdictionFilter === j.id}
          >
            {j.name}
          </FilterChip>
        ))}

        {hasFilters && (
          <Link href="/admin/clients" className="ml-auto">
            <Button variant="ghost" size="sm">
              Clear
            </Button>
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No clients match"
          description={
            hasFilters
              ? 'Adjust or clear filters to see more clients.'
              : 'Lawyers haven’t onboarded any clients yet.'
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02] border-b border-primary/5">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Client
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Company
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-primary/50">
                  Jurisdictions
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
              {filtered.map(client => (
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
                      {client.company?.name || '—'}
                    </div>
                    {client.company?.sector && (
                      <div className="text-xs text-primary/50 mt-0.5">
                        {client.company.sector}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {client.jurisdictions.length > 0 ? (
                        client.jurisdictions.map(j => (
                          <Badge key={j.id}>{j.name}</Badge>
                        ))
                      ) : (
                        <span className="text-primary/30">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      variant={
                        client.status === 'active' ? 'active' : 'inactive'
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-sm text-primary/50">
                    {new Date(client.created_at).toLocaleDateString('en-GB', {
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
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-primary/70 border-primary/10 hover:border-primary/30 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  )
}
