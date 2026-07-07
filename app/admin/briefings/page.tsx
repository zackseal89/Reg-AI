import { createAdminClient } from '@/lib/supabase/admin'
import { FileText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export default async function AdminBriefingsPage() {
  const supabase = createAdminClient()

  const { data: briefings } = await supabase
    .from('briefings')
    .select(
      `id, title, status, created_at, sent_at,
      jurisdictions ( name ),
      author:profiles!briefings_author_id_fkey ( first_name, last_name )`
    )
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Briefings"
        description="Every regulatory briefing drafted across the platform, by any lawyer."
      >
        <span className="text-body-sm font-semibold text-ink-muted">
          {briefings?.length ?? 0} total
        </span>
      </PageHeader>

      {!briefings || briefings.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No briefings yet"
          description="Briefings drafted by lawyers will appear here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02] border-b border-hairline/60">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Title</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Jurisdiction</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Author</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {briefings.map(b => {
                const jurisdiction = b.jurisdictions as unknown as { name: string } | null
                const author = b.author as unknown as {
                  first_name: string
                  last_name: string
                } | null
                return (
                  <tr key={b.id} className="hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{b.title}</td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">{jurisdiction?.name || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">
                      {author ? `${author.first_name} ${author.last_name}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={b.status as 'draft' | 'approved' | 'sent' | 'default'}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">
                      {new Date(b.sent_at ?? b.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
