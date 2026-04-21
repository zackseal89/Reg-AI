import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <span className="text-[12px] text-primary/50">{hint}</span>
      )}
      {error && (
        <span className="text-[12px] text-accent font-medium">{error}</span>
      )}
    </div>
  )
}
