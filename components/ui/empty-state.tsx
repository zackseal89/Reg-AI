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
        'flex flex-col items-center justify-center text-center py-16 px-6 border border-primary/10 rounded-2xl bg-white shadow-sm',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-primary/[0.04] text-primary/50 flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold text-primary mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-primary/50 max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
