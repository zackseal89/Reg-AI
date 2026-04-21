import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  SignInShell,
  ShellFooterLink,
} from '../_components/sign-in-shell'

export default async function LawyerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const errorMessage = params.error

  const login = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      redirect('/lawyer-login?error=Could not authenticate user')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'lawyer' && profile?.role !== 'admin') {
      await supabase.auth.signOut()
      redirect(
        '/lawyer-login?error=This sign-in is reserved for MNL counsel.'
      )
    }

    redirect('/lawyer')
  }

  return (
    <SignInShell
      variant="lawyer"
      eyebrow="MNL Counsel"
      headline={
        <>
          For the advocates behind every{' '}
          <span className="italic" style={{ color: 'rgba(245,243,239,0.65)' }}>
            approved briefing.
          </span>
        </>
      }
      subheadline="Review filings, draft regulatory intelligence, and publish documents to your clients — all from one secure desk."
      formTitle="Counsel Access"
      formSubtitle="Use your MNL Advocates email and the password you set on invitation."
      errorMessage={errorMessage}
      action={login}
      footer={
        <>
          <p>
            Are you a client?{' '}
            <ShellFooterLink href="/login">
              Sign in to the client portal
            </ShellFooterLink>
            .
          </p>
          <p>
            Platform admin?{' '}
            <ShellFooterLink href="/admin-login">
              Admin sign-in
            </ShellFooterLink>
            .
          </p>
        </>
      }
    />
  )
}
