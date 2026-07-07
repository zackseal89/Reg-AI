import { Bot } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminAiConfigPage() {
  return (
    <ComingSoon
      icon={Bot}
      title="AI Assistant Config"
      description="Configuration for the Ask RegWatch assistant is on the roadmap."
      backHref="/admin"
    />
  )
}
