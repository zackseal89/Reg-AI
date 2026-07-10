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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ConfirmMenuItem } from '@/components/modals/confirm-menu-item'

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
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="All Clients"
        description="Platform-wide client accounts across every lawyer."
      >
        <span className="text-body-sm text-ink-muted font-medium">
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </span>
      </PageHeader>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-body-sm font-medium shadow-soft">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-eyebrow font-bold text-ink-muted uppercase tracking-widest mr-2">
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

        <span className="mx-2 h-4 w-px bg-hairline" />

        <span className="text-eyebrow font-bold text-ink-muted uppercase tracking-widest mr-2">
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
              <tr className="bg-primary/[0.02] border-b border-hairline/60">
                <th className="px-6 py-4 text-eyebrow font-bold uppercase tracking-widest text-ink-muted">
                  Client
                </th>
                <th className="px-6 py-4 text-eyebrow font-bold uppercase tracking-widest text-ink-muted">
                  Company
                </th>
                <th className="px-6 py-4 text-eyebrow font-bold uppercase tracking-widest text-ink-muted">
                  Jurisdictions
                </th>
                <th className="px-6 py-4 text-eyebrow font-bold uppercase tracking-widest text-ink-muted">
                  Status
                </th>
                <th className="px-6 py-4 text-eyebrow font-bold uppercase tracking-widest text-ink-muted">
                  Joined
                </th>
                <th className="px-6 py-4 text-eyebrow font-bold uppercase tracking-widest text-ink-muted text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {filtered.map(client => (
                <tr
                  key={client.id}
                  className="hover:bg-primary/[0.02] transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="font-medium text-primary">
                      {client.first_name} {client.last_name}
                    </div>
                    <div className="text-ink-muted text-caption mt-0.5">
                      {client.email}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-primary">
                      {client.company?.name || '—'}
                    </div>
                    {client.company?.sector && (
                      <div className="text-caption text-ink-muted mt-0.5">
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
                        <span className="text-ink-faint">—</span>
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
                  <td className="px-6 py-5 text-body-sm text-ink-muted">
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
                            className="p-2 rounded-lg text-ink-muted hover:bg-primary/5 hover:text-primary transition-colors"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ConfirmMenuItem
                            itemLabel="Activate account"
                            title="Activate client account?"
                            description={`Confirm the email for ${client.first_name} ${client.last_name} so they can sign in.`}
                            confirmLabel="Activate"
                            hiddenFields={{ clientId: client.id }}
                            action={activateClientAction}
                          />
                          <DropdownMenuSeparator />
                          <ConfirmMenuItem
                            itemLabel="Suspend"
                            title="Suspend client?"
                            description={`${client.first_name} ${client.last_name} will lose access until reactivated.`}
                            confirmLabel="Suspend"
                            destructive
                            hiddenFields={{ clientId: client.id }}
                            action={suspendClientAction}
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
      className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-ink-secondary border-hairline hover:border-primary/30 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  )
}
