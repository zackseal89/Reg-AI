import { BookOpen } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminClauseLibraryPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="Clause Library"
      description="A firm-wide library of reusable legal clauses is on the roadmap."
      backHref="/admin"
    />
  )
}
