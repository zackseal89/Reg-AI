import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  const typeLabel = doc.doc_type
    ? DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type
    : null

  return (
    <div className="max-w-3xl pb-20">
      <Link
        href="/dashboard/documents"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Documents
      </Link>

      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-h2 font-serif font-bold text-primary leading-tight flex-1">
            {doc.title}
          </h1>
          {signedUrl?.signedUrl && (
            <a
              href={signedUrl.signedUrl}
              download={doc.file_name || 'document.pdf'}
              className="shrink-0 p-2 rounded-md border border-hairline text-ink-muted hover:bg-surface-low hover:text-primary transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
          {jurisdiction?.name && <Badge variant="accent">{jurisdiction.name}</Badge>}
          {typeLabel && typeLabel !== 'Other' && <Badge>{typeLabel}</Badge>}
          {doc.reference_number && <span>Ref: {doc.reference_number}</span>}
          {doc.issuing_body && <span>By: {doc.issuing_body}</span>}
          {doc.effective_date && (
            <span>
              Issued{' '}
              {new Date(doc.effective_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {doc.summary && (
        <div className="mb-4 p-4 bg-surface-low/60 rounded-lg border border-hairline/60">
          <h2 className="text-eyebrow font-bold uppercase tracking-widest text-ink-muted mb-2">
            Summary from your legal team
          </h2>
          <p className="text-body-sm text-ink-secondary leading-relaxed">
            {doc.summary}
          </p>
        </div>
      )}

      {doc.description && (
        <p className="text-body-sm text-ink-secondary mb-4">{doc.description}</p>
      )}

      {signedUrl?.signedUrl ? (
        <div className="mb-6 rounded-lg overflow-hidden border border-hairline bg-white">
          <iframe
            src={`${signedUrl.signedUrl}#toolbar=1&navpanes=0`}
            className="w-full h-[70vh] min-h-[400px]"
            title={doc.title}
          />
        </div>
      ) : (
        <div className="mb-6 p-8 text-center border border-hairline rounded-lg bg-white">
          <p className="text-body-sm text-ink-muted">
            Unable to load document preview.
          </p>
        </div>
      )}

      <Link href={`/dashboard/chat?context=document&id=${doc.id}`}>
        <Button className="fixed bottom-20 right-4 shadow-elevated z-40">
          <MessageSquare className="w-4 h-4" />
          Ask AI about this document
        </Button>
      </Link>
    </div>
  )
}
