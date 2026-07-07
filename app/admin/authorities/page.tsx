import { Building2 } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminAuthoritiesPage() {
  return (
    <ComingSoon
      icon={Building2}
      title="Authorities"
      description="A platform-wide directory of regulators is on the roadmap."
      backHref="/admin"
    />
  )
}
