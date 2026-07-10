'use client'

import * as React from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowRight, Check, Copy, ExternalLink, FilePen, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

export type Template = {
  id: string
  title: string
  kind: 'briefing' | 'document'
  category: string
  jurisdiction: string
  description: string
  body: string
  adaptation_notes: string | null
  source: string | null
  source_url: string | null
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'regulatory_briefing', label: 'Regulatory briefings' },
  { key: 'data_protection', label: 'Data protection (ODPC)' },
  { key: 'banking_fintech', label: 'Banking & fintech (CBK)' },
  { key: 'board_reporting', label: 'Board reporting' },
  { key: 'client_onboarding', label: 'Client onboarding' },
]

// Reuse the chat renderer's markdown mapping so template bodies read as prose.
const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 last:mb-0 ml-5 list-disc space-y-1.5 marker:text-ink-faint">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 last:mb-0 ml-5 list-decimal space-y-1.5 marker:text-ink-faint">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-primary">{children}</strong>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="font-serif font-semibold text-base text-primary mt-5 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="font-sans font-semibold text-[15px] text-primary mt-4 mb-1.5">
      {children}
    </h4>
  ),
  hr: () => <hr className="my-4 border-hairline/60" />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-caption border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="text-left font-semibold text-primary px-3 py-2 border-b border-hairline whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 border-b border-hairline/60 align-top">{children}</td>
  ),
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — no-op; the body is still visible to select.
    }
  }

  return (
    <Button type="button" variant="subtle" onClick={handleCopy}>
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied' : 'Copy template'}
    </Button>
  )
}

function TemplateCard({
  template,
  enableUseInBriefing,
}: {
  template: Template
  enableUseInBriefing: boolean
}) {
  const canDraft = enableUseInBriefing && template.kind === 'briefing'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group w-full text-left rounded-xl border border-hairline bg-white p-5 transition-all hover:border-primary/25 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-eyebrow font-semibold uppercase tracking-wider text-accent">
              {template.jurisdiction}
            </span>
            <Badge variant={template.kind === 'briefing' ? 'accent' : 'default'}>
              {template.kind}
            </Badge>
          </div>

          <h3 className="font-serif text-h3 font-semibold text-primary leading-snug tracking-tight mb-2 transition-colors group-hover:text-accent">
            {template.title}
          </h3>

          <p className="text-body-sm text-ink-secondary leading-relaxed line-clamp-2 mb-3">
            {template.description}
          </p>

          <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary group-hover:text-accent transition-colors">
            {canDraft ? 'View & use template' : 'View template'}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-eyebrow font-semibold uppercase tracking-wider text-accent">
              {template.jurisdiction}
            </span>
            <Badge variant={template.kind === 'briefing' ? 'accent' : 'default'}>
              {template.kind}
            </Badge>
          </div>
          <DialogTitle>{template.title}</DialogTitle>
          <p className="text-body-sm text-ink-muted mt-1.5 max-w-[64ch]">
            {template.description}
          </p>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg border border-hairline bg-surface-low/40 p-5">
            <span className="text-eyebrow font-semibold uppercase tracking-wider text-ink-faint">
              Starter content
            </span>
            <div className="mt-3 text-body-sm font-sans text-primary leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {template.body}
              </ReactMarkdown>
            </div>
          </div>

          {template.adaptation_notes && (
            <div className="mt-5 flex gap-3 rounded-md border border-accent/20 bg-white p-4">
              <Lightbulb className="w-4 h-4 shrink-0 text-accent mt-0.5" />
              <div>
                <p className="text-eyebrow font-semibold uppercase tracking-wider text-accent mb-1">
                  Adapt for Kenya
                </p>
                <p className="text-caption text-ink-secondary leading-relaxed">
                  {template.adaptation_notes}
                </p>
              </div>
            </div>
          )}

          {template.source && (
            <p className="mt-4 text-caption text-ink-faint">
              Based on {template.source}
              {template.source_url && (
                <>
                  {' — '}
                  <a
                    href={template.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:text-accent-active"
                  >
                    source <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Close
            </Button>
          </DialogClose>
          <CopyButton text={template.body} />
          {canDraft && (
            <Link
              href={`/lawyer/briefings?template=${template.id}`}
              className={buttonVariants({ variant: 'primary', size: 'md' })}
            >
              <FilePen className="w-4 h-4" />
              Use in a briefing
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TemplateLibrary({
  templates,
  enableUseInBriefing = false,
}: {
  templates: Template[]
  enableUseInBriefing?: boolean
}) {
  const [activeCategory, setActiveCategory] = React.useState<string>('all')

  const filters = [
    { key: 'all', label: 'All' },
    ...CATEGORIES.filter(c => templates.some(t => t.category === c.key)),
  ]

  const visibleCategories =
    activeCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter(c => c.key === activeCategory)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveCategory(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-caption font-semibold transition-colors ${
              activeCategory === f.key
                ? 'bg-primary text-white'
                : 'bg-white border border-hairline text-ink-muted hover:text-primary hover:border-primary/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {visibleCategories.map(category => {
          const items = templates.filter(t => t.category === category.key)
          if (items.length === 0) return null
          return (
            <section key={category.key}>
              <h2 className="text-eyebrow font-semibold uppercase tracking-wider text-ink-faint mb-4">
                {category.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    enableUseInBriefing={enableUseInBriefing}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
