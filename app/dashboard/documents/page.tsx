import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DocFilters from './doc-filters'

const DOC_TYPE_LABELS: Record<string, string> = {
  circular: 'Circular',
  gazette_notice: 'Gazette Notice',
  regulation: 'Regulation',
  guideline: 'Guidance Note',
  policy: 'Policy Brief',
  directive: 'Directive',
  amendment: 'Amendment',
  consultation_paper: 'Consultation Paper',
  other: 'Other',
}

export default async function ClientDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ jurisdiction?: string; q?: string }>
}) {
  const { jurisdiction, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('documents')
    .select(`
      id, title, doc_type, effective_date, created_at, summary,
      jurisdictions ( name )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (jurisdiction) {
    query = query.eq('jurisdiction_id', jurisdiction)
  }
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: documents } = await query

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-serif font-semibold mb-1">Documents</h1>
      <p className="text-sm text-primary/60 mb-6">Regulatory documents shared by your legal team.</p>

      <DocFilters jurisdictions={jurisdictions || []} />

      {(!documents || documents.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-primary/30">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-primary/50 text-sm max-w-xs">
            {q ? `No documents matching "${q}".` : 'No documents have been shared with you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const jurisdiction = doc.jurisdictions as unknown as { name: string } | null
            const jName = jurisdiction?.name || ''
            const jColor = jName === 'CBK'
              ? 'bg-primary text-white'
              : jName === 'ODPC'
                ? 'bg-accent text-white'
                : 'bg-primary/10 text-primary'
            const typeLabel = doc.doc_type ? DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type : null

            return (
              <Link
                key={doc.id}
                href={`/dashboard/documents/${doc.id}`}
                className="block border border-black/5 rounded-xl p-4 bg-white hover:border-black/15 transition-colors active:bg-cream/50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[15px] leading-tight flex-1">{doc.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    {jName && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${jColor}`}>
                        {jName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/50">
                  {typeLabel && typeLabel !== 'Other' && (
                    <>
                      <span className="px-2 py-0.5 bg-primary/5 rounded font-medium">{typeLabel}</span>
                      <span className="text-primary/20">|</span>
                    </>
                  )}
                  {doc.effective_date && (
                    <span>Issued {new Date(doc.effective_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                  {!doc.effective_date && (
                    <span>Shared {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
                {doc.summary && (
                  <p className="text-sm text-primary/60 mt-2 line-clamp-2">{doc.summary}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
