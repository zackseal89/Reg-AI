import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  FolderOpen,
  Users,
  CheckCircle2,
  Globe2,
  PlusCircle,
  Upload,
  UserPlus,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { PanelCard } from '@/components/ui/panel-card'
import { ListRow } from '@/components/ui/list-row'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function LawyerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user!.id)
    .single()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: draftBriefings },
    { count: assignedDocs },
    { count: clientCount },
    { count: sentThisWeek },
    { data: pendingBriefings },
    { data: pendingDocs },
    { data: jurisdictionsRaw },
    { data: recentBriefings },
    { data: recentDocuments },
  ] = await Promise.all([
    supabase.from('briefings').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'assigned'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase
      .from('briefings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', sevenDaysAgo.toISOString()),
    supabase
      .from('briefings')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('documents')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'assigned')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('jurisdictions')
      .select('id, name, client_jurisdictions ( client_id )')
      .order('name')
      .limit(5),
    supabase
      .from('briefings')
      .select('id, title, sent_at, jurisdictions ( name )')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(4),
    supabase
      .from('documents')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(4),
  ])

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

  const jurisdictions = (jurisdictionsRaw ?? []).map(j => ({
    id: j.id,
    name: j.name,
    clientCount: (j.client_jurisdictions as unknown as unknown[] | null)?.length ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-serif font-bold text-primary tracking-tight">
            {greeting()}, {profile?.first_name || 'there'}.
          </h1>
          <p className="text-body-sm text-ink-muted mt-1.5">
            Here&apos;s what&apos;s happening across your regulatory workspace.
          </p>
        </div>
        <Link href="/lawyer/briefings">
          <Button>
            <PlusCircle className="w-4 h-4" />
            New Briefing
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Briefings"
          value={draftBriefings ?? 0}
          icon={FileText}
          hint="Drafts awaiting approval"
          tone="accent"
          href="/lawyer/briefings"
        />
        <StatCard
          label="Docs Awaiting Publish"
          value={assignedDocs ?? 0}
          icon={FolderOpen}
          hint="Assigned, not yet published"
          tone="warning"
          href="/lawyer/documents"
        />
        <StatCard
          label="Active Clients"
          value={clientCount ?? 0}
          icon={Users}
          hint="Onboarded client accounts"
          tone="primary"
          href="/lawyer/clients"
        />
        <StatCard
          label="Sent This Week"
          value={sentThisWeek ?? 0}
          icon={CheckCircle2}
          hint="Briefings delivered"
          tone="success"
          href="/lawyer/briefings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard
          title="Pending Approvals"
          viewAllHref="/lawyer/approvals"
          className="lg:col-span-2"
        >
          {approvals.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              Nothing pending — you&apos;re all caught up.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {approvals.map(item => (
                <ListRow
                  key={`${item.kind}-${item.id}`}
                  icon={item.kind === 'briefing' ? FileText : FolderOpen}
                  title={item.title}
                  meta={item.jurisdiction}
                  href={
                    item.kind === 'briefing'
                      ? '/lawyer/briefings'
                      : '/lawyer/documents'
                  }
                  right={timeAgo(item.created_at)}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Jurisdictions" viewAllHref="/lawyer/jurisdictions">
          {jurisdictions.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              No jurisdictions configured.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {jurisdictions.map(j => (
                <ListRow
                  key={j.id}
                  icon={Globe2}
                  title={j.name}
                  meta={`${j.clientCount} client${j.clientCount === 1 ? '' : 's'}`}
                />
              ))}
            </div>
          )}
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard title="Recent Briefings" viewAllHref="/lawyer/briefings">
          {!recentBriefings || recentBriefings.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              No briefings sent yet.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {recentBriefings.map(b => (
                <ListRow
                  key={b.id}
                  icon={FileText}
                  title={b.title}
                  meta={(b.jurisdictions as unknown as { name: string } | null)?.name}
                  href="/lawyer/briefings"
                  right={b.sent_at ? timeAgo(b.sent_at) : undefined}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Recent Documents" viewAllHref="/lawyer/documents">
          {!recentDocuments || recentDocuments.length === 0 ? (
            <p className="text-body-sm text-ink-muted py-6 text-center">
              No documents published yet.
            </p>
          ) : (
            <div className="divide-y divide-hairline/60">
              {recentDocuments.map(d => (
                <ListRow
                  key={d.id}
                  icon={FolderOpen}
                  title={d.title}
                  meta={(d.jurisdictions as unknown as { name: string } | null)?.name}
                  href="/lawyer/documents"
                  right={timeAgo(d.created_at)}
                />
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Quick Actions">
          <div className="divide-y divide-hairline/60">
            <ListRow
              icon={PlusCircle}
              title="Draft a briefing"
              meta="Write and route for approval"
              href="/lawyer/briefings"
              tone="accent"
            />
            <ListRow
              icon={Upload}
              title="Upload a document"
              meta="Add a new regulatory filing"
              href="/lawyer/documents"
              tone="accent"
            />
            <ListRow
              icon={UserPlus}
              title="Onboard a client"
              meta="Create a new client portal"
              href="/lawyer/clients"
              tone="accent"
            />
          </div>
        </PanelCard>
      </div>
    </div>
  )
}
