'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/briefings', label: 'Briefings' },
  { href: '/dashboard/chat', label: 'Ask RegWatch' },
  { href: '/dashboard/documents', label: 'Documents' },
]

export function ClientQuickNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-6">
      {ITEMS.map(item => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-body-sm font-medium pb-4 -mb-4 border-b-2 transition-colors',
              isActive
                ? 'text-primary border-accent font-semibold'
                : 'text-ink-muted border-transparent hover:text-primary'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
