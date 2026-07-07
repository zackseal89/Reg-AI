import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-eyebrow capitalize',
  {
    variants: {
      variant: {
        default: 'bg-white text-ink-muted border-hairline',
        draft: 'bg-yellow-50 text-yellow-800 border-yellow-200/60',
        approved: 'bg-blue-50 text-blue-800 border-blue-200/60',
        sent: 'bg-green-50 text-green-800 border-green-200/60',
        uploaded: 'bg-yellow-50 text-yellow-800 border-yellow-200/60',
        assigned: 'bg-blue-50 text-blue-800 border-blue-200/60',
        published: 'bg-green-50 text-green-800 border-green-200/60',
        active: 'bg-green-50 text-green-800 border-green-200/60',
        inactive: 'bg-surface-low text-ink-muted border-hairline',
        accent: 'bg-white text-accent border-accent/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
