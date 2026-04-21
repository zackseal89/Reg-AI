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
        'flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10 pb-6 border-b border-primary/5',
        className
      )}
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[15px] font-sans text-primary/60 max-w-2xl leading-relaxed">
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
