import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { setPasswordAction } from './actions'

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      '/login?error=' +
        encodeURIComponent(
          'Open the invite link from your email to set up your account.'
        )
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, companies ( name )')
    .eq('id', user.id)
    .single()

  const company = profile?.companies as unknown as { name: string } | null

  return (
    <main className="flex-1 grid lg:grid-cols-[1.1fr_1fr] min-h-screen">
      {/* Night band */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden p-16 bg-primary text-cream">
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-px w-8 bg-[#d98da4]" />
          <span className="font-sans text-eyebrow uppercase tracking-[0.2em] text-[#d98da4]">
            MNL Advocates LLP
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2
            className="font-serif font-semibold text-white leading-[1.12] mb-6"
            style={{ fontSize: 'clamp(2.25rem, 3.5vw, 3.25rem)' }}
          >
            Welcome to your regulatory counsel.
          </h2>
          <p className="font-sans text-body leading-relaxed text-white/80">
            {company?.name
              ? `${company.name} has been onboarded by MNL Advocates. Set a password to open your workspace.`
              : 'Your account has been prepared by MNL Advocates. Set a password to open your workspace.'}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between text-white/60">
          <span className="font-serif italic text-caption">
            Nairobi · Kenya
          </span>
          <span className="font-sans text-eyebrow uppercase tracking-widest">
            CBK · ODPC
          </span>
        </div>
      </section>

      {/* Set-password card */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-surface">
        <div className="w-full max-w-md">
          <div className="bg-white border border-hairline rounded-xl shadow-soft p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-8">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="font-sans text-eyebrow uppercase tracking-[0.15em] text-accent">
                Account setup
              </span>
            </div>

            <h1 className="text-h2 font-serif text-primary mb-2">
              {profile?.first_name
                ? `Karibu, ${profile.first_name}`
                : 'Set your password'}
            </h1>
            <p className="font-sans text-body-sm text-ink-muted mb-8">
              Choose a password for {user.email}. You&apos;ll use it to sign in
              to RegWatch from now on.
            </p>

            {params.error && (
              <div
                className="mb-6 px-4 py-3 rounded-md bg-error/[0.06] border border-error/20 font-sans text-caption text-error"
                role="alert"
              >
                {params.error}
              </div>
            )}

            <form className="flex flex-col gap-5">
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

              <Button
                formAction={setPasswordAction}
                size="lg"
                className="mt-2 w-full"
              >
                Open my workspace
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <p className="mt-8 px-2 font-sans text-caption text-ink-muted">
            Trouble signing in? Contact your MNL Advocates counsel directly.
          </p>
        </div>
      </section>
    </main>
  )
}
