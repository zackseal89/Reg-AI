import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-widest',
  {
    variants: {
      variant: {
        default:
          'bg-primary/5 text-primary/70 border-primary/10',
        draft: 'bg-yellow-50 text-yellow-700 border-yellow-200/60',
        approved: 'bg-blue-50 text-blue-700 border-blue-200/60',
        sent: 'bg-green-50 text-green-700 border-green-200/60',
        uploaded: 'bg-yellow-50 text-yellow-700 border-yellow-200/60',
        assigned: 'bg-blue-50 text-blue-700 border-blue-200/60',
        published: 'bg-green-50 text-green-700 border-green-200/60',
        active: 'bg-green-50 text-green-700 border-green-200/60',
        inactive: 'bg-zinc-100 text-zinc-500 border-zinc-200',
        accent: 'bg-accent/5 text-accent border-accent/15',
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
