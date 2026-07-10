import { LayoutTemplate } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { TemplateLibrary, type Template } from '@/components/templates/template-library'

export default async function AdminTemplatesPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('templates')
    .select(
      'id, title, kind, category, jurisdiction, description, body, adaptation_notes, source, source_url'
    )
    .order('category')
    .order('sort_order')

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Templates"
        description="Firm-wide library of reusable briefing and compliance-document templates, adapted for the CBK and ODPC context."
      />

      {!templates || templates.length === 0 ? (
        <EmptyState
          icon={<LayoutTemplate className="w-6 h-6" />}
          title="No templates yet"
          description="Run the template seed to populate the starter library."
        />
      ) : (
        <TemplateLibrary templates={templates as Template[]} />
      )}
    </div>
  )
}
