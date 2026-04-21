import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Building2, Scale } from 'lucide-react'
import SignOutButton from './sign-out-button'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, companies ( name, sector )')
    .eq('id', user.id)
    .single()

  const company = profile?.companies as unknown as {
    name: string
    sector: string
  } | null

  const { data: clientJurisdictions } = await supabase
    .from('client_jurisdictions')
    .select('jurisdictions ( name )')
    .eq('client_id', user.id)

  const jurisdictions = (clientJurisdictions || [])
    .map(cj => (cj.jurisdictions as unknown as { name: string })?.name)
    .filter(Boolean)

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Your Profile"
        description="Your account details, company, and regulatory focus."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-primary/50" />
            <span className="text-[11px] font-bold text-primary/50 uppercase tracking-widest">
              Company
            </span>
          </div>
          <p className="font-serif text-xl font-semibold text-primary mb-1">
            {company?.name || 'Not set'}
          </p>
          {company?.sector && (
            <p className="text-sm text-primary/60 capitalize">
              {company.sector}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-primary/50" />
            <span className="text-[11px] font-bold text-primary/50 uppercase tracking-widest">
              Your details
            </span>
          </div>
          <p className="font-serif text-xl font-semibold text-primary mb-1">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-sm text-primary/60">
            {profile?.email || user.email}
          </p>
        </Card>
      </div>

      {jurisdictions.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-primary/50" />
            <span className="text-[11px] font-bold text-primary/50 uppercase tracking-widest">
              Regulatory focus
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {jurisdictions.map(j => (
              <Badge key={j} variant="accent">
                {j}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary mb-1">
              Questions for your legal team?
            </h3>
            <p className="text-sm text-primary/60">
              Reach MNL Advocates directly for bespoke regulatory advice.
            </p>
          </div>
          <a href="mailto:info@mnladvocates.com">
            <Button variant="outline">Contact</Button>
          </a>
        </div>
      </Card>

      <div className="pt-4 border-t border-primary/5">
        <SignOutButton />
      </div>
    </div>
  )
}
