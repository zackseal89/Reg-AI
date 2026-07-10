import * as React from 'react'
import { ChevronDown } from 'lucide-react'

export function FaqItem({
  question,
  children,
}: {
  question: string
  children: React.ReactNode
}) {
  return (
    <details className="group py-4 first:pt-0 last:pb-0">
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
        <span className="text-body-sm font-semibold text-primary">
          {question}
        </span>
        <ChevronDown
          className="w-4 h-4 text-ink-faint shrink-0 transition-transform duration-200 group-open:rotate-180"
          strokeWidth={1.75}
        />
      </summary>
      <p className="text-body-sm text-ink-muted leading-relaxed mt-2.5">
        {children}
      </p>
    </details>
  )
}
