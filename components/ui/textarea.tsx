import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full px-3.5 py-2.5 border border-hairline rounded-xs text-body-sm font-sans text-primary',
      'bg-white placeholder:text-ink-faint resize-y min-h-[120px]',
      'focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 focus:shadow-soft',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-all',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
