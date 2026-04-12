import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seed() {
  // 1. Create lawyer
  const { data: lawyerAuth, error: lawyerAuthErr } = await admin.auth.admin.createUser({
    email: 'lawyer@mnladvocates.com',
    password: 'Lawyer2026!',
    email_confirm: true,
  })
  if (lawyerAuthErr) { console.error('Lawyer auth:', lawyerAuthErr.message); process.exit(1) }
  console.log('Lawyer auth created:', lawyerAuth.user.id)

  const { error: lawyerProfileErr } = await admin.from('profiles').insert({
    id: lawyerAuth.user.id,
    email: 'lawyer@mnladvocates.com',
    first_name: 'Sarah',
    last_name: 'Kamau',
    role: 'lawyer',
  })
  if (lawyerProfileErr) { console.error('Lawyer profile:', lawyerProfileErr.message); process.exit(1) }
  console.log('Lawyer profile created')

  // 2. Create company for client
  const { data: company, error: companyErr } = await admin.from('companies').insert({
    name: 'Paystack Kenya',
    sector: 'Fintech',
  }).select('id').single()
  if (companyErr) { console.error('Company:', companyErr.message); process.exit(1) }
  console.log('Company created:', company.id)

  // 3. Create client
  const { data: clientAuth, error: clientAuthErr } = await admin.auth.admin.createUser({
    email: 'client@paystackkenya.com',
    password: 'Client2026!',
    email_confirm: true,
  })
  if (clientAuthErr) { console.error('Client auth:', clientAuthErr.message); process.exit(1) }
  console.log('Client auth created:', clientAuth.user.id)

  const { error: clientProfileErr } = await admin.from('profiles').insert({
    id: clientAuth.user.id,
    email: 'client@paystackkenya.com',
    first_name: 'James',
    last_name: 'Mwangi',
    role: 'client',
    company_id: company.id,
  })
  if (clientProfileErr) { console.error('Client profile:', clientProfileErr.message); process.exit(1) }
  console.log('Client profile created')

  // 4. Link client to CBK jurisdiction
  const { data: cbk } = await admin.from('jurisdictions').select('id').eq('name', 'CBK').single()
  await admin.from('client_jurisdictions').insert({
    client_id: clientAuth.user.id,
    jurisdiction_id: cbk!.id,
  })
  console.log('Client linked to CBK jurisdiction')

  console.log('\n--- All test accounts ready ---')
}

seed()
