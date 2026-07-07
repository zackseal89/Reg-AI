import { ClipboardList } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function ClientObligationsPage() {
  return (
    <ComingSoon
      icon={ClipboardList}
      title="Obligations"
      description="A tracked list of your open compliance obligations is on the roadmap."
      backHref="/dashboard"
    />
  )
}
