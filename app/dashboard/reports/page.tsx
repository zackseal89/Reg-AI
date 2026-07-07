import { BarChart3 } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function ClientReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Downloadable compliance reports are on the roadmap."
      backHref="/dashboard"
    />
  )
}
