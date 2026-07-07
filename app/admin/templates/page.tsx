import { LayoutTemplate } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminTemplatesPage() {
  return (
    <ComingSoon
      icon={LayoutTemplate}
      title="Templates"
      description="Firm-wide briefing and document templates are on the roadmap."
      backHref="/admin"
    />
  )
}
