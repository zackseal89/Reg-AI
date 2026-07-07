import { UserCog } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function AdminUsersRolesPage() {
  return (
    <ComingSoon
      icon={UserCog}
      title="Users & Roles"
      description="Fine-grained role management across lawyers and admins is on the roadmap."
      backHref="/admin"
    />
  )
}
