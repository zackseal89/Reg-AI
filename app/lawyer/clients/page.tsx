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
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-primary/5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Client Portfolio</h1>
          <p className="text-[15px] font-sans text-primary/60">Onboard and manage your client organizations.</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-accent/5 border-l-4 border-accent rounded-r-lg text-accent text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {/* Create Client Form */}
      <div className="mb-12 p-8 border border-primary/10 rounded-2xl bg-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <h2 className="text-xl font-serif font-semibold text-primary mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-accent">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Onboard New Client
        </h2>
        
        <form action={createClientAction} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
            <label htmlFor="companyName" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Company Name</label>
            <input id="companyName" name="companyName" required className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all placeholder:text-primary/30" placeholder="MNL Advocates LLP" />
          </div>
          <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
            <label htmlFor="sector" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Sector</label>
            <input id="sector" name="sector" required placeholder="e.g. Fintech, Crypto, Payments" className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all placeholder:text-primary/30" />
          </div>
          <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
            <label htmlFor="firstName" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">First Name</label>
            <input id="firstName" name="firstName" required className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all" />
          </div>
          <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
            <label htmlFor="lastName" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Last Name</label>
            <input id="lastName" name="lastName" required className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all" />
          </div>
          <div className="flex flex-col gap-1.5 focus-within:text-accent transition-colors">
            <label htmlFor="email" className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Contact Email</label>
            <input id="email" name="email" type="email" required className="px-4 py-3 border border-primary/15 rounded-xl text-[15px] font-sans focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 bg-white/50 transition-all" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-widest text-primary/70">Regulators</label>
            <div className="flex gap-4 items-center h-[50px]">
              {jurisdictions?.map((j) => (
                <label key={j.id} className="flex items-center gap-2.5 text-[15px] font-sans cursor-pointer group">
                  <input type="checkbox" name="jurisdictions" value={j.id} className="w-5 h-5 rounded border-primary/20 text-accent focus:ring-accent/30 cursor-pointer" />
                  <span className="group-hover:text-accent transition-colors">{j.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 pt-2 border-t border-primary/5 mt-2">
            <button type="submit" className="px-8 py-3.5 bg-primary text-white rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-accent transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
              Create Client Account
            </button>
          </div>
        </form>
      </div>

      {/* Clients Table */}
      <div className="border border-primary/10 rounded-2xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10">
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-primary/50">Contact Name</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-primary/50">Company</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-primary/50">Email</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-primary/50">Regulators</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-primary/50">Date Added</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-primary/50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-primary/40 font-sans text-sm">No clients onboarded yet. Use the form above to deploy a new portal.</p>
                </td>
              </tr>
            )}
            {clients?.map((client) => {
              const company = client.companies as unknown as { name: string; sector: string } | null
              const cjs = client.client_jurisdictions as unknown as { jurisdictions: { name: string } }[] | null
              const jurisdictionNames = cjs?.map(cj => cj.jurisdictions.name).join(', ')

              return (
                <tr key={client.id} className="hover:bg-primary/[0.02] transition-colors duration-200">
                  <td className="px-6 py-5 font-medium text-primary">
                    {client.first_name} {client.last_name}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-primary">{company?.name || '—'}</span>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-primary/60 font-sans">
                    {client.email}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {jurisdictionNames ? jurisdictionNames.split(', ').map(j => (
                        <span key={j} className="px-2.5 py-1 bg-primary/5 rounded border border-primary/10 text-[11px] font-bold uppercase tracking-wider text-primary/70">{j}</span>
                      )) : <span className="text-primary/30">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[13px] text-primary/50 font-sans">
                    {new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={activateClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <button type="submit" className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200/50 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all">
                          Activate
                        </button>
                      </form>
                      <form action={suspendClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <button type="submit" className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/5 border border-accent/10 rounded-lg hover:bg-accent/10 hover:border-accent/20 transition-all">
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
