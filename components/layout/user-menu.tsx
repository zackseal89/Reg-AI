'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function UserMenu({
  displayName,
  roleLabel,
  initials,
  email,
  profileHref,
}: {
  displayName: string
  roleLabel?: string | null
  initials: string
  email?: string | null
  profileHref?: string
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-primary/[0.04] transition-colors outline-none">
        <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-eyebrow text-white shrink-0">
          {initials}
        </span>
        <span className="hidden md:block text-left leading-tight">
          <span className="block text-body-sm font-semibold text-primary">
            {displayName}
          </span>
          {roleLabel && (
            <span className="block text-caption text-ink-muted">
              {roleLabel}
            </span>
          )}
        </span>
        <ChevronDown className="hidden md:block w-3.5 h-3.5 text-ink-faint" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {email && <DropdownMenuLabel>{email}</DropdownMenuLabel>}
        <DropdownMenuSeparator />
        {profileHref && (
          <Link href={profileHref}>
            <DropdownMenuItem>
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuItem destructive onSelect={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
