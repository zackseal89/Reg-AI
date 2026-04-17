/**
 * Seed script — creates all test accounts for document upload + Gemini RAG testing.
 *
 * Creates:
 *   - Jurisdictions (CBK, ODPC) — idempotent upsert
 *   - Admin:  zacharyongeri121@gmail.com / Admin2026!
 *   - Lawyer: lawyer@mnladvocates.com   / Lawyer2026!
 *   - Client: james@paystackkenya.com   / Client2026!
 *             Company: Paystack Kenya (Fintech), linked to CBK
 *             Gemini FileSearchStore created and stored on company record
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GEMINI_API_KEY=... \
 *   npx tsx scripts/seed-test-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertAuthUser(email: string, password: string, label: string) {
  // Check if user already exists
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users.find(u => u.email === email)
  if (existing) {
    console.log(`  [skip] ${label} auth user already exists: ${existing.id}`)
    return existing.id
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) { console.error(`  [error] ${label} auth:`, error.message); process.exit(1) }
  console.log(`  [ok] ${label} auth created: ${data.user.id}`)
  return data.user.id
}

async function upsertProfile(
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'lawyer' | 'client',
  companyId?: string
) {
  const { data: existing } = await admin.from('profiles').select('id').eq('id', id).single()
  if (existing) {
    console.log(`  [skip] ${role} profile already exists`)
    return
  }
  const row: Record<string, unknown> = { id, email, first_name: firstName, last_name: lastName, role }
  if (companyId) row.company_id = companyId
  const { error } = await admin.from('profiles').insert(row)
  if (error) { console.error(`  [error] ${role} profile:`, error.message); process.exit(1) }
  console.log(`  [ok] ${role} profile created`)
}

async function getOrCreateGeminiStore(companyId: string): Promise<string | null> {
  if (!geminiApiKey) {
    console.log('  [skip] GEMINI_API_KEY not set — skipping store creation')
    return null
  }
  // Check if store already set on company
  const { data: company } = await admin.from('companies').select('gemini_store_name').eq('id', companyId).single()
  if (company?.gemini_store_name) {
    console.log(`  [skip] Gemini store already exists: ${company.gemini_store_name}`)
    return company.gemini_store_name
  }
  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey })
    const store = await ai.fileSearchStores.create({
      config: { displayName: `regwatch-${companyId}` },
    })
    const storeName = store.name!
    await admin.from('companies').update({ gemini_store_name: storeName }).eq('id', companyId)
    console.log(`  [ok] Gemini store created: ${storeName}`)
    return storeName
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`  [warn] Gemini store creation failed (non-fatal): ${msg}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('\n=== RegWatch Test Seed ===\n')

  // 1. Jurisdictions --------------------------------------------------------
  console.log('1. Seeding jurisdictions...')
  const jurisdictions = [
    { name: 'CBK', full_name: 'Central Bank of Kenya', description: 'Fintech, payments, licensing' },
    { name: 'ODPC', full_name: 'Office of the Data Protection Commissioner', description: 'Data protection, privacy' },
  ]
  for (const j of jurisdictions) {
    const { data: existing } = await admin.from('jurisdictions').select('id').eq('name', j.name).single()
    if (existing) {
      console.log(`  [skip] ${j.name} already exists`)
    } else {
      const { error } = await admin.from('jurisdictions').insert(j)
      if (error) { console.error(`  [error] ${j.name}:`, error.message); process.exit(1) }
      console.log(`  [ok] ${j.name} created`)
    }
  }

  // 2. Admin ----------------------------------------------------------------
  console.log('\n2. Admin user...')
  const adminId = await upsertAuthUser('zacharyongeri121@gmail.com', 'Admin2026!', 'admin')
  await upsertProfile(adminId, 'zacharyongeri121@gmail.com', 'Zachary', 'Ongeri', 'admin')

  // 3. Lawyer ---------------------------------------------------------------
  console.log('\n3. Lawyer user...')
  const lawyerId = await upsertAuthUser('lawyer@mnladvocates.com', 'Lawyer2026!', 'lawyer')
  await upsertProfile(lawyerId, 'lawyer@mnladvocates.com', 'Sarah', 'Kamau', 'lawyer')

  // 4. Client company -------------------------------------------------------
  console.log('\n4. Client company...')
  let companyId: string
  const { data: existingCompany } = await admin.from('companies').select('id').eq('name', 'Paystack Kenya').single()
  if (existingCompany) {
    console.log(`  [skip] Company already exists: ${existingCompany.id}`)
    companyId = existingCompany.id
  } else {
    const { data: company, error: companyErr } = await admin
      .from('companies')
      .insert({ name: 'Paystack Kenya', sector: 'Fintech' })
      .select('id')
      .single()
    if (companyErr) { console.error('  [error] Company:', companyErr.message); process.exit(1) }
    console.log(`  [ok] Company created: ${company.id}`)
    companyId = company.id
  }

  // 5. Client user ----------------------------------------------------------
  console.log('\n5. Client user...')
  const clientId = await upsertAuthUser('james@paystackkenya.com', 'Client2026!', 'client')
  await upsertProfile(clientId, 'james@paystackkenya.com', 'James', 'Mwangi', 'client', companyId)

  // 6. Link client to CBK jurisdiction --------------------------------------
  console.log('\n6. Jurisdiction link...')
  const { data: cbk } = await admin.from('jurisdictions').select('id').eq('name', 'CBK').single()
  if (!cbk) { console.error('  [error] CBK jurisdiction not found'); process.exit(1) }

  const { data: existingLink } = await admin
    .from('client_jurisdictions')
    .select('client_id')
    .eq('client_id', clientId)
    .eq('jurisdiction_id', cbk.id)
    .single()

  if (existingLink) {
    console.log('  [skip] Client already linked to CBK')
  } else {
    await admin.from('client_jurisdictions').insert({ client_id: clientId, jurisdiction_id: cbk.id })
    console.log('  [ok] Client linked to CBK')
  }

  // 7. Gemini FileSearchStore -----------------------------------------------
  console.log('\n7. Gemini FileSearchStore...')
  await getOrCreateGeminiStore(companyId)

  // 8. Summary --------------------------------------------------------------
  console.log('\n=== Test Accounts Ready ===')
  console.log('')
  console.log('  Role    Email                          Password')
  console.log('  ------  -----------------------------  -----------')
  console.log('  Admin   zacharyongeri121@gmail.com     Admin2026!')
  console.log('  Lawyer  lawyer@mnladvocates.com        Lawyer2026!')
  console.log('  Client  james@paystackkenya.com        Client2026!')
  console.log('')
  console.log('Test flow:')
  console.log('  1. Log in as Lawyer → upload a PDF document → assign to Paystack Kenya → publish')
  console.log('  2. Log in as Client → open Chat → ask a question about the document')
  console.log('  3. Log in as Admin → verify audit log entries\n')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
