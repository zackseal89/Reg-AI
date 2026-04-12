import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

export default async function DocumentViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('documents')
    .select(`
      id, title, description, doc_type, reference_number, issuing_body,
      effective_date, summary, storage_path, file_name, created_at,
      jurisdictions ( name )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!doc) notFound()

  // Generate a signed URL for the PDF (valid for 1 hour)
  const admin = createAdminClient()
  const { data: signedUrl } = await admin.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 3600)

  const jurisdiction = doc.jurisdictions as unknown as { name: string } | null
  const jName = jurisdiction?.name || ''
  const jColor = jName === 'CBK'
    ? 'bg-primary text-white'
    : jName === 'ODPC'
      ? 'bg-accent text-white'
      : 'bg-primary/10 text-primary'
  const typeLabel = doc.doc_type ? DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type : null

  return (
    <div className="px-4 py-6">
      {/* Back */}
      <Link href="/dashboard/documents" className="inline-flex items-center gap-1 text-sm text-primary/50 hover:text-primary mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Documents
      </Link>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-xl font-serif font-semibold leading-tight flex-1">{doc.title}</h1>
          {signedUrl?.signedUrl && (
            <a
              href={signedUrl.signedUrl}
              download={doc.file_name || 'document.pdf'}
              className="shrink-0 p-2 border border-black/10 rounded-lg hover:bg-cream transition-colors"
              title="Download PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary/60">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-primary/50">
          {jName && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${jColor}`}>
              {jName}
            </span>
          )}
          {typeLabel && typeLabel !== 'Other' && (
            <span className="px-2 py-0.5 bg-primary/5 rounded font-medium">{typeLabel}</span>
          )}
          {doc.reference_number && <span>Ref: {doc.reference_number}</span>}
          {doc.issuing_body && <span>By: {doc.issuing_body}</span>}
          {doc.effective_date && (
            <span>Issued {new Date(doc.effective_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          )}
        </div>
      </div>

      {/* Lawyer's Summary */}
      {doc.summary && (
        <div className="mb-4 p-4 bg-cream rounded-xl border border-black/5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary/40 mb-2">Summary from your legal team</h2>
          <p className="text-sm text-primary/80 leading-relaxed">{doc.summary}</p>
        </div>
      )}

      {/* Description */}
      {doc.description && (
        <p className="text-sm text-primary/70 mb-4">{doc.description}</p>
      )}

      {/* PDF Viewer */}
      {signedUrl?.signedUrl ? (
        <div className="mb-6 rounded-xl overflow-hidden border border-black/10 bg-white">
          <iframe
            src={`${signedUrl.signedUrl}#toolbar=1&navpanes=0`}
            className="w-full h-[70vh] min-h-[400px]"
            title={doc.title}
          />
        </div>
      ) : (
        <div className="mb-6 p-8 text-center border border-black/10 rounded-xl bg-white">
          <p className="text-sm text-primary/50">Unable to load document preview.</p>
        </div>
      )}

      {/* Ask AI CTA */}
      <Link
        href={`/dashboard/chat?context=document&id=${doc.id}`}
        className="fixed bottom-20 right-4 px-5 py-3 bg-accent text-white rounded-full text-sm font-medium shadow-lg hover:bg-accent/90 transition-colors z-40 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Ask AI about this document
      </Link>
    </div>
  )
}
