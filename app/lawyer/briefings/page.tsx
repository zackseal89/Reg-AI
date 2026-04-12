import { createClient } from '@/lib/supabase/server'
import { createBriefingAction, approveBriefingAction, sendBriefingAction, rejectBriefingAction } from './actions'

export default async function LawyerBriefingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: briefings } = await supabase
    .from('briefings')
    .select(`
      id, title, content, status, created_at, sent_at,
      jurisdictions ( name ),
      author:profiles!briefings_author_id_fkey ( first_name, last_name ),
      approver:profiles!briefings_approved_by_fkey ( first_name, last_name ),
      briefing_assignments ( client_id, profiles!briefing_assignments_client_id_fkey ( first_name, last_name ) )
    `)
    .order('created_at', { ascending: false })

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, companies ( name )')
    .eq('role', 'client')
    .order('first_name')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Briefings</h1>
          <p className="text-primary/70">Create, review, approve, and send regulatory briefings.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Create Briefing Form */}
      <div className="mb-10 p-6 border border-black/10 rounded-lg bg-cream/50">
        <h2 className="text-lg font-serif font-medium mb-4">New Briefing</h2>
        <form action={createBriefingAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <input id="title" name="title" required className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="jurisdictionId" className="text-sm font-medium">Jurisdiction</label>
              <select id="jurisdictionId" name="jurisdictionId" required className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="">Select...</option>
                {jurisdictions?.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              placeholder="Write the regulatory briefing content here..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Assign to Clients</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {clients?.map(c => {
                const company = c.companies as unknown as { name: string } | null
                return (
                  <label key={c.id} className="flex items-center gap-2 text-sm p-2 border border-black/5 rounded hover:bg-white">
                    <input type="checkbox" name="clientIds" value={c.id} className="rounded" />
                    {c.first_name} {c.last_name} {company ? `(${company.name})` : ''}
                  </label>
                )
              })}
              {(!clients || clients.length === 0) && (
                <p className="text-sm text-primary/50">No clients yet.</p>
              )}
            </div>
          </div>
          <div>
            <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Save as Draft
            </button>
          </div>
        </form>
      </div>

      {/* Briefings List */}
      <div className="space-y-4">
        {(!briefings || briefings.length === 0) && (
          <div className="text-center py-8 text-primary/50 border border-black/10 rounded-lg">
            No briefings yet. Create one above.
          </div>
        )}
        {briefings?.map(b => {
          const jurisdiction = b.jurisdictions as unknown as { name: string } | null
          const author = b.author as unknown as { first_name: string; last_name: string } | null
          const approver = b.approver as unknown as { first_name: string; last_name: string } | null
          const assignments = b.briefing_assignments as unknown as { client_id: string; profiles: { first_name: string; last_name: string } }[] | null
          const statusColors: Record<string, string> = {
            draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            approved: 'bg-blue-50 text-blue-700 border-blue-200',
            sent: 'bg-green-50 text-green-700 border-green-200',
          }

          return (
            <div key={b.id} className="p-5 border border-black/10 rounded-lg hover:border-black/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif text-lg font-medium">{b.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-primary/60">
                    <span className={`px-2 py-0.5 border rounded font-medium ${statusColors[b.status] || ''}`}>
                      {b.status}
                    </span>
                    {jurisdiction && (
                      <span className="px-2 py-0.5 bg-primary/10 rounded font-medium">{jurisdiction.name}</span>
                    )}
                    {author && <span>By {author.first_name} {author.last_name}</span>}
                    {approver && <span>Approved by {approver.first_name} {approver.last_name}</span>}
                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                    {b.sent_at && <span>Sent {new Date(b.sent_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {b.status === 'draft' && (
                    <form action={approveBriefingAction}>
                      <input type="hidden" name="briefingId" value={b.id} />
                      <button type="submit" className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                        Approve
                      </button>
                    </form>
                  )}
                  {b.status === 'approved' && (
                    <>
                      <form action={sendBriefingAction}>
                        <input type="hidden" name="briefingId" value={b.id} />
                        <button type="submit" className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                          Send
                        </button>
                      </form>
                      <form action={rejectBriefingAction}>
                        <input type="hidden" name="briefingId" value={b.id} />
                        <button type="submit" className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">
                          Reject
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-primary/80 line-clamp-3 mb-3">{b.content}</p>
              {assignments && assignments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-primary/60">
                  <span>Assigned to:</span>
                  {assignments.map(a => (
                    <span key={a.client_id} className="px-2 py-0.5 bg-cream rounded">
                      {a.profiles.first_name} {a.profiles.last_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
