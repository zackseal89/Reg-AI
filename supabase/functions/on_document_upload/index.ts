import { createClient } from 'jsr:@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Post-Gemini migration: this edge function only validates document uploads.
// All RAG indexing (chunking, embedding, vector storage) is now handled by
// Gemini File Search via the publishDocumentAction server action in Next.js.
// ---------------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record ?? payload
    const documentId: string = record.id

    if (!documentId) {
      return new Response('Missing document id', { status: 400 })
    }

    // Verify document exists and is accessible
    const { data: doc, error } = await supabase
      .from('documents')
      .select('id, storage_path, title, uploaded_by')
      .eq('id', documentId)
      .single()

    if (error || !doc) {
      throw new Error(`Document not found: ${error?.message}`)
    }

    // Audit log — document upload received
    await supabase.from('audit_logs').insert({
      user_id: doc.uploaded_by,
      action: 'document_upload_received',
      entity_type: 'document',
      entity_id: documentId,
      details: {
        title: doc.title,
        storage_path: doc.storage_path,
      },
    })

    return new Response(
      JSON.stringify({ success: true, document_id: documentId }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[on_document_upload]', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
