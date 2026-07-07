import { BookOpen } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function LawyerClauseLibraryPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="Clause Library"
      description="A searchable library of reusable legal clauses is on the roadmap."
      backHref="/lawyer"
    />
  )
}
