import { LayoutTemplate } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function LawyerTemplatesPage() {
  return (
    <ComingSoon
      icon={LayoutTemplate}
      title="Templates"
      description="Reusable briefing and document templates are on the roadmap."
      backHref="/lawyer"
    />
  )
}
