import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  SignInShell,
  ShellFooterLink,
} from '../_components/sign-in-shell'

export default async function AdminLoginPage({
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
      redirect('/admin-login?error=Could not authenticate user')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      redirect('/admin-login?error=Admin access required.')
    }

    redirect('/admin')
  }

  return (
    <SignInShell
      variant="admin"
      eyebrow="Operations"
      headline={
        <>
          The control room for MNL&apos;s{' '}
          <span className="italic" style={{ color: 'rgba(245,243,239,0.65)' }}>
            regulatory desk.
          </span>
        </>
      }
      subheadline="Manage lawyers, audit every action, and keep the platform in line with MNL's standards."
      formTitle="Admin Access"
      formSubtitle="Restricted to platform operators at MNL Advocates."
      errorMessage={errorMessage}
      action={login}
      footer={
        <>
          <p>
            Are you a lawyer?{' '}
            <ShellFooterLink href="/lawyer-login">
              Counsel sign-in
            </ShellFooterLink>
            .
          </p>
          <p>
            Are you a client?{' '}
            <ShellFooterLink href="/login">
              Client portal
            </ShellFooterLink>
            .
          </p>
        </>
      }
    />
  )
}
