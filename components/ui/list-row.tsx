import * as React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONE_CLASSES = {
  primary: 'bg-primary/8 text-primary',
  accent: 'bg-accent/10 text-accent',
} as const

export function ListRow({
  icon: Icon,
  title,
  meta,
  right,
  href,
  tone = 'primary',
  className,
}: {
  icon: LucideIcon
  title: React.ReactNode
  meta?: React.ReactNode
  right?: React.ReactNode
  href?: string
  tone?: keyof typeof TONE_CLASSES
  className?: string
}) {
  const inner = (
    <div
      className={cn(
        'flex items-center gap-3.5 py-3 group',
        href && 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          TONE_CLASSES[tone]
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-body-sm font-semibold text-primary truncate',
            href && 'group-hover:text-accent transition-colors'
          )}
        >
          {title}
        </p>
        {meta && (
          <p className="text-caption text-ink-muted truncate mt-0.5">
            {meta}
          </p>
        )}
      </div>
      {right && (
        <div className="text-caption text-ink-faint shrink-0 text-right">
          {right}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block -mx-1 px-1 rounded-lg hover:bg-primary/[0.02]">
        {inner}
      </Link>
    )
  }

  return inner
}

export function ListRowDivider() {
  return <div className="border-t border-hairline/60" />
}
