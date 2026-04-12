'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function DocFilters({ jurisdictions }: { jurisdictions: { id: string; name: string }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentJ = searchParams.get('jurisdiction') || ''
  const currentQ = searchParams.get('q') || ''

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/documents?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/30">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search documents..."
          defaultValue={currentQ}
          onChange={e => updateParams('q', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-black/10 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Jurisdiction filter */}
      <div className="flex gap-2">
        <button
          onClick={() => updateParams('jurisdiction', '')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !currentJ ? 'bg-primary text-white' : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
          }`}
        >
          All
        </button>
        {jurisdictions.map(j => {
          const isActive = currentJ === j.id
          const color = j.name === 'CBK'
            ? isActive ? 'bg-primary text-white' : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
            : isActive ? 'bg-accent text-white' : 'bg-accent/5 text-accent/60 hover:bg-accent/10'
          return (
            <button
              key={j.id}
              onClick={() => updateParams('jurisdiction', isActive ? '' : j.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${color}`}
            >
              {j.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
