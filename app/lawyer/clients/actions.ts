'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const companyName = formData.get('companyName') as string
  const sector = formData.get('sector') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const jurisdictionIds = formData.getAll('jurisdictions') as string[]

  // 1. Create company
  const { data: company, error: companyError } = await admin
    .from('companies')
    .insert({ name: companyName, sector })
    .select('id')
    .single()

  if (companyError) {
    redirect('/lawyer/clients?error=' + encodeURIComponent(companyError.message))
  }

  // 2. Create auth user with invite (sends magic link email)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name: firstName, last_name: lastName },
  })

  if (authError) {
    // Clean up company
    await admin.from('companies').delete().eq('id', company.id)
    redirect('/lawyer/clients?error=' + encodeURIComponent(authError.message))
  }

  // 3. Create profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    role: 'client',
    company_id: company.id,
  })

  if (profileError) {
    redirect('/lawyer/clients?error=' + encodeURIComponent(profileError.message))
  }

  // 4. Link jurisdictions
  if (jurisdictionIds.length > 0) {
    const junctionRows = jurisdictionIds.map(jId => ({
      client_id: authData.user.id,
      jurisdiction_id: jId,
    }))
    await admin.from('client_jurisdictions').insert(junctionRows)
  }

  // 5. Create Gemini FileSearchStore for this client's RAG pipeline
  try {
    const { createClientStore } = await import('@/lib/gemini')
    const storeName = await createClientStore(company.id)
    await admin
      .from('companies')
      .update({ gemini_store_name: storeName })
      .eq('id', company.id)
  } catch (storeErr) {
    console.error('[onboard] Failed to create Gemini store:', storeErr)
    // Non-fatal — client can still be onboarded; store can be created later
  }

  // 6. Audit log
  await logAudit(admin, {
    userId: user.id,
    action: 'client_created',
    entityType: 'profile',
    entityId: authData.user.id,
    details: { company: companyName, email, jurisdictions: jurisdictionIds },
  })

  redirect('/lawyer/clients')
}

export async function activateClientAction(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clientId = formData.get('clientId') as string

  // Generate a random password and send reset email
  const { error } = await admin.auth.admin.updateUserById(clientId, {
    email_confirm: true,
  })

  if (error) {
    redirect('/lawyer/clients?error=' + encodeURIComponent(error.message))
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'client_activated',
    entityType: 'profile',
    entityId: clientId,
  })

  redirect('/lawyer/clients')
}

export async function suspendClientAction(formData: FormData) {
  const admin = createAdminClient()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clientId = formData.get('clientId') as string

  const { error } = await admin.auth.admin.updateUserById(clientId, {
    ban_duration: '876600h', // ~100 years
  })

  if (error) {
    redirect('/lawyer/clients?error=' + encodeURIComponent(error.message))
  }

  await logAudit(admin, {
    userId: user.id,
    action: 'client_suspended',
    entityType: 'profile',
    entityId: clientId,
  })

  redirect('/lawyer/clients')
}
