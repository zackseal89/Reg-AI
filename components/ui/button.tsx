import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-sm hover:bg-accent hover:shadow-md',
        accent:
          'bg-accent text-white shadow-sm hover:bg-accent/90 hover:shadow-md',
        outline:
          'border border-primary/15 text-primary bg-white hover:bg-primary/[0.03] hover:border-primary/25',
        ghost: 'text-primary/70 hover:text-primary hover:bg-primary/[0.04]',
        destructive:
          'bg-accent/5 text-accent border border-accent/15 hover:bg-accent/10 hover:border-accent/25',
        subtle:
          'bg-primary/[0.04] text-primary border border-primary/10 hover:bg-primary/[0.08] hover:border-primary/20',
      },
      size: {
        sm: 'text-[11px] uppercase tracking-wider px-3 py-1.5',
        md: 'text-[13px] uppercase tracking-widest px-5 py-2.5',
        lg: 'text-[13px] uppercase tracking-widest px-7 py-3.5',
        icon: 'p-2 rounded-lg',
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
