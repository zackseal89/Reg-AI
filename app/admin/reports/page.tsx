import { BarChart3 } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Platform-wide analytics and reporting are on the roadmap."
      backHref="/admin"
    />
  )
}
