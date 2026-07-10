import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Custom font-size utilities from globals.css @theme (--text-*).
 * Without registering them, tailwind-merge classifies e.g. `text-body-sm`
 * as a text-color class and drops `text-white` when both are present.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-1',
            'display-2',
            'h1',
            'h2',
            'h3',
            'title',
            'body',
            'body-sm',
            'caption',
            'eyebrow',
          ],
        },
      ],
      shadow: [{ shadow: ['soft', 'elevated'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats a timestamp as "2h ago", "3d ago", etc. for dashboard feeds. */
export function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

/**
 * Buckets how long an item has been waiting into an honest urgency tier
 * based on real elapsed time — no fabricated risk scoring.
 */
export function urgencyTier(dateString: string): 'fresh' | 'aging' | 'stale' {
  const hours = (Date.now() - new Date(dateString).getTime()) / 3_600_000
  if (hours < 24) return 'fresh'
  if (hours < 72) return 'aging'
  return 'stale'
}
