'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const tabs = [
  {
    href: '/dashboard/briefings',
    label: 'Briefings',
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M3 9l9-6 9 6" />
        <path d="M12 12v4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/documents',
    label: 'Documents',
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/dashboard/chat',
    label: 'AI Chat',
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[var(--background)]/90 backdrop-blur-xl border-t border-primary/10 z-50 shadow-[0_-4px_24px_-8px_rgba(26,39,68,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[72px] max-w-lg mx-auto px-4">
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[72px] h-full transition-all duration-300 ease-out ${
                isActive ? 'text-primary' : 'text-primary/40 hover:text-primary/70'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                {tab.icon(isActive)}
              </div>
              <span className={`text-[11px] uppercase tracking-wide font-semibold transition-all duration-300 ${
                isActive ? 'text-primary opacity-100' : 'text-primary/40 opacity-0 absolute translate-y-2'
              }`}>
                {tab.label}
              </span>
              {/* Burgundy active indicator */}
              {isActive && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent animate-in fade-in zoom-in duration-300" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
