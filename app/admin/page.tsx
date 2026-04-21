import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Scale, FolderOpen, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    { count: totalClients },
    { count: activeLawyers },
    { count: docsPublished },
    { count: briefingsSent },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'lawyer'),
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('briefings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent'),
  ])

  const metrics: {
    label: string
    value: number
    icon: LucideIcon
    hint: string
  }[] = [
    {
      label: 'Total Clients',
      value: totalClients ?? 0,
      icon: Users,
      hint: 'Onboarded client accounts',
    },
    {
      label: 'Active Lawyers',
      value: activeLawyers ?? 0,
      icon: Scale,
      hint: 'MNL Associates with access',
    },
    {
      label: 'Docs Published',
      value: docsPublished ?? 0,
      icon: FolderOpen,
      hint: 'Indexed into client stores',
    },
    {
      label: 'Briefings Sent',
      value: briefingsSent ?? 0,
      icon: FileText,
      hint: 'Delivered via email',
    },
  ]

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Platform Metrics"
        description="Overview of system usage, active clients, and audit trails."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} className="p-6">
            <div className="flex items-start justify-between mb-6">
              <span className="text-[11px] font-bold text-primary/50 uppercase tracking-widest">
                {label}
              </span>
              <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary/60 flex items-center justify-center">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-4xl font-serif font-bold text-primary tracking-tight">
              {value}
            </p>
            <p className="text-xs text-primary/50 mt-2">{hint}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
