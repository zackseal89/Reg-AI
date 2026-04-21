import { cn } from '@/lib/utils'

type PortalVariant = 'client' | 'lawyer' | 'admin'

const COPY: Record<PortalVariant, string> = {
  client: 'Client Portal',
  lawyer: 'Counsel Workspace',
  admin: 'Admin Console',
}

// Surface tones: client uses the accent burgundy to feel warm and guest-facing,
// lawyer uses the counsel gold, admin uses zinc to match the admin shell.
const DOT: Record<PortalVariant, string> = {
  client: 'bg-accent shadow-[0_0_6px_rgba(139,28,63,0.55)]',
  lawyer: 'bg-[#c9a96a] shadow-[0_0_6px_rgba(201,169,106,0.55)]',
  admin: 'bg-zinc-300 shadow-[0_0_6px_rgba(212,212,216,0.55)]',
}

// The badge is dropped onto both light (content areas) and dark (sidebars /
// sign-in panels) surfaces, so text colour is driven by `tone`, not variant.
const TONE_TEXT: Record<'light' | 'dark', string> = {
  light: 'text-primary/70',
  dark: 'text-white/80',
}
const TONE_SURFACE: Record<'light' | 'dark', string> = {
  light: 'bg-white border border-primary/10',
  dark: 'bg-white/5 border border-white/10',
}

export function PortalBadge({
  variant,
  className,
  tone = 'light',
  surface = 'auto',
}: {
  variant: PortalVariant
  className?: string
  /** 'light' for cream/white surfaces, 'dark' for navy/zinc surfaces. */
  tone?: 'light' | 'dark'
  /** 'auto' applies the default pill surface; 'transparent' drops it. */
  surface?: 'auto' | 'transparent'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.18em]',
        surface === 'auto' && TONE_SURFACE[tone],
        TONE_TEXT[tone],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', DOT[variant])} />
      {COPY[variant]}
    </span>
  )
}
