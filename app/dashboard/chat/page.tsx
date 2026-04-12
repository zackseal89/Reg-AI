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
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#1a2744] flex items-center justify-center flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          className="w-3.5 h-3.5"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <div className="bg-white border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#1a2744]/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
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
        <div className="max-w-[80%] bg-[#8b1c3f] text-white rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#1a2744] flex items-center justify-center flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          className="w-3.5 h-3.5"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <div className="max-w-[80%] space-y-2">
        <div className="bg-white border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3">
          <p className="text-sm text-[#1a2744] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {message.citations.map((c) => (
              <Link
                key={c.document_id}
                href={`/dashboard/documents/${c.document_id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a2744]/5 hover:bg-[#1a2744]/10 border border-[#1a2744]/10 rounded-full text-[10px] text-[#1a2744]/70 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-3 h-3"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {c.document_title}
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
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-[#8b1c3f]/10 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8 text-[#8b1c3f]/60"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-serif font-semibold text-[#1a2744] mb-2">
        AI Regulatory Assistant
      </h2>
      <p className="text-sm text-[#1a2744]/50 max-w-xs leading-relaxed mb-6">
        Ask questions about your regulatory documents. Responses are grounded in
        content reviewed by your legal team.
      </p>
      <div className="grid gap-2 w-full max-w-xs">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="text-left px-4 py-3 bg-white border border-black/5 rounded-xl text-sm text-[#1a2744]/60 hover:border-[#1a2744]/20 hover:text-[#1a2744]/80 transition-colors"
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

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  // Auto-resize textarea
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

      // Build conversation history (exclude last user message — we send it as message)
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
                  // Add assistant message placeholder
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
    <div className="flex flex-col h-full bg-[#f5f3ef]">
      {/* Context pill */}
      {documentId && documentTitle && (
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-[#1a2744]/8 border border-[#1a2744]/10 rounded-full text-xs text-[#1a2744]/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-3 h-3 flex-shrink-0"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="max-w-[200px] truncate font-medium">{documentTitle}</span>
            <button
              onClick={() => router.replace('/dashboard/chat')}
              className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#1a2744]/10 transition-colors"
              aria-label="Remove context"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="w-2.5 h-2.5"
              >
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
          <div className="px-4 py-4 space-y-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {showTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar — pinned above safe area */}
      <div
        className="flex-shrink-0 px-4 pt-2 pb-4 bg-[#f5f3ef] border-t border-black/5"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-2 bg-white border border-black/10 rounded-2xl px-4 py-2.5 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 text-sm bg-transparent focus:outline-none resize-none text-[#1a2744] placeholder:text-[#1a2744]/30 disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="p-1.5 rounded-lg bg-[#8b1c3f] text-white disabled:opacity-30 transition-opacity flex-shrink-0 self-end mb-0.5"
            aria-label="Send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-[#1a2744]/30 text-center mt-2">
          Responses grounded in documents published to your account only. Enter to send · Shift+Enter for new line.
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
          <p className="text-sm text-[#1a2744]/40">Loading…</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
