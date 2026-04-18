'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'
import { indexDocumentInStore, removeDocumentFromStore } from '@/lib/gemini'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Shared helper: index a document into each assigned client's Gemini store
// Called by both uploadDocumentAction (when publish) and publishDocumentAction
// ---------------------------------------------------------------------------

async function triggerGeminiIndexing(
  admin: SupabaseClient,
  documentId: string
): Promise<void> {
  // Get the document's PDF from storage
  const { data: doc, error: docErr } = await admin
    .from('documents')
    .select('storage_path, title')
    .eq('id', documentId)
    .single()

  if (docErr || !doc) {
    console.error('[gemini-index] Document not found:', docErr?.message)
    return
  }

  // REG-44: document_assignments has no company_id column — join through
  // profiles.company_id → companies to get each assigned client's store name.
  const { data: assignments } = await admin
    .from('document_assignments')
    .select('client_id, profiles:client_id(company_id, companies:company_id(gemini_store_name))')
    .eq('document_id', documentId)

  if (!assignments || assignments.length === 0) {
    console.warn('[gemini-index] No assignments found for document:', documentId)
    return
  }

  // Download PDF
  const { data: fileData, error: fileErr } = await admin.storage
    .from('documents')
    .download(doc.storage_path)

  if (fileErr || !fileData) {
    console.error('[gemini-index] PDF download failed:', fileErr?.message)
    return
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Index into each assigned client's store
  for (const assignment of assignments) {
    const profile = (assignment.profiles as unknown as {
      company_id: string | null
      companies: { gemini_store_name: string | null } | null
    } | null)
    const storeName = profile?.companies?.gemini_store_name
    if (!storeName) {
      console.warn('[gemini-index] No store for client:', assignment.client_id)
      continue
    }

    try {
      const geminiFileId = await indexDocumentInStore(
        storeName,
        buffer,
        doc.title,
        documentId
      )

      // Save gemini_file_id for later deletion on unpublish
      await admin
        .from('documents')
        .update({ gemini_file_id: geminiFileId, processed: true })
        .eq('id', documentId)
    } catch (err) {
      console.error('[gemini-index] Indexing failed for store:', storeName, err)
      // Continue with other assignments — don't block the whole publish
    }
  }
}

// ---------------------------------------------------------------------------
// Targeted helper: index a document into ONLY the specified clients' stores.
// Used when assigning an already-published document to new clients (REG-43).
// Queries via profiles.company_id since document_assignments has no company_id
// column — this is the correct join path through the schema.
// ---------------------------------------------------------------------------

async function indexDocumentForClients(
  admin: SupabaseClient,
  documentId: string,
  clientIds: string[]
): Promise<void> {
  if (clientIds.length === 0) return

  const { data: doc, error: docErr } = await admin
    .from('documents')
    .select('storage_path, title, status')
    .eq('id', documentId)
    .single()

  if (docErr || !doc) {
    console.error('[gemini-assign-index] Document not found:', docErr?.message)
    return
  }

  if (doc.status !== 'published') {
    // Not yet published — publish flow will index when it runs. Nothing to do.
    return
  }

  const { data: profiles, error: profErr } = await admin
    .from('profiles')
    .select('id, company_id, companies:company_id(gemini_store_name)')
    .in('id', clientIds)

  if (profErr || !profiles || profiles.length === 0) {
    console.warn('[gemini-assign-index] No profiles for clients:', clientIds, profErr?.message)
    return
  }

  const { data: fileData, error: fileErr } = await admin.storage
    .from('documents')
    .download(doc.storage_path)

  if (fileErr || !fileData) {
    console.error('[gemini-assign-index] PDF download failed:', fileErr?.message)
    return
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  for (const profile of profiles) {
    const storeName = (profile.companies as unknown as { gemini_store_name: string | null } | null)?.gemini_store_name
    if (!storeName) {
      console.warn('[gemini-assign-index] No gemini store for client:', profile.id)
      continue
    }

    try {
      await indexDocumentInStore(storeName, buffer, doc.title, documentId)
    } catch (err) {
      console.error('[gemini-assign-index] Indexing failed for store:', storeName, err)
      // Per-client isolation — a single failure does not block the others
    }
  }
}

// ---------------------------------------------------------------------------
// Shared helper: remove a document from all assigned clients' Gemini stores
// Called by unpublishDocumentAction
// ---------------------------------------------------------------------------

async function triggerGeminiRemoval(
  admin: SupabaseClient,
  documentId: string
): Promise<void> {
  const { data: doc } = await admin
    .from('documents')
    .select('gemini_file_id')
    .eq('id', documentId)
    .single()

  if (!doc?.gemini_file_id) return

  const { data: assignments } = await admin
    .from('document_assignments')
    .select('company_id, companies(gemini_store_name)')
    .eq('document_id', documentId)

  for (const assignment of assignments ?? []) {
    const storeName = (assignment.companies as unknown as { gemini_store_name: string | null } | null)?.gemini_store_name
    if (!storeName) continue

    try {
      await removeDocumentFromStore(storeName, doc.gemini_file_id)
    } catch (err) {
      console.error('[gemini-remove] Removal failed for store:', storeName, err)
    }
  }

  // Clear the gemini_file_id
  await admin
    .from('documents')
    .update({ gemini_file_id: null, processed: false })
    .eq('id', documentId)
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const docType = formData.get('docType') as string
  const jurisdictionId = formData.get('jurisdictionId') as string
  const referenceNumber = formData.get('referenceNumber') as string
  const issuingBody = formData.get('issuingBody') as string
  const effectiveDate = formData.get('effectiveDate') as string
  const summary = formData.get('summary') as string
  const internalNotes = formData.get('internalNotes') as string
  const submitMode = formData.get('submitMode') as string // 'draft' | 'assign' | 'publish'
  const clientIds = formData.getAll('clientIds') as string[]
  const file = formData.get('file') as File

  if (!file || file.size === 0) {
    redirect('/lawyer/documents?error=No file selected')
  }

  // Convert File to ArrayBuffer for reliable upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const storagePath = `uploads/${fileName}`

  const { error: uploadError } = await admin.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    redirect('/lawyer/documents?error=' + encodeURIComponent(uploadError.message))
  }

  // Determine initial status based on submit mode
  let status: 'uploaded' | 'assigned' | 'published' = 'uploaded'
  if (submitMode === 'assign' && clientIds.length > 0) status = 'assigned'
  if (submitMode === 'publish' && clientIds.length > 0) status = 'published'

  // Create document record with full metadata
  const { data: doc, error: docError } = await admin
    .from('documents')
    .insert({
      title,
      description: description || null,
      doc_type: docType || 'other',
      storage_path: storagePath,
      status,
      jurisdiction_id: jurisdictionId,
      reference_number: referenceNumber || null,
      issuing_body: issuingBody || null,
      effective_date: effectiveDate || null,
      summary: summary || null,
      internal_notes: internalNotes || null,
      file_name: file.name,
      file_size_bytes: file.size,
      uploaded_by: user.id,
    })
    .select('id')
    .single()

  if (docError) {
    await admin.storage.from('documents').remove([storagePath])
    redirect('/lawyer/documents?error=' + encodeURIComponent(docError.message))
  }

  // Assign to clients if any selected
  if (clientIds.length > 0 && (submitMode === 'assign' || submitMode === 'publish')) {
    const rows = clientIds.map(cId => ({
      document_id: doc.id,
      client_id: cId,
      assigned_by: user.id,
    }))
    await admin.from('document_assignments').insert(rows)
  }

  // If publishing on upload, trigger Gemini indexing immediately
  if (status === 'published') {
    await triggerGeminiIndexing(admin, doc.id)
  }

  // Audit log
  await logAudit(admin, {
    userId: user.id,
    action: submitMode === 'publish' ? 'document_published' : submitMode === 'assign' ? 'document_assigned' : 'document_uploaded',
    entityType: 'document',
    entityId: doc.id,
    details: {
      title,
      doc_type: docType,
      jurisdiction_id: jurisdictionId,
      reference_number: referenceNumber,
      submit_mode: submitMode,
      assigned_clients: clientIds,
    },
  })

  redirect('/lawyer/documents')
}

export async function assignDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const documentId = formData.get('documentId') as string
  const clientIds = formData.getAll('clientIds') as string[]

  if (clientIds.length === 0) {
    redirect('/lawyer/documents?error=Select at least one client')
  }

  // Insert assignments
  const rows = clientIds.map(cId => ({
    document_id: documentId,
    client_id: cId,
    assigned_by: user.id,
  }))

  const { error } = await admin
    .from('document_assignments')
    .upsert(rows, { onConflict: 'document_id,client_id' })

  if (error) {
    redirect('/lawyer/documents?error=' + encodeURIComponent(error.message))
  }

  // Fetch current status. Only transition to 'assigned' if it isn't already
  // 'published' — otherwise we'd regress the doc into a draft state.
  const { data: doc } = await admin
    .from('documents')
    .select('status')
    .eq('id', documentId)
    .single()

  const isAlreadyPublished = doc?.status === 'published'

  if (!isAlreadyPublished) {
    await admin
      .from('documents')
      .update({ status: 'assigned', updated_at: new Date().toISOString() })
      .eq('id', documentId)
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'document_assigned',
    entityType: 'document',
    entityId: documentId,
    details: { client_ids: clientIds },
  })

  // REG-43: if the doc is already published, the new clients' Gemini stores
  // must receive the file — publishDocumentAction only runs once per doc.
  if (isAlreadyPublished) {
    await indexDocumentForClients(admin, documentId, clientIds)
  }

  redirect('/lawyer/documents')
}

export async function publishDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const documentId = formData.get('documentId') as string

  const { error } = await admin
    .from('documents')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', documentId)

  if (error) {
    redirect('/lawyer/documents?error=' + encodeURIComponent(error.message))
  }

  // Index document into assigned clients' Gemini FileSearchStores
  await triggerGeminiIndexing(admin, documentId)

  await logAudit(admin, {
    userId: user.id,
    action: 'document_published',
    entityType: 'document',
    entityId: documentId,
  })

  redirect('/lawyer/documents')
}

export async function unpublishDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const documentId = formData.get('documentId') as string

  // Remove document from all clients' Gemini FileSearchStores
  await triggerGeminiRemoval(admin, documentId)

  const { error } = await admin
    .from('documents')
    .update({ status: 'assigned', updated_at: new Date().toISOString() })
    .eq('id', documentId)

  if (error) {
    redirect('/lawyer/documents?error=' + encodeURIComponent(error.message))
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'document_unpublished',
    entityType: 'document',
    entityId: documentId,
  })

  redirect('/lawyer/documents')
}
