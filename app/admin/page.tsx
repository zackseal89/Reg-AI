import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Scale, FolderOpen, FileText, ClipboardCheck, Globe2, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { PanelCard } from '@/components/ui/panel-card'
import { ListRow } from '@/components/ui/list-row'
import { timeAgo } from '@/lib/utils'

const DOC_TYPE_LABELS: Record<string, string> = {
  circular: 'Circulars',
  gazette_notice: 'Gazette Notices',
  guideline: 'Guidance Notes',
  regulation: 'Regulations',
  policy: 'Policy Briefs',
  directive: 'Directives',
  amendment: 'Amendments',
  consultation_paper: 'Consultation Papers',
  other: 'Other',
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalClients },
    { count: activeLawyers },
    { count: totalDocuments },
    { count: briefingsSent },
    { count: draftBriefings },
    { count: assignedDocs },
    { data: pendingBriefings },
    { data: pendingDocs },
    { data: allDocTypes },
    { data: recentClients },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lawyer'),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'assigned'),
    supabase
      .from('briefings')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('documents')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'assigned')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('documents').select('doc_type'),
    supabase
      .from('profiles')
      .select('id, first_name, last_name, created_at, companies ( name )')
      .eq('role', 'client')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('audit_logs')
      .select('id, action, entity_type, created_at, profiles ( first_name, last_name )')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const pendingApprovals = (draftBriefings ?? 0) + (assignedDocs ?? 0)

  const approvals = [
    ...(pendingBriefings ?? []).map(b => ({
      id: b.id,
      title: b.title,
      created_at: b.created_at,
      jurisdiction: (b.jurisdictions as unknown as { name: string } | null)?.name,
      kind: 'briefing' as const,
    })),
    ...(pendingDocs ?? []).map(d => ({
      id: d.id,
      title: d.title,
      created_at: d.created_at,
      jurisdiction: (d.jurisdictions as unknown as { name: string } | null)?.name,
      kind: 'document' as const,
    })),
  ]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5)

  const docTypeCounts = (allDocTypes ?? []).reduce<Record<string, number>>((acc, d) => {
    const key = d.doc_type ?? 'other'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const docTypeBreakdown = Object.entries(docTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      label: DOC_TYPE_LABELS[type] ?? type,
      count,
      pct: allDocTypes?.length ? Math.round((count / allDocTypes.length) * 100) : 0,
    }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description="System health, platform activity and key metrics at a glance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Clients" value={totalClients ?? 0} icon={Users} tone="primary" href="/admin/clients" />
        <StatCard label="Active Lawyers" value={activeLawyers ?? 0} icon={Scale} tone="accent" href="/admin/lawyers" />
        <StatCard label="Total Documents" value={totalDocuments ?? 0} icon={FolderOpen} tone="primary" href="/admin/documents" />
        <StatCard label="Briefings Sent" value={briefingsSent ?? 0} icon={FileText} tone="success" href="/admin/briefings" />
        <StatCard label="Pending Approvals" value={pendingApprovals} icon={ClipboardCheck} tone="warning" href="/admin/approvals" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard title="Pending Approvals" viewAllHref="/admin/approvals">
          {approvals.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              Nothing pending across the platform.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {approvals.map(item => (
                <ListRow
                  key={`${item.kind}-${item.id}`}
                  icon={item.kind === 'briefing' ? FileText : FolderOpen}
                  title={item.title}
                  meta={item.jurisdiction}
                  href={item.kind === 'briefing' ? '/admin/briefings' : '/admin/documents'}
                  right={timeAgo(item.created_at)}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Documents by Type" viewAllHref="/admin/documents">
          {docTypeBreakdown.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-3.5">
              {docTypeBreakdown.map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-body-sm mb-1.5">
                    <span className="font-medium text-primary">{row.label}</span>
                    <span className="text-ink-muted">{row.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-low overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent/70"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-caption text-ink-faint border-t border-hairline/60">
                <span>Total</span>
                <span>{allDocTypes?.length ?? 0}</span>
              </div>
            </div>
          )}
        </PanelCard>

        <PanelCard title="Recent Client Onboarding" viewAllHref="/admin/clients">
          {!recentClients || recentClients.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              No clients onboarded yet.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {recentClients.map(c => {
                const co = c.companies as unknown as { name: string } | null
                return (
                  <ListRow
                    key={c.id}
                    icon={Users}
                    title={co?.name || `${c.first_name} ${c.last_name}`}
                    meta={`${c.first_name} ${c.last_name}`}
                    href="/admin/clients"
                    right={timeAgo(c.created_at)}
                  />
                )
              })}
            </div>
          )}
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard title="Jurisdictions" viewAllHref="/admin/jurisdictions" className="lg:col-span-1">
          <p className="text-body-sm text-ink-muted py-6 text-center flex items-center justify-center gap-2">
            <Globe2 className="w-4 h-4 text-ink-faint" />
            Manage jurisdiction coverage
          </p>
        </PanelCard>

        <PanelCard title="System Audit Logs" viewAllHref="/admin/audit-logs" className="lg:col-span-2">
          {!auditLogs || auditLogs.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              No activity recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {auditLogs.map(log => {
                const performer = log.profiles as unknown as {
                  first_name: string
                  last_name: string
                } | null
                return (
                  <ListRow
                    key={log.id}
                    icon={ScrollText}
                    title={log.action.replace(/_/g, ' ')}
                    meta={
                      performer
                        ? `${performer.first_name} ${performer.last_name} · ${log.entity_type}`
                        : log.entity_type
                    }
                    href="/admin/audit-logs"
                    right={timeAgo(log.created_at)}
                  />
                )
              })}
            </div>
          )}
        </PanelCard>
      </div>
    </div>
  )
}
