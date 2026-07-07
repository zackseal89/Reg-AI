import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ComingSoon({
  icon: Icon,
  title,
  description,
  backHref,
}: {
  icon: LucideIcon
  title: string
  description?: string
  backHref: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-xl bg-white border border-hairline">
      <div className="w-14 h-14 rounded-full bg-primary/5 text-primary/50 flex items-center justify-center mb-5">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <h1 className="text-h3 font-serif font-bold text-primary mb-1.5">
        {title}
      </h1>
      <p className="text-body-sm text-ink-muted max-w-sm mb-6">
        {description ?? 'This area is on the roadmap and not yet available.'}
      </p>
      <Link href={backHref}>
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to dashboard
        </Button>
      </Link>
    </div>
  )
}
