import { Building2 } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function LawyerAuthoritiesPage() {
  return (
    <ComingSoon
      icon={Building2}
      title="Authorities"
      description="A directory of regulators and their contact details is on the roadmap."
      backHref="/lawyer"
    />
  )
}
