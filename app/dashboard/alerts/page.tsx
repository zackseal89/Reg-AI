import { Bell } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function ClientAlertsPage() {
  return (
    <ComingSoon
      icon={Bell}
      title="Alerts"
      description="Real-time regulatory alerts for your business are on the roadmap."
      backHref="/dashboard"
    />
  )
}
