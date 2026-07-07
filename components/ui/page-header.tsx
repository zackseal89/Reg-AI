import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10',
        className
      )}
    >
      <div>
        <h1 className="text-h2 font-serif text-primary mb-1.5">{title}</h1>
        {description && (
          <p className="text-body-sm font-sans text-ink-muted max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  )
}
