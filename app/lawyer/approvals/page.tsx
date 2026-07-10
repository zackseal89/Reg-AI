import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import {
  ApprovalsQueue,
  type ApprovalQueueItem,
} from '@/components/approvals/approvals-queue'
import { approveApprovalItemAction, bulkApproveAction } from './actions'

export default async function LawyerApprovalsPage() {
  const supabase = await createClient()

  const [{ data: pendingBriefings }, { data: pendingDocs }] = await Promise.all([
    supabase
      .from('briefings')
      .select('id, title, content, created_at, jurisdictions ( name )')
      .eq('status', 'draft')
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, title, description, created_at, jurisdictions ( name )')
      .eq('status', 'assigned')
      .order('created_at', { ascending: false }),
  ])

  const items: ApprovalQueueItem[] = [
    ...(pendingBriefings ?? []).map(b => ({
      id: b.id,
      kind: 'briefing' as const,
      title: b.title,
      jurisdiction: (b.jurisdictions as unknown as { name: string } | null)?.name,
      snippet: b.content?.slice(0, 200) || null,
      created_at: b.created_at,
      href: '/lawyer/briefings',
    })),
    ...(pendingDocs ?? []).map(d => ({
      id: d.id,
      kind: 'document' as const,
      title: d.title,
      jurisdiction: (d.jurisdictions as unknown as { name: string } | null)?.name,
      snippet: d.description?.slice(0, 200) || null,
      created_at: d.created_at,
      href: '/lawyer/documents',
    })),
  ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Approvals"
        description="Draft briefings and assigned documents awaiting your review."
      />

      <Card className="p-5">
        <ApprovalsQueue
          items={items}
          approveOne={approveApprovalItemAction}
          approveMany={bulkApproveAction}
        />
      </Card>
    </div>
  )
}
