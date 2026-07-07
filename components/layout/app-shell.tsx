import { Sidebar, type PortalRole } from './sidebar'
import { TopBar } from './top-bar'

export function AppShell({
  role,
  companyName,
  userEmail,
  displayName,
  roleLabel,
  initials,
  counts,
  children,
}: {
  role: PortalRole
  companyName?: string | null
  userEmail?: string | null
  /** Full name shown in the top bar / sidebar footer (lawyer & admin) */
  displayName?: string | null
  /** e.g. "Senior Associate", "System Administrator" */
  roleLabel?: string | null
  /** Avatar initials */
  initials?: string | null
  counts?: { approvals?: number; alerts?: number }
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-surface">
      <aside className="hidden lg:flex w-64 shrink-0">
        <Sidebar
          role={role}
          companyName={companyName}
          userEmail={userEmail}
          displayName={displayName}
          roleLabel={roleLabel}
          initials={initials}
          counts={counts}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          role={role}
          companyName={companyName}
          userEmail={userEmail}
          displayName={displayName || 'there'}
          roleLabel={roleLabel}
          initials={initials || '?'}
          counts={counts}
        />

        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
