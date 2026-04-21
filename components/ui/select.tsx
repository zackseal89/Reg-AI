import * as React from 'react'
import { cn } from '@/lib/utils'

const chevronBg =
  'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%231a2744%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, style, ...props }, ref) => (
  <select
    ref={ref}
    style={{
      backgroundImage: chevronBg,
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1em',
      backgroundRepeat: 'no-repeat',
      ...style,
    }}
    className={cn(
      'w-full px-4 py-3 pr-10 border border-primary/15 rounded-xl text-[15px] font-sans text-primary',
      'bg-white appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-all',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'
