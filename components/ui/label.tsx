import * as React from 'react'
import { cn } from '@/lib/utils'

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-[12px] font-bold uppercase tracking-widest text-primary/70',
      className
    )}
    {...props}
  />
))
Label.displayName = 'Label'
