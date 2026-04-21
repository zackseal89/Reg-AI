import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans text-primary',
      'bg-white placeholder:text-primary/30 resize-y min-h-[120px]',
      'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-all',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
