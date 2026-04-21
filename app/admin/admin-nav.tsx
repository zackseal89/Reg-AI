'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Scale, Users, ScrollText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin', label: 'Metrics', icon: BarChart3 },
  { href: '/admin/lawyers', label: 'Lawyers', icon: Scale },
  { href: '/admin/clients', label: 'All Clients', icon: Users },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-5 space-y-0.5 relative z-10">
      {navItems.map(item => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/admin' && pathname.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200 ${
              isActive
                ? 'bg-white/[0.06] text-white'
                : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-accent" />
            )}
            <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
