import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'w-full px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans text-primary',
      'bg-white placeholder:text-primary/30',
      'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-all',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'
