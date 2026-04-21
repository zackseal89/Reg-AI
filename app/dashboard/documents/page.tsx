import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen, ArrowRight } from 'lucide-react'
import DocFilters from './doc-filters'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
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
    <div className="max-w-5xl">
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
        <div className="space-y-3">
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
                className="group relative flex overflow-hidden bg-white border border-primary/10 rounded-2xl transition-all duration-300 hover:border-accent/30 hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.08)]"
              >
                <div className="w-1 shrink-0 bg-primary/20 group-hover:bg-accent transition-colors" />

                <div className="flex-1 px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif font-semibold text-base leading-snug tracking-tight text-primary flex-1 group-hover:text-accent transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {jur?.name && <Badge variant="accent">{jur.name}</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-primary/50 mb-2">
                    {typeLabel && typeLabel !== 'Other' && (
                      <Badge>{typeLabel}</Badge>
                    )}
                    <span>
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
                  </div>

                  {doc.summary && (
                    <p className="text-[13px] text-primary/60 leading-relaxed line-clamp-2">
                      {doc.summary}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center pr-4 text-primary/30 opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
