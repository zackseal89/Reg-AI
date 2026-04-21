import Link from 'next/link'
import type { ReactNode } from 'react'

export interface SignInShellProps {
  variant: 'client' | 'lawyer' | 'admin'
  eyebrow: string
  headline: ReactNode
  subheadline: string
  formTitle: string
  formSubtitle: string
  footer?: ReactNode
  errorMessage?: string
  action: (formData: FormData) => void | Promise<void>
}

const paletteFor = (v: SignInShellProps['variant']) => {
  switch (v) {
    case 'admin':
      return {
        panelGradient:
          'linear-gradient(135deg, #09090b 0%, #18181b 55%, #27272a 100%)',
        eyebrowColor: '#8b1c3f',
        accentBar: '#8b1c3f',
        buttonBg: '#09090b',
        buttonText: '#f5f3ef',
      }
    case 'lawyer':
      return {
        panelGradient:
          'linear-gradient(135deg, #0d1729 0%, #1a2744 55%, #1e2f52 100%)',
        eyebrowColor: '#c9a96a',
        accentBar: '#c9a96a',
        buttonBg: '#1a2744',
        buttonText: '#f5f3ef',
      }
    default:
      return {
        panelGradient:
          'linear-gradient(135deg, #0d1729 0%, #1a2744 55%, #1e2f52 100%)',
        eyebrowColor: '#8b1c3f',
        accentBar: '#8b1c3f',
        buttonBg: '#1a2744',
        buttonText: '#f5f3ef',
      }
  }
}

export function SignInShell({
  variant,
  eyebrow,
  headline,
  subheadline,
  formTitle,
  formSubtitle,
  footer,
  errorMessage,
  action,
}: SignInShellProps) {
  const p = paletteFor(variant)

  return (
    <main className="flex-1 grid lg:grid-cols-[1.1fr_1fr] min-h-screen">
      <section
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-16 text-[#f5f3ef]"
        style={{ background: p.panelGradient }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.6,
          }}
        />
        <div
          className="absolute left-0 top-0 h-full w-px"
          style={{
            background: `linear-gradient(180deg, transparent, ${p.accentBar} 40%, transparent)`,
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-px w-8" style={{ background: p.accentBar }} />
          <span
            className="font-sans text-xs tracking-[0.25em] uppercase"
            style={{ color: p.eyebrowColor }}
          >
            {eyebrow}
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2
            className="font-serif leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(2.25rem, 3.5vw, 3.25rem)' }}
          >
            {headline}
          </h2>
          <p
            className="font-sans leading-relaxed"
            style={{
              fontSize: '0.95rem',
              color: 'rgba(245,243,239,0.55)',
            }}
          >
            {subheadline}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <span
            className="font-serif italic text-sm"
            style={{ color: 'rgba(245,243,239,0.3)' }}
          >
            Nairobi · Kenya
          </span>
          <span
            className="font-sans text-xs tracking-widest uppercase"
            style={{ color: 'rgba(245,243,239,0.3)' }}
          >
            CBK · ODPC
          </span>
        </div>
      </section>

      <section className="flex items-center justify-center p-8 sm:p-12 bg-[#f5f3ef]">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="h-px w-5"
              style={{ background: p.eyebrowColor }}
            />
            <span
              className="font-sans text-xs tracking-[0.2em] uppercase"
              style={{ color: p.eyebrowColor }}
            >
              {formTitle}
            </span>
          </div>

          <h1
            className="font-serif leading-tight mb-3"
            style={{ fontSize: '2.25rem', color: '#1a2744' }}
          >
            Sign in to RegWatch
          </h1>
          <p
            className="font-sans text-sm mb-10"
            style={{ color: 'rgba(26,39,68,0.55)' }}
          >
            {formSubtitle}
          </p>

          {errorMessage && (
            <div
              className="mb-6 px-4 py-3 font-sans text-xs tracking-wide"
              style={{
                background: 'rgba(139,28,63,0.06)',
                borderLeft: '2px solid #8b1c3f',
                color: '#8b1c3f',
              }}
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <form className="flex flex-col gap-7">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="font-sans text-xs tracking-widest uppercase"
                style={{ color: '#1a2744' }}
              >
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="font-sans text-sm py-3 bg-transparent outline-none focus:border-[#1a2744] transition-colors"
                style={{
                  borderBottom: '1px solid #d1cdc5',
                  color: '#1a2744',
                }}
                placeholder="name@company.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="font-sans text-xs tracking-widest uppercase"
                style={{ color: '#1a2744' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="font-sans text-sm py-3 bg-transparent outline-none focus:border-[#1a2744] transition-colors"
                style={{
                  borderBottom: '1px solid #d1cdc5',
                  color: '#1a2744',
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              formAction={action}
              className="mt-2 flex items-center justify-center gap-2 py-4 font-sans text-sm tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{
                background: p.buttonBg,
                color: p.buttonText,
                letterSpacing: '0.12em',
              }}
            >
              Sign In
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </form>

          {footer && (
            <div
              className="mt-10 font-sans text-xs space-y-2"
              style={{ color: 'rgba(26,39,68,0.5)' }}
            >
              {footer}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export function ShellFooterLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="underline underline-offset-4 transition-colors hover:text-[#8b1c3f]"
      style={{ color: '#1a2744' }}
    >
      {children}
    </Link>
  )
}
