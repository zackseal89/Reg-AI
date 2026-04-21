import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  SignInShell,
  ShellFooterLink,
} from '../_components/sign-in-shell'

export default async function LoginPage({
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      redirect('/login?error=Could not authenticate user')
    }

    redirect('/')
  }

  return (
    <SignInShell
      variant="client"
      eyebrow="MN Advocates LLP"
      headline={
        <>
          A confidential channel to your{' '}
          <span className="italic" style={{ color: 'rgba(245,243,239,0.65)' }}>
            regulatory counsel.
          </span>
        </>
      }
      subheadline="Every briefing, every document — reviewed and approved by a practising advocate before it reaches your desk."
      formTitle="Client Access"
      formSubtitle="Enter the credentials issued to you by MN Advocates."
      errorMessage={errorMessage}
      action={login}
      footer={
        <>
          <p>
            Not yet a client?{' '}
            <ShellFooterLink href="/">
              Request concierge access
            </ShellFooterLink>
            .
          </p>
          <p>
            MNL counsel?{' '}
            <ShellFooterLink href="/lawyer-login">
              Counsel sign-in
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
