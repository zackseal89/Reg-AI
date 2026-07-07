import { CalendarClock } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function ClientRegulatoryTimelinePage() {
  return (
    <ComingSoon
      icon={CalendarClock}
      title="Regulatory Timeline"
      description="A forward-looking view of upcoming regulatory milestones is on the roadmap."
      backHref="/dashboard"
    />
  )
}
