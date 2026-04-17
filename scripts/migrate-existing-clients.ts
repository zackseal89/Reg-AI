/**
 * Retroactive migration script — Phase A (Gemini File Search)
 *
 * Creates FileSearchStores for any existing companies that don't have one,
 * then re-indexes all their published documents into the store.
 *
 * Run once with: npx tsx scripts/migrate-existing-clients.ts
 */

import { createAdminClient } from '../lib/supabase/admin'
import { createClientStore, indexDocumentInStore } from '../lib/gemini'

async function main() {
  const admin = createAdminClient()

  // 1. Get all companies without a Gemini store
  const { data: companies, error: compErr } = await admin
    .from('companies')
    .select('id, name')
    .is('gemini_store_name', null)

  if (compErr) {
    console.error('Failed to fetch companies:', compErr.message)
    process.exit(1)
  }

  if (!companies || companies.length === 0) {
    console.log('✓ All companies already have a Gemini store. Nothing to do.')
    return
  }

  console.log(`Found ${companies.length} companies without a Gemini store.\n`)

  for (const company of companies) {
    console.log(`Creating store for "${company.name}" (${company.id})...`)

    try {
      const storeName = await createClientStore(company.id)
      await admin
        .from('companies')
        .update({ gemini_store_name: storeName })
        .eq('id', company.id)

      console.log(`  ✓ Store created: ${storeName}`)
    } catch (err) {
      console.error(`  ✗ Failed to create store:`, err)
      continue
    }

    // 2. Get their published documents via assignments
    const { data: assignments } = await admin
      .from('document_assignments')
      .select('document_id, documents(storage_path, title, status)')
      .eq('company_id', company.id)

    if (!assignments || assignments.length === 0) {
      console.log('  No document assignments found.\n')
      continue
    }

    // Need the store name we just created
    const { data: freshCompany } = await admin
      .from('companies')
      .select('gemini_store_name')
      .eq('id', company.id)
      .single()

    const storeName = freshCompany?.gemini_store_name
    if (!storeName) continue

    for (const assignment of assignments) {
      const doc = assignment.documents as unknown as {
        storage_path: string
        title: string
        status: string
      } | null

      if (!doc || doc.status !== 'published') continue

      console.log(`  Indexing: "${doc.title}"...`)

      try {
        const { data: fileData } = await admin.storage
          .from('documents')
          .download(doc.storage_path)

        if (!fileData) {
          console.error(`  ✗ Failed to download: ${doc.storage_path}`)
          continue
        }

        const buffer = Buffer.from(await fileData.arrayBuffer())
        const geminiFileId = await indexDocumentInStore(
          storeName,
          buffer,
          doc.title,
          assignment.document_id
        )

        await admin
          .from('documents')
          .update({ gemini_file_id: geminiFileId, processed: true })
          .eq('id', assignment.document_id)

        console.log(`  ✓ Indexed (file: ${geminiFileId})`)
      } catch (err) {
        console.error(`  ✗ Indexing failed:`, err)
      }
    }

    console.log('')
  }

  console.log('Migration complete.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
