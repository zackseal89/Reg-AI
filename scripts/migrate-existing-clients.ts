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

  // 1. Get all companies
  const { data: companies, error: compErr } = await admin
    .from('companies')
    .select('id, name, gemini_store_name')

  if (compErr) {
    console.error('Failed to fetch companies:', compErr.message)
    process.exit(1)
  }

  if (!companies || companies.length === 0) {
    console.log('✓ No companies found. Nothing to do.')
    return
  }

  console.log(`Checking ${companies.length} companies for Gemini stores.\n`)

  for (const company of companies) {
    let storeName = company.gemini_store_name
    console.log(`Processing "${company.name}" (${company.id})...`)

    if (!storeName) {
      try {
        storeName = await createClientStore(company.id)
        await admin
          .from('companies')
          .update({ gemini_store_name: storeName })
          .eq('id', company.id)

        console.log(`  ✓ Store created: ${storeName}`)
      } catch (err) {
        console.error(`  ✗ Failed to create store:`, err)
        continue
      }
    } else {
      console.log(`  ✓ Store already exists: ${storeName}`)
    }

    // 2. Get their published documents via assignments
    const { data: profiles } = await admin
      .from('profiles')
      .select('id')
      .eq('company_id', company.id);

    const clientIds = profiles?.map(p => p.id) || [];

    const { data: assignments, error: assignmentsError } = await admin
      .from('document_assignments')
      .select('document_id, documents!inner(storage_path, title, status)')
      .in('client_id', clientIds)

    if (assignmentsError) {
      console.error('  ✗ Failed to fetch assignments:', assignmentsError.message)
      continue
    }

    if (!assignments || assignments.length === 0) {
      console.log('  No published assignments found.\n')
      continue
    }

    // Ensure store was successfully created or retrieved above
    if (!storeName) {
      console.log('  ✗ Skipped indexing due to missing store name.')
      continue
    }

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
