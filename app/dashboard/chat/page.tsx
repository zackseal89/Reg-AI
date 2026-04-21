'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Citation {
  document_id: string
  document_title: string
  document_type: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3.5">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow border border-primary/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="w-4 h-4">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <div className="bg-white border border-primary/10 rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm">
        <span className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] bg-accent text-white rounded-2xl rounded-br-sm px-5 py-3.5 shadow-md border border-accent"
        >
          <p className="text-[14px] font-sans leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-3.5">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow border border-primary/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="w-4 h-4">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>

      <div className="max-w-[85%] space-y-3">
        {/* Response bubble — legal document style */}
        <div className="bg-white border border-primary/15 rounded-2xl rounded-bl-sm px-6 py-5 shadow-sm border-l-4 border-l-primary/30">
          <p className="text-[14.5px] font-sans text-primary leading-loose whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Citations — formal legal footnotes */}
        {message.citations && message.citations.length > 0 && (
          <div className="pl-2 space-y-1.5 border-l-2 border-primary/10 ml-2">
            <p className="text-[10px] font-serif font-bold text-primary/40 uppercase tracking-widest mb-2">
              Sources
            </p>
            {message.citations.map((c, ci) => (
              <Link
                key={c.document_id}
                href={`/dashboard/documents/${c.document_id}`}
                className="flex items-baseline gap-2 group"
              >
                <span className="text-[10px] text-primary/40 font-mono shrink-0 w-4 text-right font-semibold">
                  {ci + 1}.
                </span>
                <span className="text-[12px] font-sans text-primary/60 group-hover:text-accent transition-colors leading-tight underline decoration-primary/20 underline-offset-4 group-hover:decoration-accent/40">
                  {c.document_title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  const prompts = [
    'What are the latest CBK requirements for payment service providers?',
    'Summarise my data protection compliance obligations under ODPC.',
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
      {/* Monogram mark */}
      <div className="w-16 h-16 rounded-full border border-primary/10 bg-white flex items-center justify-center mb-6 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-7 h-7 text-primary/40">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>

      <h2 className="text-2xl font-serif font-semibold text-primary mb-2 tracking-tight">
        AI Regulatory Counsel
      </h2>
      <p className="text-[14px] font-sans text-primary/50 max-w-[320px] leading-relaxed mb-10">
        Ask questions about your regulatory documents. Every response is grounded in content reviewed by your legal team at MN Legal.
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6 w-full max-w-sm">
        <div className="flex-1 h-px bg-primary/5" />
        <span className="text-[10px] text-primary/30 font-bold uppercase tracking-widest">Suggested Inquiries</span>
        <div className="flex-1 h-px bg-primary/5" />
      </div>

      <div className="grid gap-3 w-full max-w-sm">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="text-left px-5 py-4 bg-white border border-primary/10 rounded-xl text-[13px] text-primary/60 hover:border-accent/40 hover:text-primary transition-all duration-300 leading-relaxed shadow-sm hover:shadow-md"
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

function ChatContent() {
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

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">

      {/* Document context pill */}
      {documentId && documentTitle && (
        <div className="px-4 md:px-8 pt-4 pb-2 flex-shrink-0">
          <div className="inline-flex items-center gap-2 pl-4 pr-2.5 py-2 bg-white border border-primary/10 rounded-full text-xs text-primary/60 shadow-sm transition-all hover:border-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5 text-accent flex-shrink-0">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="max-w-[220px] truncate font-medium text-primary/80 font-sans tracking-wide">{documentTitle}</span>
            <button
              onClick={() => router.replace('/dashboard/chat')}
              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-primary/40 hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer"
              aria-label="Remove context"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Message list or empty state */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages && !showTyping ? (
          <EmptyState onPrompt={(p) => { setInput(p); sendMessage(p) }} />
        ) : (
          <div className="px-4 md:px-8 py-6 space-y-8">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {showTyping && <TypingIndicator />}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-4 md:px-8 pt-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-3 bg-white/95 backdrop-blur-md border border-primary/10 rounded-2xl px-5 py-3.5 shadow-lg max-w-4xl mx-auto focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your regulatory landscape..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 text-[15px] font-sans bg-transparent focus:outline-none resize-none text-primary placeholder:text-primary/30 disabled:opacity-50 leading-relaxed py-1"
            style={{ maxHeight: 150 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-30 transition-all duration-200 flex-shrink-0 self-end mb-0.5 hover:bg-accent hover:shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] font-sans text-primary/30 text-center mt-3 tracking-wide">
          Responses grounded solely in documents published to your account · MN Legal AI
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#1a2744]/35">Loading…</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
