'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  Globe2,
  CalendarClock,
  Activity,
  LayoutTemplate,
  BookOpen,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  ClipboardCheck,
  Bell,
  ClipboardList,
  Scale,
  ScrollText,
  UserCog,
  Bot,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PortalRole = 'client' | 'lawyer' | 'admin'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badgeKey?: 'approvals' | 'alerts'
}
type NavSection = { label?: string; items: NavItem[] }

const NAV: Record<PortalRole, NavSection[]> = {
  client: [
    {
      label: 'Client Portal',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/dashboard/briefings', label: 'Briefings', icon: FileText },
        { href: '/dashboard/chat', label: 'Ask RegWatch', icon: MessageSquare },
        { href: '/dashboard/documents', label: 'Documents', icon: FolderOpen },
        { href: '/dashboard/alerts', label: 'Alerts', icon: Bell, badgeKey: 'alerts' },
        { href: '/dashboard/regulatory-timeline', label: 'Regulatory Timeline', icon: CalendarClock },
        { href: '/dashboard/obligations', label: 'Obligations', icon: ClipboardList },
        { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
      ],
    },
  ],
  lawyer: [
    {
      label: 'Workspace',
      items: [
        { href: '/lawyer', label: 'Dashboard', icon: Home },
        { href: '/lawyer/briefings', label: 'Briefings', icon: FileText },
        { href: '/lawyer/documents', label: 'Documents', icon: FolderOpen },
        { href: '/lawyer/approvals', label: 'Approvals', icon: ClipboardCheck, badgeKey: 'approvals' },
        { href: '/lawyer/clients', label: 'Clients', icon: Users },
        { href: '/lawyer/jurisdictions', label: 'Jurisdictions', icon: Globe2 },
        { href: '/lawyer/regulatory-timeline', label: 'Regulatory Timeline', icon: CalendarClock },
        { href: '/lawyer/activity', label: 'Activity', icon: Activity },
      ],
    },
    {
      label: 'Tools',
      items: [
        { href: '/lawyer/templates', label: 'Templates', icon: LayoutTemplate },
        { href: '/lawyer/clause-library', label: 'Clause Library', icon: BookOpen },
        { href: '/lawyer/authorities', label: 'Authorities', icon: Building2 },
        { href: '/lawyer/reports', label: 'Reports', icon: BarChart3 },
      ],
    },
  ],
  admin: [
    {
      label: 'Admin Console',
      items: [
        { href: '/admin', label: 'Overview', icon: Home },
        { href: '/admin/clients', label: 'Clients', icon: Users },
        { href: '/admin/lawyers', label: 'Lawyers', icon: Scale },
        { href: '/admin/documents', label: 'Documents', icon: FolderOpen },
        { href: '/admin/briefings', label: 'Briefings', icon: FileText },
        { href: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck, badgeKey: 'approvals' },
        { href: '/admin/jurisdictions', label: 'Jurisdictions', icon: Globe2 },
        { href: '/admin/users-roles', label: 'Users & Roles', icon: UserCog },
        { href: '/admin/ai-config', label: 'AI Assistant Config', icon: Bot },
        { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
        { href: '/admin/system-settings', label: 'System Settings', icon: SlidersHorizontal },
      ],
    },
    {
      label: 'Tools',
      items: [
        { href: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
        { href: '/admin/clause-library', label: 'Clause Library', icon: BookOpen },
        { href: '/admin/authorities', label: 'Authorities', icon: Building2 },
        { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
      ],
    },
  ],
}

const ROOT: Record<PortalRole, string> = {
  client: '/dashboard',
  lawyer: '/lawyer',
  admin: '/admin',
}

export function Sidebar({
  role,
  companyName,
  userEmail,
  displayName,
  roleLabel,
  initials,
  counts,
  onNavigate,
}: {
  role: PortalRole
  companyName?: string | null
  userEmail?: string | null
  /** Lawyer/admin footer: full name shown above the role label */
  displayName?: string | null
  /** Lawyer/admin footer: e.g. "Senior Associate" / "System Administrator" */
  roleLabel?: string | null
  initials?: string | null
  counts?: { approvals?: number; alerts?: number }
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const root = ROOT[role]
  const sections = NAV[role]

  return (
    <div className="h-full w-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-7 border-b border-sidebar-border">
        <h2 className="font-serif text-[24px] font-semibold text-white tracking-tight leading-none">
          RegWatch
        </h2>
        <span className="text-[10px] font-semibold text-sidebar-muted tracking-[0.24em] uppercase block mt-2">
          MN Legal
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label ?? 'main'}>
            {section.label && (
              <span className="block px-3.5 mb-1.5 text-[10px] font-bold text-sidebar-faint tracking-[0.16em] uppercase">
                {section.label}
              </span>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== root && pathname.startsWith(item.href))
                const Icon = item.icon
                const badgeValue =
                  item.badgeKey && counts?.[item.badgeKey] !== undefined
                    ? counts[item.badgeKey]
                    : undefined

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'relative flex items-center gap-3 px-3.5 py-2 rounded-md text-body-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-accent" />
                    )}
                    <Icon
                      className="w-4 h-4 shrink-0"
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    <span className="truncate flex-1">{item.label}</span>
                    {badgeValue !== undefined && badgeValue > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-white shrink-0">
                        {badgeValue}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="pt-1 space-y-0.5">
          <Link
            href="#"
            className="flex items-center gap-3 px-3.5 py-2 rounded-md text-body-sm font-medium text-sidebar-muted hover:bg-sidebar-hover hover:text-white transition-colors duration-150"
          >
            <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            Settings
          </Link>
          <Link
            href={`${root}/support`}
            className="flex items-center gap-3 px-3.5 py-2 rounded-md text-body-sm font-medium text-sidebar-muted hover:bg-sidebar-hover hover:text-white transition-colors duration-150"
          >
            <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            Support
          </Link>
        </div>
      </nav>

      {role === 'lawyer' && companyName && (
        <div className="mx-3 mb-3 px-3.5 py-2.5 rounded-lg bg-white/5 border border-sidebar-border">
          <span className="text-[10px] font-bold text-sidebar-faint tracking-[0.16em] uppercase block mb-1">
            Current Client
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm font-semibold text-white truncate">
              {companyName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-sidebar-faint shrink-0" />
          </div>
        </div>
      )}

      <div className="px-6 py-5 border-t border-sidebar-border">
        {role === 'client' ? (
          <>
            <span className="text-[10px] font-bold text-sidebar-faint tracking-[0.16em] uppercase block mb-0.5">
              Reviewed by
            </span>
            <span className="text-caption font-medium text-white/80">
              MNL Advocates LLP
            </span>
          </>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-eyebrow text-white shrink-0">
              {initials || '?'}
            </span>
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-white truncate">
                {displayName || userEmail}
              </p>
              <p className="text-caption text-sidebar-faint truncate">
                {roleLabel}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
