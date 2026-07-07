import { createAdminClient } from '@/lib/supabase/admin'
import { Globe2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { ListRow } from '@/components/ui/list-row'
import { EmptyState } from '@/components/ui/empty-state'

export default async function AdminJurisdictionsPage() {
  const supabase = createAdminClient()

  const { data: jurisdictionsRaw } = await supabase
    .from('jurisdictions')
    .select(
      'id, name, description, client_jurisdictions ( client_id ), documents ( id )'
    )
    .order('name')

  const jurisdictions = (jurisdictionsRaw ?? []).map(j => ({
    id: j.id,
    name: j.name,
    description: j.description,
    clientCount: (j.client_jurisdictions as unknown as unknown[] | null)?.length ?? 0,
    documentCount: (j.documents as unknown as unknown[] | null)?.length ?? 0,
  }))

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Jurisdictions"
        description="Regulators tracked platform-wide, with client and document coverage."
      />

      {jurisdictions.length === 0 ? (
        <EmptyState
          icon={<Globe2 className="w-6 h-6" />}
          title="No jurisdictions yet"
          description="Add jurisdictions via the Supabase dashboard to enable client onboarding."
        />
      ) : (
        <Card className="p-5">
          <div className="divide-y divide-hairline/60">
            {jurisdictions.map(j => (
              <ListRow
                key={j.id}
                icon={Globe2}
                title={j.name}
                meta={j.description || `${j.documentCount} document${j.documentCount === 1 ? '' : 's'}`}
                right={`${j.clientCount} client${j.clientCount === 1 ? '' : 's'}`}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
