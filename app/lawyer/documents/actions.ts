'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

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

  // Update status to assigned
  await admin
    .from('documents')
    .update({ status: 'assigned', updated_at: new Date().toISOString() })
    .eq('id', documentId)

  await logAudit(admin, {
    userId: user.id,
    action: 'document_assigned',
    entityType: 'document',
    entityId: documentId,
    details: { client_ids: clientIds },
  })

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
