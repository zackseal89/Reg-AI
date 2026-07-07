import { Activity } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function LawyerActivityPage() {
  return (
    <ComingSoon
      icon={Activity}
      title="Activity"
      description="A lawyer-scoped activity feed is on the roadmap."
      backHref="/lawyer"
    />
  )
}
