import { CalendarClock } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function LawyerRegulatoryTimelinePage() {
  return (
    <ComingSoon
      icon={CalendarClock}
      title="Regulatory Timeline"
      description="A firm-wide view of upcoming regulatory milestones is on the roadmap."
      backHref="/lawyer"
    />
  )
}
