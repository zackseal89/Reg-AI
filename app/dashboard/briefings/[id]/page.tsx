import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListRow } from '@/components/ui/list-row'

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: briefing } = await supabase
    .from('briefings')
    .select(`
      id, title, content, status, created_at, sent_at, jurisdiction_id,
      jurisdictions ( name )
    `)
    .eq('id', id)
    .eq('status', 'sent')
    .single()

  if (!briefing) notFound()

  const jurisdiction = briefing.jurisdictions as unknown as { name: string } | null

  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, jurisdictions ( name )')
    .eq('status', 'published')
    .eq('jurisdiction_id', briefing.jurisdiction_id || '')

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/briefings"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Briefings
      </Link>

      <div className="mb-6">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-h2 font-serif font-bold text-primary leading-tight flex-1">
            {briefing.title}
          </h1>
          {jurisdiction?.name && (
            <Badge variant="accent" className="shrink-0">
              {jurisdiction.name}
            </Badge>
          )}
        </div>
        <span className="text-caption text-ink-faint">
          {briefing.sent_at
            ? new Date(briefing.sent_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : ''}
        </span>
      </div>

      <div className="prose prose-sm max-w-none text-ink-secondary leading-relaxed whitespace-pre-wrap mb-8">
        {briefing.content}
      </div>

      {documents && documents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-eyebrow font-bold uppercase tracking-widest text-ink-muted mb-3">
            Related Documents
          </h2>
          <Card className="p-2">
            <div className="divide-y divide-hairline/60">
              {documents.map(doc => (
                <ListRow
                  key={doc.id}
                  icon={FileText}
                  title={doc.title}
                  href={`/dashboard/documents/${doc.id}`}
                  right={(doc.jurisdictions as unknown as { name: string } | null)?.name}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      <Link href={`/dashboard/chat?context=briefing&id=${briefing.id}`}>
        <Button className="w-full justify-center">
          <MessageSquare className="w-4 h-4" />
          Ask AI about this briefing
        </Button>
      </Link>
    </div>
  )
}
