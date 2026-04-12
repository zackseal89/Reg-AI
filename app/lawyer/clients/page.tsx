import { createClient } from '@/lib/supabase/server'
import { createClientAction, activateClientAction, suspendClientAction } from './actions'

export default async function LawyerClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()

  // Fetch clients with company and jurisdiction info
  const { data: clients } = await supabase
    .from('profiles')
    .select(`
      id, email, first_name, last_name, created_at,
      companies ( name, sector ),
      client_jurisdictions ( jurisdictions ( name ) )
    `)
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  // Fetch jurisdictions for the create form
  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, name')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Clients</h1>
          <p className="text-primary/70">Onboard and manage client accounts.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Create Client Form */}
      <div className="mb-10 p-6 border border-black/10 rounded-lg bg-cream/50">
        <h2 className="text-lg font-serif font-medium mb-4">Onboard New Client</h2>
        <form action={createClientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
            <input id="companyName" name="companyName" required className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="sector" className="text-sm font-medium">Sector</label>
            <input id="sector" name="sector" placeholder="e.g. Fintech, Crypto, Payments" className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="text-sm font-medium">Contact First Name</label>
            <input id="firstName" name="firstName" required className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="text-sm font-medium">Contact Last Name</label>
            <input id="lastName" name="lastName" required className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">Contact Email</label>
            <input id="email" name="email" type="email" required className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Jurisdictions</label>
            <div className="flex gap-4 items-center h-[42px]">
              {jurisdictions?.map((j) => (
                <label key={j.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="jurisdictions" value={j.id} className="rounded" />
                  {j.name}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Create Client Account
            </button>
          </div>
        </form>
      </div>

      {/* Clients Table */}
      <div className="border border-black/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 border-b border-black/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Company</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Jurisdictions</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-primary/50">
                  No clients onboarded yet. Use the form above to create one.
                </td>
              </tr>
            )}
            {clients?.map((client) => {
              const company = client.companies as unknown as { name: string; sector: string } | null
              const cjs = client.client_jurisdictions as unknown as { jurisdictions: { name: string } }[] | null
              const jurisdictionNames = cjs?.map(cj => cj.jurisdictions.name).join(', ') || '—'

              return (
                <tr key={client.id} className="border-b border-black/5 hover:bg-cream/30">
                  <td className="px-4 py-3">{client.first_name} {client.last_name}</td>
                  <td className="px-4 py-3">{company?.name || '—'}</td>
                  <td className="px-4 py-3 text-primary/70">{client.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {jurisdictionNames.split(', ').map(j => (
                        <span key={j} className="px-2 py-0.5 bg-primary/10 rounded text-xs font-medium">{j}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary/70">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form action={activateClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <button type="submit" className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                          Activate
                        </button>
                      </form>
                      <form action={suspendClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <button type="submit" className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">
                          Suspend
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
