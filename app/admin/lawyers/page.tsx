import { createAdminClient } from '@/lib/supabase/admin'
import { inviteLawyerAction, deactivateLawyerAction, reactivateLawyerAction } from './actions'

export default async function AdminLawyersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const admin = createAdminClient()

  const [
    { data: lawyers },
    { data: { users: authUsers } },
    { data: clientCounts },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id, email, first_name, last_name, created_at')
      .eq('role', 'lawyer')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from('profiles')
      .select('id')
      .eq('role', 'client'),
  ])

  const authMap = new Map(
    (authUsers ?? []).map(u => [
      u.id,
      u.banned_until && new Date(u.banned_until) > new Date() ? 'inactive' : 'active',
    ])
  )

  // Count clients per lawyer via audit_logs (client_created action)
  const { data: lawyerClientLogs } = await admin
    .from('audit_logs')
    .select('user_id')
    .eq('action', 'client_created')

  const clientsPerLawyer = new Map<string, number>()
  for (const log of lawyerClientLogs ?? []) {
    clientsPerLawyer.set(log.user_id, (clientsPerLawyer.get(log.user_id) ?? 0) + 1)
  }

  const enriched = (lawyers ?? []).map(l => ({
    ...l,
    status: authMap.get(l.id) ?? 'active',
    clientCount: clientsPerLawyer.get(l.id) ?? 0,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Lawyers</h1>
          <p className="text-zinc-500">Manage MNL Associates accounts.</p>
        </div>
        <span className="text-sm text-zinc-500">{enriched.length} lawyer{enriched.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Invite Form */}
      <div className="mb-10 p-6 border border-black/10 rounded-lg bg-cream/50">
        <h2 className="text-lg font-serif font-medium mb-4">Invite New Lawyer</h2>
        <form action={inviteLawyerAction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
            <input
              id="firstName" name="firstName" required
              className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
            <input
              id="lastName" name="lastName" required
              className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">MNL Email</label>
            <input
              id="email" name="email" type="email" required
              placeholder="name@mnladvocates.com"
              className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>

      {/* Lawyers Table */}
      <div className="border border-black/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 border-b border-black/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Lawyer</th>
              <th className="text-left px-4 py-3 font-medium">Clients Managed</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enriched.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                  No lawyer accounts yet. Use the form above to invite one.
                </td>
              </tr>
            )}
            {enriched.map(lawyer => (
              <tr key={lawyer.id} className="border-b border-black/5 hover:bg-cream/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{lawyer.first_name} {lawyer.last_name}</div>
                  <div className="text-zinc-400 text-xs">{lawyer.email}</div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{lawyer.clientCount}</td>
                <td className="px-4 py-3">
                  {lawyer.status === 'active' ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(lawyer.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  {lawyer.status === 'active' ? (
                    <form action={deactivateLawyerAction}>
                      <input type="hidden" name="lawyerId" value={lawyer.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-zinc-50 text-zinc-600 border border-zinc-200 rounded hover:bg-zinc-100 transition-colors"
                      >
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <form action={reactivateLawyerAction}>
                      <input type="hidden" name="lawyerId" value={lawyer.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                      >
                        Reactivate
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
