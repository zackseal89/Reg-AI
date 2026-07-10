import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Building2, Scale, KeyRound } from 'lucide-react'
import SignOutButton from './sign-out-button'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePasswordAction } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, role, companies ( name, sector )')
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

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || '?'

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Profile"
        description="Your account, company, and regulatory focus."
      />

      {params.error && (
        <div
          className="mb-6 px-4 py-3 rounded-md bg-error/[0.06] border border-error/20 text-caption text-error"
          role="alert"
        >
          {params.error}
        </div>
      )}
      {params.success && (
        <div
          className="mb-6 px-4 py-3 rounded-md bg-success/[0.08] border border-success/25 text-caption text-success"
          role="status"
        >
          {params.success}
        </div>
      )}

      {/* Identity */}
      <Card className="mb-5">
        <CardContent className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-title shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-h3 font-serif text-primary truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="accent">{profile?.role || 'client'}</Badge>
              {company?.name && (
                <span className="text-caption text-ink-muted truncate">
                  {company.name}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-ink-faint" />
                <span className="text-eyebrow text-ink-muted uppercase">
                  Company
                </span>
              </div>
              <CardTitle className="text-title">
                {company?.name || 'Not set'}
              </CardTitle>
              {company?.sector && (
                <p className="text-caption text-ink-muted capitalize mt-0.5">
                  {company.sector}
                </p>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-ink-faint" />
                <span className="text-eyebrow text-ink-muted uppercase">
                  Sign-in email
                </span>
              </div>
              <CardTitle className="text-title break-all">
                {profile?.email || user.email}
              </CardTitle>
              <p className="text-caption text-ink-muted mt-0.5">
                Issued by MNL Advocates — contact counsel to change it.
              </p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {jurisdictions.length > 0 && (
        <Card className="mb-5">
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-4 h-4 text-ink-faint" />
              <span className="text-eyebrow text-ink-muted uppercase">
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
          </CardContent>
        </Card>
      )}

      {/* Security */}
      <Card className="mb-5">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-ink-faint" />
            <span className="text-eyebrow text-ink-muted uppercase">
              Change password
            </span>
          </div>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat the password"
              />
            </div>
            <div className="sm:col-span-2">
              <Button formAction={changePasswordAction} variant="outline">
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-title text-primary mb-1">
              Questions for your legal team?
            </h3>
            <p className="text-body-sm text-ink-muted">
              Reach MNL Advocates directly for bespoke regulatory advice.
            </p>
          </div>
          <a href="mailto:info@mnladvocates.com">
            <Button variant="outline">Contact</Button>
          </a>
        </CardContent>
      </Card>

      <div className="pt-4 border-t border-hairline/60">
        <SignOutButton />
      </div>
    </div>
  )
}
