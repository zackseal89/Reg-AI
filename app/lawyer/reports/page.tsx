import { BarChart3 } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function LawyerReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Practice-wide reporting and analytics are on the roadmap."
      backHref="/lawyer"
    />
  )
}
