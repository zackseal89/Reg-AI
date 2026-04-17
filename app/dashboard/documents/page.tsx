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
      <h1 className="text-2xl font-serif font-semibold mb-1 tracking-tight">Documents</h1>
      <p className="text-[13px] text-primary/50 mb-6">
        Regulatory documents published to your account by your legal team.
      </p>

      <DocFilters jurisdictions={jurisdictions || []} />

      {(!documents || documents.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-primary/25">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-primary/45 text-[13px] max-w-[240px] leading-relaxed">
            {q ? `No documents matching &ldquo;${q}&rdquo;.` : 'No documents have been shared with you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const jur = doc.jurisdictions as unknown as { name: string } | null
            const jName = jur?.name || ''
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
                className="group relative flex overflow-hidden bg-white border border-[#1a2744]/8 rounded-xl transition-all duration-200 hover:border-[#1a2744]/18 hover:shadow-[0_4px_24px_rgba(26,39,68,0.07)] active:scale-[0.995]"
              >
                {/* Left accent stripe */}
                <div className="w-1 shrink-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />

                <div className="flex-1 px-4 py-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[15px] leading-snug tracking-tight text-primary flex-1">
                      {doc.title}
                    </h3>
                    {jName && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${jColor}`}>
                        {jName}
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 text-[11px] text-primary/40 mb-2">
                    {typeLabel && typeLabel !== 'Other' && (
                      <>
                        <span className="px-2 py-0.5 bg-primary/5 rounded font-medium text-primary/55">
                          {typeLabel}
                        </span>
                        <span className="text-primary/15">·</span>
                      </>
                    )}
                    <span>
                      {doc.effective_date
                        ? `Issued ${new Date(doc.effective_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : `Shared ${new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      }
                    </span>
                  </div>

                  {doc.summary && (
                    <p className="text-[13px] text-primary/50 leading-[1.65] line-clamp-2">
                      {doc.summary}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
