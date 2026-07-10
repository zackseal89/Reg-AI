'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageSquare, FileText, X, Square, Send } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Citation {
  document_id: string | null
  document_title: string
  document_type?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

interface Turn {
  question: string
  answer?: Message
}

// ---------------------------------------------------------------------------
// Answer prose — flowing text, no bubble, no shadow, no avatar
// ---------------------------------------------------------------------------

function AnswerProse({ content }: { content: string }) {
  return (
    <div className="text-[15px] font-sans text-primary leading-loose max-w-[68ch]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-3 last:mb-0 ml-5 list-disc space-y-1.5 marker:text-ink-faint">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 last:mb-0 ml-5 list-decimal space-y-1.5 marker:text-ink-faint">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-primary">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-ink-secondary">{children}</em>,
          h1: ({ children }) => (
            <h3 className="font-serif font-semibold text-lg text-primary mt-5 mb-2">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="font-serif font-semibold text-base text-primary mt-5 mb-2">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="font-sans font-semibold text-[15px] text-primary mt-4 mb-1.5">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/40 pl-4 py-0.5 my-3 text-ink-secondary italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-surface-low rounded text-caption font-mono text-ink-secondary">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-hairline/60" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full text-caption border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left font-semibold text-primary px-3 py-2 border-b border-hairline">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-hairline/60 align-top">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Citations — endnotes, not source cards
// ---------------------------------------------------------------------------

function Citations({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null

  return (
    <div className="mt-5 pt-4 border-t border-hairline/70 max-w-[68ch]">
      <p className="text-eyebrow font-sans font-semibold text-ink-faint uppercase tracking-widest mb-2.5">
        Sources
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {citations.map((c, ci) => {
          const inner = (
            <>
              <span className="text-eyebrow text-accent font-semibold shrink-0">{ci + 1}</span>
              <span className="text-caption text-ink-muted group-hover:text-primary transition-colors leading-tight">
                {c.document_title}
              </span>
            </>
          )
          return c.document_id ? (
            <Link
              key={`${c.document_id}-${ci}`}
              href={`/dashboard/documents/${c.document_id}`}
              className="inline-flex items-baseline gap-1.5 group"
            >
              {inner}
            </Link>
          ) : (
            <div key={`unlinked-${ci}`} className="inline-flex items-baseline gap-1.5">
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Turn — one exchange, rendered as a memo entry: question as headline,
// answer as flowing prose beneath it. No bubbles, no avatars.
// ---------------------------------------------------------------------------

function TurnBlock({
  turn,
  pending,
}: {
  turn: Turn
  pending: boolean
}) {
  return (
    <div className="py-8 first:pt-0">
      <h3 className="font-serif text-title font-semibold text-primary leading-snug tracking-tight max-w-[42ch] mb-4">
        {turn.question}
      </h3>

      {turn.answer ? (
        <>
          <AnswerProse content={turn.answer.content} />
          <Citations citations={turn.answer.citations ?? []} />
        </>
      ) : pending ? (
        <span className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </span>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({
  onPrompt,
  prompts,
}: {
  onPrompt: (text: string) => void
  prompts: string[]
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
      <div className="w-16 h-16 rounded-full border border-hairline bg-white flex items-center justify-center mb-6">
        <MessageSquare className="w-7 h-7 text-ink-faint" strokeWidth={1} />
      </div>

      <h2 className="text-h3 font-serif font-bold text-primary mb-2 tracking-tight">
        AI Regulatory Counsel
      </h2>
      <p className="text-body-sm font-sans text-ink-muted max-w-[320px] leading-relaxed mb-10">
        Ask questions about your regulatory documents. Every response is grounded in content reviewed by your legal team at MN Legal.
      </p>

      <div className="flex items-center gap-4 mb-2 w-full max-w-sm">
        <div className="flex-1 h-px bg-hairline/60" />
        <span className="text-eyebrow text-ink-faint font-bold uppercase tracking-widest">Suggested Inquiries</span>
        <div className="flex-1 h-px bg-hairline/60" />
      </div>

      <div className="divide-y divide-hairline w-full max-w-sm">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="w-full text-left py-4 text-caption text-ink-secondary hover:text-accent transition-colors duration-200 leading-relaxed cursor-pointer"
          >
            &ldquo;{p}&rdquo;
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main chat component
// ---------------------------------------------------------------------------

function ChatContent({ suggestedPrompts }: { suggestedPrompts: string[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const documentId = searchParams.get('document_id')
  const documentTitle = searchParams.get('title')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showTyping, setShowTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [input])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      setInput('')
      setIsStreaming(true)
      setShowTyping(true)

      const userMessage: Message = { role: 'user', content: trimmed }
      setMessages((prev) => [...prev, userMessage])

      const history = messages.map((m) => ({ role: m.role, content: m.content }))

      const body: Record<string, unknown> = {
        message: trimmed,
        conversation_history: history,
      }
      if (documentId) body.context_document_id = documentId

      abortRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let assistantContent = ''
        let citations: Citation[] = []
        let firstToken = true

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const event = JSON.parse(data)

              if (event.type === 'citations') {
                citations = event.citations
              } else if (event.type === 'text') {
                if (firstToken) {
                  firstToken = false
                  setShowTyping(false)
                  setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: '', citations },
                  ])
                }
                assistantContent += event.text
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantContent,
                    citations,
                  }
                  return updated
                })
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        console.error('[chat]', err)
        setShowTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Something went wrong. Please try again or contact MNL Advocates if the issue persists.',
          },
        ])
      } finally {
        setIsStreaming(false)
        setShowTyping(false)
      }
    },
    [isStreaming, messages, documentId]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasMessages = messages.length > 0

  const turns: Turn[] = []
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role !== 'user') continue
    const next = messages[i + 1]
    turns.push({
      question: messages[i].content,
      answer: next?.role === 'assistant' ? next : undefined,
    })
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">

      {/* Document context pill */}
      {documentId && documentTitle && (
        <div className="px-4 md:px-8 pt-4 pb-2 flex-shrink-0">
          <div className="inline-flex items-center gap-2 pl-4 pr-2.5 py-2 bg-white border border-hairline rounded-full text-caption text-ink-secondary transition-all hover:border-primary/20">
            <FileText className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.75} />
            <span className="max-w-[220px] truncate font-medium text-ink-secondary font-sans tracking-wide">{documentTitle}</span>
            <button
              onClick={() => router.replace('/dashboard/chat')}
              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-ink-faint hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer"
              aria-label="Remove context"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Message list or empty state */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages && !showTyping ? (
          <EmptyState
            prompts={suggestedPrompts}
            onPrompt={(p) => { setInput(p); sendMessage(p) }}
          />
        ) : (
          <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
            <div className="divide-y divide-hairline">
              {turns.map((t, i) => (
                <TurnBlock key={i} turn={t} pending={i === turns.length - 1 && showTyping} />
              ))}
            </div>
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-4 md:px-8 pt-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-3 bg-white border border-hairline rounded-lg px-5 py-3.5 max-w-3xl mx-auto focus-within:border-primary/40 transition-colors duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your regulatory landscape..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 text-body-sm font-sans bg-transparent focus:outline-none resize-none text-primary placeholder:text-ink-faint disabled:opacity-50 leading-relaxed py-1"
            style={{ maxHeight: 150 }}
          />
          {isStreaming ? (
            <button
              onClick={() => abortRef.current?.abort()}
              className="p-2.5 rounded-md bg-accent text-white transition-colors duration-200 flex-shrink-0 self-end mb-0.5 hover:bg-accent-active cursor-pointer"
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square className="w-4 h-4" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="p-2.5 rounded-md bg-primary text-white disabled:opacity-30 transition-colors duration-200 flex-shrink-0 self-end mb-0.5 hover:bg-accent cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
        <p className="text-eyebrow font-sans text-ink-faint text-center mt-3 tracking-wide">
          Responses grounded solely in documents published to your account · MN Legal AI
        </p>
      </div>
    </div>
  )
}

export default ChatContent
