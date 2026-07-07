import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const TONE_CLASSES = {
  primary: 'bg-primary/8 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-error/10 text-error',
} as const

export interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  hint?: string
  href?: string
  tone?: keyof typeof TONE_CLASSES
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = 'primary',
  className,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'p-5 h-full',
        href && 'hover:border-primary/20 hover:shadow-soft transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
            TONE_CLASSES[tone]
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {href && (
          <ChevronRight className="w-4 h-4 text-ink-faint mt-2 shrink-0" />
        )}
      </div>
      <p className="text-body-sm font-semibold text-ink-secondary mt-4">
        {label}
      </p>
      <p className="text-h1 font-serif font-bold text-primary mt-1 tracking-tight">
        {value}
      </p>
      {hint && <p className="text-caption text-ink-muted mt-1">{hint}</p>}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    )
  }

  return content
}
