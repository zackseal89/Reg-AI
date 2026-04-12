import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
      id, title, content, status, created_at, sent_at,
      jurisdictions ( name )
    `)
    .eq('id', id)
    .eq('status', 'sent')
    .single()

  if (!briefing) notFound()

  const jurisdiction = briefing.jurisdictions as unknown as { name: string } | null
  const jName = jurisdiction?.name || ''
  const jColor = jName === 'CBK'
    ? 'bg-primary text-white'
    : jName === 'ODPC'
      ? 'bg-accent text-white'
      : 'bg-primary/10 text-primary'

  // Fetch documents with matching jurisdiction that are published to this client
  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, doc_type, jurisdictions ( name )')
    .eq('status', 'published')
    .eq('jurisdiction_id', (briefing as unknown as { jurisdiction_id: string }).jurisdiction_id || '')

  return (
    <div className="px-4 py-6">
      {/* Back */}
      <Link href="/dashboard/briefings" className="inline-flex items-center gap-1 text-sm text-primary/50 hover:text-primary mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Briefings
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-xl font-serif font-semibold leading-tight flex-1">{briefing.title}</h1>
          {jName && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${jColor}`}>
              {jName}
            </span>
          )}
        </div>
        <span className="text-xs text-primary/40">
          {briefing.sent_at ? new Date(briefing.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </span>
      </div>

      {/* Body */}
      <div className="prose prose-sm max-w-none text-primary/80 leading-relaxed whitespace-pre-wrap mb-8">
        {briefing.content}
      </div>

      {/* Related Documents */}
      {documents && documents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary/40 mb-3">Related Documents</h2>
          <div className="space-y-2">
            {documents.map(doc => {
              const docJ = doc.jurisdictions as unknown as { name: string } | null
              return (
                <Link
                  key={doc.id}
                  href={`/dashboard/documents/${doc.id}`}
                  className="flex items-center justify-between p-3 border border-black/5 rounded-lg bg-white hover:border-black/15 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-primary/30">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-sm font-medium">{doc.title}</span>
                  </div>
                  {docJ && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 rounded font-medium">{docJ.name}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Ask AI CTA */}
      <Link
        href={`/dashboard/chat?context=briefing&id=${briefing.id}`}
        className="block w-full text-center py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
      >
        Ask AI about this briefing
      </Link>
    </div>
  )
}
