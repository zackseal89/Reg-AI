import { createAdminClient } from '@/lib/supabase/admin'
import { FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export default async function AdminDocumentsPage() {
  const supabase = createAdminClient()

  const { data: documents } = await supabase
    .from('documents')
    .select(
      `id, title, status, doc_type, created_at,
      jurisdictions ( name ),
      profiles!documents_uploaded_by_fkey ( first_name, last_name )`
    )
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Documents"
        description="Every document uploaded across the platform, by any lawyer."
      >
        <span className="text-body-sm font-semibold text-ink-muted">
          {documents?.length ?? 0} total
        </span>
      </PageHeader>

      {!documents || documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6" />}
          title="No documents yet"
          description="Documents uploaded by lawyers will appear here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/[0.02] border-b border-hairline/60">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Title</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Jurisdiction</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Uploaded By</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-ink-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60">
              {documents.map(doc => {
                const jurisdiction = doc.jurisdictions as unknown as { name: string } | null
                const uploader = doc.profiles as unknown as {
                  first_name: string
                  last_name: string
                } | null
                return (
                  <tr key={doc.id} className="hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{doc.title}</td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">{jurisdiction?.name || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">
                      {uploader ? `${uploader.first_name} ${uploader.last_name}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={doc.status as 'uploaded' | 'assigned' | 'published' | 'default'}
                      >
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">
                      {new Date(doc.created_at).toLocaleDateString('en-GB', {
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
