'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/lawyer', label: 'Overview' },
  { href: '/lawyer/clients', label: 'Clients' },
  { href: '/lawyer/documents', label: 'Documents' },
  { href: '/lawyer/briefings', label: 'Briefings' },
]

export default function LawyerNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/lawyer' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 uppercase tracking-wider ${
              isActive
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
