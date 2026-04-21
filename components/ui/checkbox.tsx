import * as React from 'react'
import { cn } from '@/lib/utils'

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      'w-5 h-5 rounded border-primary/20 text-accent focus:ring-accent/30 cursor-pointer',
      className
    )}
    {...props}
  />
))
Checkbox.displayName = 'Checkbox'
