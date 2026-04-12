import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seedAdmin() {
  const email = 'zacharyongeri121@gmail.com'
  const password = 'Ongeri89@'

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    console.error('Auth error:', authError.message)
    process.exit(1)
  }

  console.log('Auth user created:', authData.user.id)

  // Create profile with admin role
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email,
    first_name: 'Zachary',
    last_name: 'Ongeri',
    role: 'admin',
  })

  if (profileError) {
    console.error('Profile error:', profileError.message)
    process.exit(1)
  }

  console.log('Admin profile created successfully')
}

seedAdmin()
