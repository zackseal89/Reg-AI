import { SlidersHorizontal } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminSystemSettingsPage() {
  return (
    <ComingSoon
      icon={SlidersHorizontal}
      title="System Settings"
      description="Platform-wide configuration is on the roadmap."
      backHref="/admin"
    />
  )
}
