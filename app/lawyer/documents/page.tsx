import { createClient } from '@/lib/supabase/server'
import { uploadDocumentAction, assignDocumentAction, publishDocumentAction, unpublishDocumentAction } from './actions'
import UploadForm from './upload-form'

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

export default async function LawyerDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; assign?: string }>
}) {
  const { error, assign } = await searchParams
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id, title, description, doc_type, reference_number, issuing_body,
      effective_date, summary, internal_notes, file_name, file_size_bytes,
      status, storage_path, created_at,
      jurisdictions ( name ),
      profiles!documents_uploaded_by_fkey ( first_name, last_name ),
      document_assignments ( client_id, profiles!document_assignments_client_id_fkey ( first_name, last_name ) )
    `)
    .order('created_at', { ascending: false })

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  // Fetch clients with their jurisdiction links for filtering
  const { data: rawClients } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, companies ( name ), client_jurisdictions ( jurisdiction_id )')
    .eq('role', 'client')
    .order('first_name')

  // Transform clients into the shape the UploadForm expects
  const clientsForForm = (rawClients || []).map(c => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    company_name: (c.companies as unknown as { name: string } | null)?.name || null,
    jurisdiction_ids: ((c.client_jurisdictions as unknown as { jurisdiction_id: string }[]) || []).map(cj => cj.jurisdiction_id),
  }))

  const assigningDoc = assign ? documents?.find(d => d.id === assign) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Documents</h1>
          <p className="text-primary/70">Upload, assign, and publish regulatory documents.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Assign Panel (for existing documents) */}
      {assigningDoc && (
        <div className="mb-6 p-6 border-2 border-accent/30 rounded-lg bg-cream/50">
          <h2 className="text-lg font-serif font-medium mb-1">Assign: {assigningDoc.title}</h2>
          <p className="text-sm text-primary/60 mb-4">Select clients to assign this document to.</p>
          <form action={assignDocumentAction}>
            <input type="hidden" name="documentId" value={assigningDoc.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {clientsForForm.map(c => (
                <label key={c.id} className="flex items-center gap-2 text-sm p-2 border border-black/5 rounded hover:bg-white">
                  <input type="checkbox" name="clientIds" value={c.id} className="rounded" />
                  {c.first_name} {c.last_name} {c.company_name ? `(${c.company_name})` : ''}
                </label>
              ))}
              {clientsForForm.length === 0 && (
                <p className="text-sm text-primary/50">No clients yet. Onboard a client first.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Assign & Update Status
              </button>
              <a href="/lawyer/documents" className="px-4 py-2 border border-black/10 rounded-md text-sm hover:bg-white transition-colors">
                Cancel
              </a>
            </div>
          </form>
        </div>
      )}

      {/* Upload Form */}
      <div className="mb-10 p-6 border border-black/10 rounded-lg bg-cream/50">
        <h2 className="text-lg font-serif font-medium mb-1">Upload Regulatory Document</h2>
        <p className="text-sm text-primary/60 mb-6">Fill in the document metadata. Fields marked with <span className="text-accent">*</span> are required.</p>
        <UploadForm
          jurisdictions={jurisdictions || []}
          clients={clientsForForm}
          uploadAction={uploadDocumentAction}
        />
      </div>

      {/* Documents List */}
      <h2 className="text-lg font-serif font-medium mb-4">Uploaded Documents</h2>
      <div className="space-y-4">
        {(!documents || documents.length === 0) && (
          <div className="text-center py-8 text-primary/50 border border-black/10 rounded-lg">
            No documents uploaded yet.
          </div>
        )}
        {documents?.map(doc => {
          const jurisdiction = doc.jurisdictions as unknown as { name: string } | null
          const assignments = doc.document_assignments as unknown as { client_id: string; profiles: { first_name: string; last_name: string } }[] | null
          const statusColors: Record<string, string> = {
            uploaded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            assigned: 'bg-blue-50 text-blue-700 border-blue-200',
            published: 'bg-green-50 text-green-700 border-green-200',
          }

          return (
            <div key={doc.id} className="p-5 border border-black/10 rounded-lg hover:border-black/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-lg font-medium">{doc.title}</h3>
                    <span className={`px-2 py-0.5 border rounded text-xs font-medium ${statusColors[doc.status] || ''}`}>
                      {doc.status}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-primary/70 mb-2">{doc.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary/60">
                    {jurisdiction && (
                      <span className="px-2 py-0.5 bg-primary/10 rounded font-medium">{jurisdiction.name}</span>
                    )}
                    {doc.doc_type && doc.doc_type !== 'other' && (
                      <span>{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
                    )}
                    {doc.reference_number && (
                      <span>Ref: {doc.reference_number}</span>
                    )}
                    {doc.issuing_body && (
                      <span>By: {doc.issuing_body}</span>
                    )}
                    {doc.effective_date && (
                      <span>Effective: {new Date(doc.effective_date).toLocaleDateString()}</span>
                    )}
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {(doc.status === 'uploaded' || doc.status === 'assigned') && (
                    <a href={`/lawyer/documents?assign=${doc.id}`} className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                      {doc.status === 'uploaded' ? 'Assign' : 'Assign More'}
                    </a>
                  )}
                  {doc.status === 'assigned' && (
                    <form action={publishDocumentAction}>
                      <input type="hidden" name="documentId" value={doc.id} />
                      <button type="submit" className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                        Publish
                      </button>
                    </form>
                  )}
                  {doc.status === 'published' && (
                    <form action={unpublishDocumentAction}>
                      <input type="hidden" name="documentId" value={doc.id} />
                      <button type="submit" className="px-3 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors">
                        Unpublish
                      </button>
                    </form>
                  )}
                </div>
              </div>
              {doc.summary && (
                <div className="mt-3 p-3 bg-cream/50 rounded text-sm text-primary/80 border border-black/5">
                  <span className="text-xs font-medium text-primary/50 uppercase tracking-wider">Lawyer&apos;s Summary</span>
                  <p className="mt-1">{doc.summary}</p>
                </div>
              )}
              {doc.internal_notes && (
                <div className="mt-2 p-3 bg-yellow-50/50 rounded text-sm text-yellow-800 border border-yellow-200/50">
                  <span className="text-xs font-medium text-yellow-600 uppercase tracking-wider">Internal Notes</span>
                  <p className="mt-1">{doc.internal_notes}</p>
                </div>
              )}
              {assignments && assignments.length > 0 && (
                <div className="flex items-center gap-1 mt-3 text-xs text-primary/60">
                  <span>Assigned to:</span>
                  {assignments.map(a => (
                    <span key={a.client_id} className="px-2 py-0.5 bg-cream rounded">
                      {a.profiles.first_name} {a.profiles.last_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
