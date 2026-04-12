'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="block w-full text-center py-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
    >
      Sign Out
    </button>
  )
}
