import { createClient } from '@/lib/supabase/server'
import { FolderOpen, MoreHorizontal } from 'lucide-react'
import {
  uploadDocumentAction,
  assignDocumentAction,
  publishDocumentAction,
  unpublishDocumentAction,
} from './actions'
import FlashToast from '@/app/components/FlashToast'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { UploadDocumentModal } from '@/components/modals/upload-document-modal'
import { AssignDocumentModal } from '@/components/modals/assign-document-modal'
import { ConfirmModal } from '@/components/modals/confirm-modal'

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

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function LawyerDocumentsPage() {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select(
      `id, title, description, doc_type, reference_number, issuing_body,
      effective_date, summary, internal_notes, file_name, file_size_bytes,
      status, storage_path, created_at,
      jurisdictions ( name ),
      profiles!documents_uploaded_by_fkey ( first_name, last_name ),
      document_assignments ( client_id, profiles!document_assignments_client_id_fkey ( first_name, last_name ) )`
    )
    .order('created_at', { ascending: false })

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  const { data: rawClients } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, companies ( name ), client_jurisdictions ( jurisdiction_id )'
    )
    .eq('role', 'client')
    .order('first_name')

  const clientsForForm = (rawClients ?? []).map(c => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    company_name:
      (c.companies as unknown as { name: string } | null)?.name ?? null,
    jurisdiction_ids: (
      (c.client_jurisdictions as unknown as { jurisdiction_id: string }[]) ?? []
    ).map(cj => cj.jurisdiction_id),
  }))

  return (
    <div className="max-w-6xl">
      <FlashToast />
      <PageHeader
        title="Documents"
        description="Upload, assign, and publish regulatory documents to client portals."
      >
        <UploadDocumentModal
          jurisdictions={jurisdictions ?? []}
          clients={clientsForForm}
          action={uploadDocumentAction}
        />
      </PageHeader>

      {!documents || documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6" />}
          title="No documents yet"
          description="Upload your first regulatory document. Publishing indexes it into the client's AI chat store."
        />
      ) : (
        <div className="space-y-5">
          {documents.map(doc => {
            const jurisdiction = doc.jurisdictions as unknown as {
              name: string
            } | null
            const assignments = doc.document_assignments as unknown as {
              client_id: string
              profiles: { first_name: string; last_name: string }
            }[] | null

            return (
              <div
                key={doc.id}
                className="p-6 border border-primary/10 bg-white rounded-2xl hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.08)] hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl font-semibold text-primary group-hover:text-accent transition-colors">
                        {doc.title}
                      </h3>
                      <Badge
                        variant={
                          doc.status as
                            | 'uploaded'
                            | 'assigned'
                            | 'published'
                            | 'default'
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-primary/70 mb-4 leading-relaxed max-w-4xl">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-primary/50">
                      {jurisdiction && (
                        <span className="flex items-center gap-1.5 text-primary/70 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                          {jurisdiction.name}
                        </span>
                      )}
                      {doc.doc_type && doc.doc_type !== 'other' && (
                        <Badge>
                          {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                        </Badge>
                      )}
                      {doc.reference_number && (
                        <span>
                          Ref:{' '}
                          <span className="font-medium text-primary/70">
                            {doc.reference_number}
                          </span>
                        </span>
                      )}
                      {doc.issuing_body && (
                        <span>
                          By:{' '}
                          <span className="font-medium text-primary/70">
                            {doc.issuing_body}
                          </span>
                        </span>
                      )}
                      {doc.effective_date && (
                        <span>
                          Effective:{' '}
                          <span className="font-medium text-primary/70">
                            {new Date(
                              doc.effective_date
                            ).toLocaleDateString()}
                          </span>
                        </span>
                      )}
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:shrink-0 pt-1">
                    {(doc.status === 'uploaded' ||
                      doc.status === 'assigned') && (
                      <AssignDocumentModal
                        documentId={doc.id}
                        documentTitle={doc.title}
                        label={
                          doc.status === 'uploaded'
                            ? 'Assign'
                            : 'Assign more'
                        }
                        clients={clientsForForm}
                        action={assignDocumentAction}
                      />
                    )}
                    {doc.status === 'assigned' && (
                      <form action={publishDocumentAction}>
                        <input
                          type="hidden"
                          name="documentId"
                          value={doc.id}
                        />
                        <Button type="submit" size="sm">
                          Publish
                        </Button>
                      </form>
                    )}
                    {doc.status === 'published' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 rounded-lg text-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ConfirmModal
                            title="Unpublish document?"
                            description={`"${doc.title}" will be removed from client AI stores. It can be republished.`}
                            confirmLabel="Unpublish"
                            destructive
                            hiddenFields={{ documentId: doc.id }}
                            action={unpublishDocumentAction}
                            trigger={
                              <DropdownMenuItem
                                destructive
                                onSelect={e => e.preventDefault()}
                              >
                                Unpublish
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <AssignDocumentModal
                            documentId={doc.id}
                            documentTitle={doc.title}
                            label="Assign more"
                            clients={clientsForForm}
                            action={assignDocumentAction}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {doc.summary && (
                  <div className="mt-5 p-4 bg-primary/[0.02] rounded-xl text-sm text-primary/80 border border-primary/5">
                    <span className="flex items-center gap-2 text-[11px] font-bold text-primary/50 uppercase tracking-widest mb-1.5">
                      Lawyer&apos;s Summary
                    </span>
                    <p className="leading-relaxed">{doc.summary}</p>
                  </div>
                )}
                {doc.internal_notes && (
                  <div className="mt-3 p-4 bg-accent/[0.03] rounded-xl text-sm text-primary/80 border border-accent/10">
                    <span className="flex items-center gap-2 text-[11px] font-bold text-accent/70 uppercase tracking-widest mb-1.5">
                      Internal Notes (not visible to clients)
                    </span>
                    <p className="leading-relaxed">{doc.internal_notes}</p>
                  </div>
                )}
                {assignments && assignments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-primary/5 text-xs text-primary/50">
                    <span className="font-medium uppercase tracking-wider text-[10px]">
                      Assigned to:
                    </span>
                    {assignments.map(a => (
                      <span
                        key={a.client_id}
                        className="px-2.5 py-1 bg-primary/5 rounded border border-primary/5 font-medium text-primary/80"
                      >
                        {a.profiles.first_name} {a.profiles.last_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
