import { createClient } from '@/lib/supabase/server'
import { FileText, MoreHorizontal } from 'lucide-react'
import {
  createBriefingAction,
  approveBriefingAction,
  sendBriefingAction,
  rejectBriefingAction,
  deleteBriefingAction,
} from './actions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { ConfirmMenuItem } from '@/components/modals/confirm-menu-item'
import FlashToast from '@/app/components/FlashToast'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { CreateBriefingModal } from '@/components/modals/create-briefing-modal'

export default async function LawyerBriefingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; template?: string }>
}) {
  const { template: templateId } = await searchParams
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

  // If arriving from the template library (?template=<id>), load that briefing
  // template and pre-fill the draft modal.
  let templatePrefill:
    | { title: string; content: string; jurisdictionId?: string }
    | undefined
  if (templateId) {
    const { data: template } = await supabase
      .from('templates')
      .select('title, body, jurisdiction, kind')
      .eq('id', templateId)
      .eq('kind', 'briefing')
      .maybeSingle()

    if (template) {
      const matchedJurisdiction = (jurisdictions ?? []).find(
        j => j.name === template.jurisdiction
      )
      templatePrefill = {
        title: template.title,
        content: template.body,
        jurisdictionId: matchedJurisdiction?.id,
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <FlashToast />
      <PageHeader
        title="Briefings"
        description="Create, review, approve, and send regulatory briefings."
      >
        <CreateBriefingModal
          jurisdictions={jurisdictions ?? []}
          clients={clients}
          action={createBriefingAction}
          initialTitle={templatePrefill?.title}
          initialContent={templatePrefill?.content}
          initialJurisdictionId={templatePrefill?.jurisdictionId}
          defaultOpen={!!templatePrefill}
        />
      </PageHeader>

      {!briefings || briefings.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No briefings yet"
          description="Start drafting your first regulatory briefing. Drafts require approval before they're sent."
        />
      ) : (
        <div className="divide-y divide-hairline">
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

            const preview =
              b.content?.length > 220
                ? b.content.slice(0, 220) + '…'
                : b.content

            return (
              <article key={b.id} className="group py-7 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 mb-2.5">
                  {jurisdiction && (
                    <span className="text-eyebrow font-semibold uppercase tracking-wider text-accent">
                      {jurisdiction.name}
                    </span>
                  )}
                  <Badge
                    variant={
                      b.status as 'draft' | 'approved' | 'sent' | 'default'
                    }
                  >
                    {b.status}
                  </Badge>
                </div>

                <h3 className="font-serif text-h3 font-semibold text-primary leading-snug tracking-tight max-w-[34ch] mb-2.5 transition-colors duration-200 group-hover:text-accent">
                  {b.title}
                </h3>

                <p className="text-body-sm text-ink-secondary leading-relaxed max-w-[56ch] line-clamp-2 mb-3">
                  {preview}
                </p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-caption text-ink-faint mb-4">
                  {author && (
                    <span>
                      By {author.first_name} {author.last_name}
                    </span>
                  )}
                  {approver && (
                    <span>
                      Approved by {approver.first_name} {approver.last_name}
                    </span>
                  )}
                  <span>
                    Created{' '}
                    {new Date(b.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {b.sent_at && (
                    <span>
                      Sent{' '}
                      {new Date(b.sent_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {assignments && assignments.length > 0 && (
                      <>
                        <span className="text-eyebrow font-semibold uppercase tracking-wider text-ink-faint">
                          Assigned to
                        </span>
                        {assignments.map(a => (
                          <Badge key={a.client_id}>
                            {a.profiles.first_name} {a.profiles.last_name}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {b.status === 'draft' && (
                      <form action={approveBriefingAction}>
                        <input type="hidden" name="briefingId" value={b.id} />
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
                          <Button type="submit" variant="destructive" size="sm">
                            Reject
                          </Button>
                        </form>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 rounded-md text-ink-muted hover:bg-primary/5 hover:text-primary transition-colors"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ConfirmMenuItem
                          itemLabel="Delete"
                          title="Delete briefing?"
                          description={
                            b.status === 'sent'
                              ? `"${b.title}" has already been sent — clients received it by email. Deleting removes it from their portal permanently. This cannot be undone.`
                              : `"${b.title}" and its client assignments will be permanently deleted. This cannot be undone.`
                          }
                          confirmLabel="Delete permanently"
                          destructive
                          hiddenFields={{ briefingId: b.id }}
                          action={deleteBriefingAction}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
