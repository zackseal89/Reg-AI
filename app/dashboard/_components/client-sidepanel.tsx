'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  FolderOpen,
  MessageSquare,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/briefings', label: 'Briefings', icon: FileText },
  { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen },
  { href: '/dashboard/chat', label: 'AI Counsel', icon: MessageSquare },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export function ClientSidepanel({
  companyName,
  onNavigate,
}: {
  companyName?: string | null
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="h-full flex flex-col bg-[var(--background)] border-r border-primary/10">
      <div className="px-6 py-8 border-b border-primary/5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(139,28,63,0.4)]" />
          <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">
            RegWatch
          </h2>
        </div>
        <span className="text-accent text-[11px] font-bold uppercase tracking-widest block ml-4 truncate">
          {companyName ?? 'Client Portal'}
        </span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-primary/[0.05] text-primary'
                  : 'text-primary/55 hover:bg-primary/[0.03] hover:text-primary'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-accent" />
              )}
              <Icon
                className="w-4 h-4 shrink-0"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-5 border-t border-primary/5 bg-white/40">
        <span className="text-[10px] text-primary/40 uppercase tracking-widest font-bold block mb-1">
          Reviewed by
        </span>
        <span className="text-xs font-medium text-primary/70">
          MNL Advocates LLP
        </span>
      </div>
    </div>
  )
}
