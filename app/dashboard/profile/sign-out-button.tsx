'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      className="w-full text-accent hover:bg-accent/5 hover:text-accent"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  )
}
