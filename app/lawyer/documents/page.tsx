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
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-primary/5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Documents</h1>
          <p className="text-[15px] font-sans text-primary/60">Upload, assign, and publish regulatory documents.</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {/* Assign Panel (for existing documents) */}
      {assigningDoc && (
        <div className="mb-12 p-8 border border-accent/20 rounded-2xl bg-white shadow-lg relative overflow-hidden ring-4 ring-accent/5">
          <h2 className="text-xl font-serif font-semibold text-primary mb-2">Assign: {assigningDoc.title}</h2>
          <p className="text-[14px] text-primary/60 mb-6 font-sans">Select clients to assign this document to.</p>
          <form action={assignDocumentAction}>
            <input type="hidden" name="documentId" value={assigningDoc.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {clientsForForm.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-3 border border-primary/10 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group">
                  <input type="checkbox" name="clientIds" value={c.id} className="w-5 h-5 rounded border-primary/20 text-accent focus:ring-accent/30 cursor-pointer" />
                  <span className="text-[14px] font-medium text-primary group-hover:text-accent transition-colors">
                    {c.first_name} {c.last_name} {c.company_name ? <span className="text-primary/50 text-[12px] block font-normal">{c.company_name}</span> : ''}
                  </span>
                </label>
              ))}
              {clientsForForm.length === 0 && (
                <p className="text-sm text-primary/50 col-span-full py-4 text-center bg-primary/5 rounded-xl">No clients yet. Onboard a client first.</p>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-accent transition-all duration-300 shadow-md">
                Assign & Update Status
              </button>
              <a href="/lawyer/documents" className="px-6 py-2.5 border border-primary/20 rounded-xl text-[13px] font-bold uppercase tracking-widest text-primary/70 hover:bg-primary/5 hover:text-primary transition-all duration-300">
                Cancel
              </a>
            </div>
          </form>
        </div>
      )}

      {/* Upload Form */}
      <div className="mb-12 p-8 border border-primary/10 rounded-2xl bg-white shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-serif font-semibold text-primary mb-2">Upload Regulatory Document</h2>
        <p className="text-[14px] text-primary/60 mb-8 pb-6 border-b border-primary/5 font-sans">Fill in the document metadata. Fields marked with <span className="text-accent font-bold">*</span> are required.</p>
        <UploadForm
          jurisdictions={jurisdictions || []}
          clients={clientsForForm}
          uploadAction={uploadDocumentAction}
        />
      </div>

      {/* Documents List */}
      <h2 className="text-xl font-serif font-semibold text-primary mb-6">Uploaded Documents</h2>
      <div className="space-y-5">
        {(!documents || documents.length === 0) && (
          <div className="text-center py-16 text-primary/40 text-[14px] border border-primary/10 rounded-2xl bg-white shadow-sm">
            No documents uploaded yet.
          </div>
        )}
        {documents?.map(doc => {
          const jurisdiction = doc.jurisdictions as unknown as { name: string } | null
          const assignments = doc.document_assignments as unknown as { client_id: string; profiles: { first_name: string; last_name: string } }[] | null
          const statusColors: Record<string, string> = {
            uploaded: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
            assigned: 'bg-blue-50 text-blue-700 border-blue-200/50',
            published: 'bg-green-50 text-green-700 border-green-200/50',
          }

          return (
            <div key={doc.id} className="p-6 border border-primary/10 bg-white rounded-2xl hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.08)] hover:border-primary/20 transition-all duration-300 group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-serif text-xl font-semibold text-primary group-hover:text-accent transition-colors">{doc.title}</h3>
                    <span className={`px-2.5 py-1 border rounded text-[10px] font-bold uppercase tracking-widest ${statusColors[doc.status] || ''}`}>
                      {doc.status}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-[14px] font-sans text-primary/70 mb-4 leading-relaxed max-w-4xl">{doc.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-sans text-primary/50">
                    {jurisdiction && (
                      <span className="flex items-center gap-1.5 text-primary/70 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                        {jurisdiction.name}
                      </span>
                    )}
                    {doc.doc_type && doc.doc_type !== 'other' && (
                      <span className="flex items-center gap-1.5 border border-primary/10 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold">
                        {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                      </span>
                    )}
                    {doc.reference_number && (
                      <span>Ref: <span className="font-medium text-primary/70">{doc.reference_number}</span></span>
                    )}
                    {doc.issuing_body && (
                      <span>By: <span className="font-medium text-primary/70">{doc.issuing_body}</span></span>
                    )}
                    {doc.effective_date && (
                      <span>Effective: <span className="font-medium text-primary/70">{new Date(doc.effective_date).toLocaleDateString()}</span></span>
                    )}
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>Uploaded: <span className="font-medium text-primary/70">{new Date(doc.created_at).toLocaleDateString()}</span></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:shrink-0 pt-1">
                  {(doc.status === 'uploaded' || doc.status === 'assigned') && (
                    <a href={`/lawyer/documents?assign=${doc.id}`} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/50 rounded-lg hover:bg-blue-100 transition-all shadow-sm">
                      {doc.status === 'uploaded' ? 'Assign' : 'Assign More'}
                    </a>
                  )}
                  {doc.status === 'assigned' && (
                    <form action={publishDocumentAction}>
                      <input type="hidden" name="documentId" value={doc.id} />
                      <button type="submit" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200/50 rounded-lg hover:bg-green-100 transition-all shadow-sm">
                        Publish
                      </button>
                    </form>
                  )}
                  {doc.status === 'published' && (
                    <form action={unpublishDocumentAction}>
                      <input type="hidden" name="documentId" value={doc.id} />
                      <button type="submit" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200/50 rounded-lg hover:bg-yellow-100 transition-all shadow-sm">
                        Unpublish
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {doc.summary && (
                <div className="mt-5 p-4 bg-primary/[0.02] rounded-xl text-[14px] font-sans text-primary/80 border border-primary/5">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-primary/50 uppercase tracking-widest mb-1.5">
                    Lawyer&apos;s Summary
                  </span>
                  <p className="leading-relaxed">{doc.summary}</p>
                </div>
              )}
              {doc.internal_notes && (
                <div className="mt-3 p-4 bg-accent/[0.03] rounded-xl text-[14px] font-sans text-primary/80 border border-accent/10">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-accent/70 uppercase tracking-widest mb-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Internal Notes (Not Visible to Clients)
                  </span>
                  <p className="leading-relaxed">{doc.internal_notes}</p>
                </div>
              )}
              {assignments && assignments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-primary/5 text-[12px] font-sans text-primary/50">
                  <span className="font-medium uppercase tracking-wider text-[10px]">Assigned to:</span>
                  {assignments.map(a => (
                    <span key={a.client_id} className="px-2.5 py-1 bg-primary/5 rounded border border-primary/5 font-medium text-primary/80">
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
