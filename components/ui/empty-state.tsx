import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-surface-low/50 border border-hairline/60',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-white border border-hairline text-ink-faint flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-title text-primary mb-1.5">{title}</h3>
      {description && (
        <p className="text-body-sm text-ink-muted max-w-sm mb-5">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
