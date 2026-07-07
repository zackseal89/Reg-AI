'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { Sidebar, type PortalRole } from './sidebar'

export function MobileDrawer({
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
  displayName?: string | null
  roleLabel?: string | null
  initials?: string | null
  counts?: { approvals?: number; alerts?: number }
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-2 rounded-md text-ink-muted hover:bg-primary/5 hover:text-primary transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-in slide-in-from-left duration-300">
              <div className="relative h-full shadow-elevated">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-md text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
                <Sidebar
                  role={role}
                  companyName={companyName}
                  userEmail={userEmail}
                  displayName={displayName}
                  roleLabel={roleLabel}
                  initials={initials}
                  counts={counts}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
