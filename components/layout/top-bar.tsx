import { Search, Bell, Building2 } from 'lucide-react'
import { MobileDrawer } from './mobile-drawer'
import { ClientQuickNav } from './client-quick-nav'
import { UserMenu } from './user-menu'
import type { PortalRole } from './sidebar'

export function TopBar({
  role,
  companyName,
  userEmail,
  displayName,
  roleLabel,
  initials,
  counts,
}: {
  role: PortalRole
  companyName?: string | null
  userEmail?: string | null
  displayName: string
  roleLabel?: string | null
  initials: string
  counts?: { approvals?: number; alerts?: number }
}) {
  return (
    <header
      className="h-16 bg-white/85 backdrop-blur-xl border-b border-hairline px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-40 sticky top-0"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <MobileDrawer
          role={role}
          companyName={companyName}
          userEmail={userEmail}
          displayName={displayName}
          roleLabel={roleLabel}
          initials={initials}
          counts={counts}
        />

        {role === 'client' ? (
          <>
            {companyName && (
              <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-hairline shrink-0">
                <Building2 className="w-4 h-4 text-ink-faint" strokeWidth={1.75} />
                <div className="leading-tight">
                  <span className="block text-[10px] font-bold text-ink-faint tracking-[0.14em] uppercase">
                    Current Client
                  </span>
                  <span className="block text-body-sm font-semibold text-primary">
                    {companyName}
                  </span>
                </div>
              </div>
            )}
            <ClientQuickNav />
          </>
        ) : (
          <div className="hidden lg:flex items-center gap-2.5 flex-1 max-w-md px-3.5 py-2 rounded-lg bg-surface-low/60 border border-hairline text-ink-faint">
            <Search className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span className="text-body-sm truncate flex-1">
              Search regulations, documents, clients, briefings…
            </span>
            <kbd className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-hairline bg-white text-ink-faint shrink-0">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          disabled
          aria-label="Notifications — coming soon"
          title="Notifications — coming soon"
          className="p-2 rounded-full text-ink-faint disabled:cursor-default"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
        <UserMenu
          displayName={displayName}
          roleLabel={roleLabel}
          initials={initials}
          email={userEmail}
          profileHref={role === 'client' ? '/dashboard/profile' : undefined}
        />
      </div>
    </header>
  )
}
