import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from './sign-out-button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, companies ( name, sector )')
    .eq('id', user.id)
    .single()

  const company = profile?.companies as unknown as { name: string; sector: string } | null

  // Fetch client jurisdictions
  const { data: clientJurisdictions } = await supabase
    .from('client_jurisdictions')
    .select('jurisdictions ( name )')
    .eq('client_id', user.id)

  const jurisdictions = (clientJurisdictions || []).map(
    cj => (cj.jurisdictions as unknown as { name: string })?.name
  ).filter(Boolean)

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-serif font-semibold mb-6">Profile</h1>

      {/* Company card */}
      <div className="bg-white border border-black/5 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-primary/40 mb-3">Company</h2>
        <p className="text-lg font-semibold">{company?.name || 'Not set'}</p>
        {company?.sector && (
          <p className="text-sm text-primary/60 mt-1 capitalize">{company.sector}</p>
        )}
      </div>

      {/* Contact info */}
      <div className="bg-white border border-black/5 rounded-xl p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-primary/40 mb-3">Your Details</h2>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-primary/40">Name</span>
            <p className="text-sm font-medium">{profile?.first_name} {profile?.last_name}</p>
          </div>
          <div>
            <span className="text-xs text-primary/40">Email</span>
            <p className="text-sm font-medium">{profile?.email || user.email}</p>
          </div>
        </div>
      </div>

      {/* Jurisdictions */}
      {jurisdictions.length > 0 && (
        <div className="bg-white border border-black/5 rounded-xl p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary/40 mb-3">Regulatory Focus</h2>
          <div className="flex flex-wrap gap-2">
            {jurisdictions.map(j => {
              const color = j === 'CBK'
                ? 'bg-primary text-white'
                : j === 'ODPC'
                  ? 'bg-accent text-white'
                  : 'bg-primary/10 text-primary'
              return (
                <span key={j} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                  {j}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Contact lawyer */}
      <a
        href="mailto:info@mnladvocates.com"
        className="block w-full text-center py-3 bg-white border border-black/10 rounded-xl text-sm font-medium text-primary hover:bg-cream transition-colors mb-4"
      >
        Contact Your Legal Team
      </a>

      {/* Sign out */}
      <SignOutButton />
    </div>
  )
}
