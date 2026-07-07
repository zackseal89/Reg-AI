import * as React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PanelCard({
  title,
  viewAllHref,
  viewAllLabel = 'View all',
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: React.ReactNode
  viewAllHref?: string
  viewAllLabel?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline/60 shrink-0">
        <h3 className="text-title font-serif font-bold text-primary">
          {title}
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          {actions}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-caption font-semibold text-accent hover:text-accent-active transition-colors whitespace-nowrap"
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>
      </div>
      <div className={cn('p-5 flex-1 min-h-0', bodyClassName)}>
        {children}
      </div>
    </Card>
  )
}
