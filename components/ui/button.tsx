import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        /* Solid CTAs — sharp 4px corners, flat editorial fills, no borders */
        primary:
          'bg-accent text-white rounded-xs shadow-soft hover:bg-accent-active',
        accent:
          'bg-accent text-white rounded-xs shadow-soft hover:bg-accent-active',
        /* White fill on dark surfaces — shadow carries the edge, no hairline */
        secondary:
          'bg-white text-primary rounded-xs shadow-soft hover:bg-cream',
        /* Utility — tonal navy wash instead of outline; nav + table actions */
        outline:
          'bg-primary/[0.06] text-primary rounded-xs hover:bg-primary/[0.11]',
        subtle:
          'bg-primary/[0.06] text-primary rounded-xs hover:bg-primary/[0.11]',
        ghost:
          'text-ink-muted rounded-xs hover:text-primary hover:bg-primary/[0.05]',
        destructive:
          'bg-error/[0.08] text-error rounded-xs hover:bg-error/[0.14]',
      },
      size: {
        sm: 'text-caption px-3.5 py-1.5',
        md: 'text-body-sm px-5 py-2',
        lg: 'text-body px-7 py-3',
        icon: 'p-2 rounded-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { buttonVariants }
