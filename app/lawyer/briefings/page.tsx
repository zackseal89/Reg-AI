import { createClient } from '@/lib/supabase/server'
import { FileText } from 'lucide-react'
import {
  createBriefingAction,
  approveBriefingAction,
  sendBriefingAction,
  rejectBriefingAction,
} from './actions'
import FlashToast from '@/app/components/FlashToast'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { CreateBriefingModal } from '@/components/modals/create-briefing-modal'

export default async function LawyerBriefingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await searchParams
  const supabase = await createClient()

  const { data: briefings } = await supabase
    .from('briefings')
    .select(
      `id, title, content, status, created_at, sent_at,
      jurisdictions ( name ),
      author:profiles!briefings_author_id_fkey ( first_name, last_name ),
      approver:profiles!briefings_approved_by_fkey ( first_name, last_name ),
      briefing_assignments ( client_id, profiles!briefing_assignments_client_id_fkey ( first_name, last_name ) )`
    )
    .order('created_at', { ascending: false })

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  const { data: rawClients } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, companies ( name )')
    .eq('role', 'client')
    .order('first_name')

  const clients = (rawClients ?? []).map(c => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    company_name:
      (c.companies as unknown as { name: string } | null)?.name ?? null,
  }))

  return (
    <div className="max-w-6xl">
      <FlashToast />
      <PageHeader
        title="Briefings"
        description="Create, review, approve, and send regulatory briefings."
      >
        <CreateBriefingModal
          jurisdictions={jurisdictions ?? []}
          clients={clients}
          action={createBriefingAction}
        />
      </PageHeader>

      {!briefings || briefings.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No briefings yet"
          description="Start drafting your first regulatory briefing. Drafts require approval before they're sent."
        />
      ) : (
        <div className="space-y-5">
          {briefings.map(b => {
            const jurisdiction = b.jurisdictions as unknown as {
              name: string
            } | null
            const author = b.author as unknown as {
              first_name: string
              last_name: string
            } | null
            const approver = b.approver as unknown as {
              first_name: string
              last_name: string
            } | null
            const assignments = b.briefing_assignments as unknown as {
              client_id: string
              profiles: { first_name: string; last_name: string }
            }[] | null

            return (
              <div
                key={b.id}
                className="p-6 border border-primary/10 bg-white rounded-2xl hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.08)] hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl font-semibold text-primary group-hover:text-accent transition-colors">
                        {b.title}
                      </h3>
                      <Badge
                        variant={
                          b.status as
                            | 'draft'
                            | 'approved'
                            | 'sent'
                            | 'default'
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-primary/50">
                      {jurisdiction && (
                        <span className="flex items-center gap-1.5 text-primary/70 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                          {jurisdiction.name}
                        </span>
                      )}
                      {author && (
                        <span>
                          By:{' '}
                          <span className="font-medium text-primary/70">
                            {author.first_name} {author.last_name}
                          </span>
                        </span>
                      )}
                      {approver && (
                        <span>
                          Approved by:{' '}
                          <span className="font-medium text-primary/70">
                            {approver.first_name} {approver.last_name}
                          </span>
                        </span>
                      )}
                      <span>
                        Created:{' '}
                        <span className="font-medium text-primary/70">
                          {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </span>
                      {b.sent_at && (
                        <span>
                          Sent:{' '}
                          <span className="font-medium text-primary/70">
                            {new Date(b.sent_at).toLocaleDateString()}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:shrink-0 pt-1">
                    {b.status === 'draft' && (
                      <form action={approveBriefingAction}>
                        <input
                          type="hidden"
                          name="briefingId"
                          value={b.id}
                        />
                        <Button type="submit" variant="subtle" size="sm">
                          Approve
                        </Button>
                      </form>
                    )}
                    {b.status === 'approved' && (
                      <>
                        <form action={sendBriefingAction}>
                          <input
                            type="hidden"
                            name="briefingId"
                            value={b.id}
                          />
                          <Button type="submit" size="sm">
                            Send
                          </Button>
                        </form>
                        <form action={rejectBriefingAction}>
                          <input
                            type="hidden"
                            name="briefingId"
                            value={b.id}
                          />
                          <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm font-sans text-primary/80 line-clamp-3 mb-4 leading-relaxed bg-primary/[0.02] p-4 rounded-xl border border-primary/5">
                  {b.content}
                </p>
                {assignments && assignments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-primary/5 text-xs text-primary/50">
                    <span className="font-medium uppercase tracking-wider text-[10px]">
                      Assigned to:
                    </span>
                    {assignments.map(a => (
                      <span
                        key={a.client_id}
                        className="px-2.5 py-1 bg-primary/5 rounded border border-primary/5 font-medium text-primary/80"
                      >
                        {a.profiles.first_name} {a.profiles.last_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
