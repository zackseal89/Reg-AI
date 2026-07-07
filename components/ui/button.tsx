import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        /* Pill CTAs — burgundy is the one structural accent */
        primary:
          'bg-accent text-white rounded-full shadow-soft hover:bg-accent-active',
        accent:
          'bg-accent text-white rounded-full shadow-soft hover:bg-accent-active',
        /* White pill, soft shadow — hero/secondary CTA */
        secondary:
          'bg-white text-primary rounded-full border border-hairline shadow-soft hover:bg-cream',
        /* Utility — tight 8px radius, hairline; nav + table actions */
        outline:
          'bg-white text-primary rounded-md border border-hairline hover:border-ink-faint hover:bg-cream',
        subtle:
          'bg-white text-primary rounded-md border border-hairline hover:border-ink-faint hover:bg-cream',
        ghost:
          'text-ink-muted rounded-md hover:text-primary hover:bg-primary/[0.05]',
        destructive:
          'bg-white text-error rounded-md border border-error/25 hover:bg-error/5 hover:border-error/40',
      },
      size: {
        sm: 'text-caption px-3.5 py-1.5',
        md: 'text-body-sm px-5 py-2',
        lg: 'text-body px-7 py-3',
        icon: 'p-2 rounded-md',
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
