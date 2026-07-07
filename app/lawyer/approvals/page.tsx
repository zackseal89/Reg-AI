import { createClient } from '@/lib/supabase/server'
import { ClipboardCheck, FileText, FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { ListRow } from '@/components/ui/list-row'
import { EmptyState } from '@/components/ui/empty-state'
import { timeAgo } from '@/lib/utils'

export default async function LawyerApprovalsPage() {
  const supabase = await createClient()

  const [{ data: pendingBriefings }, { data: pendingDocs }] = await Promise.all([
    supabase
      .from('briefings')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'draft')
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, title, created_at, jurisdictions ( name )')
      .eq('status', 'assigned')
      .order('created_at', { ascending: false }),
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
  ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Approvals"
        description="Draft briefings and assigned documents awaiting your review."
      >
        <span className="text-body-sm font-semibold text-ink-muted">
          {approvals.length} pending
        </span>
      </PageHeader>

      {approvals.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-6 h-6" />}
          title="Nothing pending"
          description="You're all caught up — new drafts and assignments will appear here."
        />
      ) : (
        <Card className="p-5">
          <div className="divide-y divide-hairline/60">
            {approvals.map(item => (
              <ListRow
                key={`${item.kind}-${item.id}`}
                icon={item.kind === 'briefing' ? FileText : FolderOpen}
                title={item.title}
                meta={item.jurisdiction}
                href={
                  item.kind === 'briefing' ? '/lawyer/briefings' : '/lawyer/documents'
                }
                right={timeAgo(item.created_at)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
