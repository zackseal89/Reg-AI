'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { FileText, FolderOpen, ClipboardCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, timeAgo, urgencyTier } from '@/lib/utils'

export type ApprovalKind = 'briefing' | 'document'

export interface ApprovalQueueItem {
  id: string
  kind: ApprovalKind
  title: string
  jurisdiction?: string | null
  /** Real content preview — briefing content or document description, truncated by CSS. */
  snippet?: string | null
  created_at: string
  href: string
}

const URGENCY_DOT = {
  fresh: 'bg-ink-faint/50',
  aging: 'bg-amber-500',
  stale: 'bg-accent',
} as const

type ItemRef = { id: string; kind: ApprovalKind }

export function ApprovalsQueue({
  items,
  approveOne,
  approveMany,
}: {
  items: ApprovalQueueItem[]
  approveOne: (item: ItemRef) => Promise<void>
  approveMany: (items: ItemRef[]) => Promise<void>
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'all' | ApprovalKind>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const key = (i: ItemRef) => `${i.kind}-${i.id}`

  const live = items.filter(i => !hidden.has(key(i)))
  const briefingCount = live.filter(i => i.kind === 'briefing').length
  const documentCount = live.filter(i => i.kind === 'document').length
  const visible = live.filter(i => tab === 'all' || i.kind === tab)

  function toggleSelect(k: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  function handleApproveOne(item: ApprovalQueueItem) {
    const k = key(item)
    startTransition(async () => {
      try {
        await approveOne({ id: item.id, kind: item.kind })
        setHidden(prev => new Set(prev).add(k))
        setSelected(prev => {
          const next = new Set(prev)
          next.delete(k)
          return next
        })
        toast.success(
          item.kind === 'briefing' ? 'Briefing approved' : 'Document published'
        )
        router.refresh()
      } catch {
        toast.error('Something went wrong — please try again')
      }
    })
  }

  function handleApproveSelected() {
    const toApprove = visible.filter(i => selected.has(key(i)))
    if (toApprove.length === 0) return
    startTransition(async () => {
      try {
        await approveMany(toApprove.map(i => ({ id: i.id, kind: i.kind })))
        setHidden(prev => {
          const next = new Set(prev)
          toApprove.forEach(i => next.add(key(i)))
          return next
        })
        setSelected(new Set())
        toast.success(
          `${toApprove.length} item${toApprove.length === 1 ? '' : 's'} approved`
        )
        router.refresh()
      } catch {
        toast.error('Something went wrong — please try again')
      }
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="w-6 h-6" />}
        title="Nothing pending"
        description="You're all caught up — new drafts and assignments will appear here."
      />
    )
  }

  return (
    <div>
      <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All ({briefingCount + documentCount})</TabsTrigger>
          <TabsTrigger value="briefing">Briefings ({briefingCount})</TabsTrigger>
          <TabsTrigger value="document">Documents ({documentCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg transition-all duration-200 overflow-hidden',
          selected.size > 0
            ? 'max-h-16 opacity-100 mt-4 px-4 py-3 bg-accent/[0.05] border border-accent/15'
            : 'max-h-0 opacity-0'
        )}
      >
        <span className="text-body-sm font-semibold text-primary">
          {selected.size} selected
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-caption font-medium text-ink-muted hover:text-primary transition-colors"
          >
            Clear
          </button>
          <Button size="sm" onClick={handleApproveSelected} disabled={isPending}>
            Approve {selected.size}
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-body-sm text-ink-muted py-10 text-center">
          Nothing here right now.
        </p>
      ) : (
        <div className="divide-y divide-hairline/60 mt-2">
          {visible.map(item => {
            const k = key(item)
            const tier = urgencyTier(item.created_at)
            const Icon = item.kind === 'briefing' ? FileText : FolderOpen

            return (
              <div key={k} className="flex items-start gap-3.5 py-4">
                <Checkbox
                  checked={selected.has(k)}
                  onChange={() => toggleSelect(k)}
                  aria-label={`Select ${item.title}`}
                  className="mt-3.5 shrink-0"
                />
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    item.kind === 'briefing'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-primary/8 text-primary'
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={item.href}
                      className="text-body-sm font-semibold text-primary hover:text-accent transition-colors truncate"
                    >
                      {item.title}
                    </Link>
                    {item.jurisdiction && (
                      <Badge variant="accent">{item.jurisdiction}</Badge>
                    )}
                  </div>
                  {item.snippet && (
                    <p className="text-caption text-ink-muted truncate mt-0.5 max-w-xl">
                      {item.snippet}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        URGENCY_DOT[tier]
                      )}
                    />
                    <span className="text-caption text-ink-faint">
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproveOne(item)}
                  disabled={isPending}
                  className="shrink-0 mt-0.5"
                >
                  {item.kind === 'briefing' ? 'Approve' : 'Publish'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
