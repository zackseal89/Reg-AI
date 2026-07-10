import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen, ArrowRight } from 'lucide-react'
import DocFilters from './doc-filters'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'

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
    .select(
      `id, title, doc_type, effective_date, created_at, summary,
      jurisdictions ( name )`
    )
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
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Documents"
        description="Regulatory documents published to your account by your legal team."
      />

      <DocFilters jurisdictions={jurisdictions || []} />

      {!documents || documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6" />}
          title={q ? 'No matching documents' : 'No documents yet'}
          description={
            q
              ? `Nothing matches &ldquo;${q}&rdquo;. Try a different search.`
              : 'No documents have been shared with you yet.'
          }
        />
      ) : (
        <div className="divide-y divide-hairline">
          {documents.map(doc => {
            const jur = doc.jurisdictions as unknown as {
              name: string
            } | null
            const typeLabel = doc.doc_type
              ? DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type
              : null

            return (
              <Link
                key={doc.id}
                href={`/dashboard/documents/${doc.id}`}
                className="group block py-6 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  {jur?.name && (
                    <span className="text-eyebrow font-semibold uppercase tracking-wider text-accent">
                      {jur.name}
                    </span>
                  )}
                  {typeLabel && typeLabel !== 'Other' && (
                    <>
                      {jur?.name && <span className="text-ink-faint">·</span>}
                      <span className="text-eyebrow font-semibold uppercase tracking-wider text-ink-faint">
                        {typeLabel}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="font-serif text-title font-semibold text-primary leading-snug tracking-tight max-w-[42ch] mb-2 transition-colors duration-200 group-hover:text-accent">
                  {doc.title}
                </h3>

                {doc.summary && (
                  <p className="text-body-sm text-ink-secondary leading-relaxed max-w-[62ch] line-clamp-2 mb-3">
                    {doc.summary}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-caption text-ink-faint">
                    {doc.effective_date
                      ? `Issued ${new Date(
                          doc.effective_date
                        ).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}`
                      : `Shared ${new Date(doc.created_at).toLocaleDateString(
                          'en-GB',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}`}
                  </span>
                  <span className="text-eyebrow font-semibold uppercase tracking-widest text-ink-faint opacity-0 -translate-x-1 transition-all duration-200 flex items-center gap-1.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent">
                    View document
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
