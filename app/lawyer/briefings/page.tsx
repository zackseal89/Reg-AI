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
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-primary/5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Briefings</h1>
          <p className="text-[15px] font-sans text-primary/60">Create, review, approve, and send regulatory briefings.</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {/* Create Briefing Form */}
      <div className="mb-12 p-8 border border-primary/10 rounded-2xl bg-white shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-serif font-semibold text-primary mb-8 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-accent">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          New Briefing
        </h2>
        <form action={createBriefingAction} className="flex flex-col gap-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
              <label htmlFor="title" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Title</label>
              <input id="title" name="title" required className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
              <label htmlFor="jurisdictionId" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Jurisdiction</label>
              <select id="jurisdictionId" name="jurisdictionId" required className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all appearance-none bg-no-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}>
                <option value="">Select...</option>
                {jurisdictions?.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
            <label htmlFor="content" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Content</label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all resize-y"
              placeholder="Write the regulatory briefing content here..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Assign to Clients</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clients?.map(c => {
                const company = c.companies as unknown as { name: string } | null
                return (
                  <label key={c.id} className="flex items-center gap-3 p-3 border border-primary/10 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group">
                    <input type="checkbox" name="clientIds" value={c.id} className="w-5 h-5 rounded border-primary/20 text-accent focus:ring-accent/30 cursor-pointer" />
                    <span className="text-[14px] font-medium text-primary group-hover:text-accent transition-colors">
                      {c.first_name} {c.last_name} {company ? <span className="text-primary/50 text-[12px] block font-normal">{company.name}</span> : ''}
                    </span>
                  </label>
                )
              })}
              {(!clients || clients.length === 0) && (
                <p className="text-sm text-primary/50 col-span-full py-4 text-center bg-primary/5 rounded-xl">No clients yet.</p>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-primary/5 mt-2">
            <button type="submit" className="px-8 py-3.5 bg-primary text-white rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
              Save as Draft
            </button>
          </div>
        </form>
      </div>

      {/* Briefings List */}
      <h2 className="text-xl font-serif font-semibold text-primary mb-6">Recent Briefings</h2>
      <div className="space-y-5">
        {(!briefings || briefings.length === 0) && (
          <div className="text-center py-16 text-primary/40 text-[14px] border border-primary/10 rounded-2xl bg-white shadow-sm">
            No briefings yet. Create one above.
          </div>
        )}
        {briefings?.map(b => {
          const jurisdiction = b.jurisdictions as unknown as { name: string } | null
          const author = b.author as unknown as { first_name: string; last_name: string } | null
          const approver = b.approver as unknown as { first_name: string; last_name: string } | null
          const assignments = b.briefing_assignments as unknown as { client_id: string; profiles: { first_name: string; last_name: string } }[] | null
          const statusColors: Record<string, string> = {
            draft: 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
            approved: 'bg-blue-50 text-blue-700 border-blue-200/50',
            sent: 'bg-green-50 text-green-700 border-green-200/50',
          }

          return (
            <div key={b.id} className="p-6 border border-primary/10 bg-white rounded-2xl hover:shadow-[0_8px_30px_-10px_rgba(26,39,68,0.08)] hover:border-primary/20 transition-all duration-300 group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-serif text-xl font-semibold text-primary group-hover:text-accent transition-colors">{b.title}</h3>
                    <span className={`px-2.5 py-1 border rounded text-[10px] font-bold uppercase tracking-widest ${statusColors[b.status] || ''}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-sans text-primary/50">
                    {jurisdiction && (
                      <span className="flex items-center gap-1.5 text-primary/70 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                        {jurisdiction.name}
                      </span>
                    )}
                    {author && <span>By: <span className="font-medium text-primary/70">{author.first_name} {author.last_name}</span></span>}
                    {approver && <span>Approved by: <span className="font-medium text-primary/70">{approver.first_name} {approver.last_name}</span></span>}
                    <span>Created: <span className="font-medium text-primary/70">{new Date(b.created_at).toLocaleDateString()}</span></span>
                    {b.sent_at && <span>Sent: <span className="font-medium text-primary/70">{new Date(b.sent_at).toLocaleDateString()}</span></span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:shrink-0 pt-1">
                  {b.status === 'draft' && (
                    <form action={approveBriefingAction}>
                      <input type="hidden" name="briefingId" value={b.id} />
                      <button type="submit" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/50 rounded-lg hover:bg-blue-100 transition-all shadow-sm">
                        Approve
                      </button>
                    </form>
                  )}
                  {b.status === 'approved' && (
                    <>
                      <form action={sendBriefingAction}>
                        <input type="hidden" name="briefingId" value={b.id} />
                        <button type="submit" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200/50 rounded-lg hover:bg-green-100 transition-all shadow-sm">
                          Send
                        </button>
                      </form>
                      <form action={rejectBriefingAction}>
                        <input type="hidden" name="briefingId" value={b.id} />
                        <button type="submit" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/50 rounded-lg hover:bg-red-100 transition-all shadow-sm">
                          Reject
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[14px] font-sans text-primary/80 line-clamp-3 mb-4 leading-relaxed bg-primary/[0.02] p-4 rounded-xl border border-primary/5">{b.content}</p>
              {assignments && assignments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-primary/5 text-[12px] font-sans text-primary/50">
                  <span className="font-medium uppercase tracking-wider text-[10px]">Assigned to:</span>
                  {assignments.map(a => (
                    <span key={a.client_id} className="px-2.5 py-1 bg-primary/5 rounded border border-primary/5 font-medium text-primary/80">
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
