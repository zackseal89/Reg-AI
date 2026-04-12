'use client'

import { useState } from 'react'

const DOC_TYPES: Record<string, string> = {
  circular: 'Circular',
  gazette_notice: 'Gazette Notice',
  regulation: 'Regulation',
  guideline: 'Guidance Note',
  policy: 'Policy Brief',
  other: 'Other',
}

// Auto-fill regulatory body based on jurisdiction
const JURISDICTION_BODIES: Record<string, string> = {
  CBK: 'Central Bank of Kenya',
  ODPC: 'Office of the Data Protection Commissioner',
}

type Jurisdiction = { id: string; name: string }
type Client = {
  id: string
  first_name: string
  last_name: string
  company_name: string | null
  jurisdiction_ids: string[]
}

export default function UploadForm({
  jurisdictions,
  clients,
  uploadAction,
}: {
  jurisdictions: Jurisdiction[]
  clients: Client[]
  uploadAction: (formData: FormData) => Promise<void>
}) {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('')
  const [issuingBody, setIssuingBody] = useState('')
  const [submitMode, setSubmitMode] = useState<'draft' | 'assign' | 'publish'>('draft')

  const selectedJurisdictionName = jurisdictions.find(j => j.id === selectedJurisdiction)?.name || ''

  // Filter clients to only those whose jurisdictions include the selected one
  const filteredClients = selectedJurisdiction
    ? clients.filter(c => c.jurisdiction_ids.includes(selectedJurisdiction))
    : clients

  function handleJurisdictionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const jId = e.target.value
    setSelectedJurisdiction(jId)
    const jName = jurisdictions.find(j => j.id === jId)?.name || ''
    setIssuingBody(JURISDICTION_BODIES[jName] || '')
  }

  return (
    <form action={uploadAction} className="space-y-6">
      <input type="hidden" name="submitMode" value={submitMode} />

      {/* Row 1: Title + Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium">
            Document Title <span className="text-accent">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. CBK Circular on Mobile Money Licensing"
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="referenceNumber" className="text-sm font-medium">Reference Number</label>
          <input
            id="referenceNumber"
            name="referenceNumber"
            placeholder="e.g. CBK/PG/82 or Gazette Vol. CXXV No. 45"
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Row 2: Type + Jurisdiction + Regulatory Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="docType" className="text-sm font-medium">
            Document Type <span className="text-accent">*</span>
          </label>
          <select
            id="docType"
            name="docType"
            required
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          >
            <option value="">Select type...</option>
            {Object.entries(DOC_TYPES).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="jurisdictionId" className="text-sm font-medium">
            Jurisdiction <span className="text-accent">*</span>
          </label>
          <select
            id="jurisdictionId"
            name="jurisdictionId"
            required
            value={selectedJurisdiction}
            onChange={handleJurisdictionChange}
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          >
            <option value="">Select jurisdiction...</option>
            {jurisdictions.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="issuingBody" className="text-sm font-medium">Regulatory Body</label>
          <input
            id="issuingBody"
            name="issuingBody"
            value={issuingBody}
            onChange={e => setIssuingBody(e.target.value)}
            placeholder="Auto-fills from jurisdiction"
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-cream/30"
          />
        </div>
      </div>

      {/* Row 3: Effective Date + Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="effectiveDate" className="text-sm font-medium">Issue / Effective Date</label>
          <input
            id="effectiveDate"
            name="effectiveDate"
            type="date"
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <input
            id="description"
            name="description"
            placeholder="Brief description of the document's scope and purpose"
            className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Row 4: Lawyer's Summary */}
      <div className="flex flex-col gap-1">
        <label htmlFor="summary" className="text-sm font-medium">Lawyer&apos;s Summary</label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          placeholder="Key takeaways, compliance implications, or action items for the client. Visible to the client alongside the document."
          className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </div>

      {/* Row 5: Internal Notes */}
      <div className="flex flex-col gap-1">
        <label htmlFor="internalNotes" className="text-sm font-medium">
          Internal Notes <span className="text-xs text-primary/50 font-normal">(never visible to clients)</span>
        </label>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={2}
          placeholder="Notes for the legal team only — review flags, follow-up items, context..."
          className="px-3 py-2 border border-black/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y bg-yellow-50/30"
        />
      </div>

      {/* Row 6: Client Assignment (filtered by jurisdiction) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Assign to Clients
          {selectedJurisdictionName && (
            <span className="text-xs text-primary/50 font-normal ml-2">
              Showing clients with {selectedJurisdictionName} jurisdiction
            </span>
          )}
        </label>
        {filteredClients.length === 0 ? (
          <p className="text-sm text-primary/50 py-2">
            {selectedJurisdiction
              ? `No clients with ${selectedJurisdictionName} jurisdiction. Onboard one first.`
              : 'Select a jurisdiction to see matching clients.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredClients.map(c => (
              <label key={c.id} className="flex items-center gap-2 text-sm p-2 border border-black/5 rounded hover:bg-white cursor-pointer">
                <input type="checkbox" name="clientIds" value={c.id} className="rounded" />
                <span>
                  {c.first_name} {c.last_name}
                  {c.company_name && <span className="text-primary/50"> ({c.company_name})</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Row 7: File + Submit buttons */}
      <div className="border-t border-black/10 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="file" className="text-sm font-medium">
              PDF File <span className="text-accent">*</span>
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              required
              className="px-3 py-2 border border-black/10 rounded-md text-sm file:mr-3 file:px-3 file:py-1 file:border-0 file:bg-primary/10 file:text-primary file:rounded file:text-xs file:font-medium"
            />
            <p className="text-xs text-primary/50 mt-1">Max 50MB. PDF files only.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="submit"
              onClick={() => setSubmitMode('draft')}
              className="px-5 py-2.5 bg-white text-primary border border-black/15 rounded-md text-sm font-medium hover:bg-cream transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={() => setSubmitMode('assign')}
              className="px-5 py-2.5 bg-primary/80 text-white rounded-md text-sm font-medium hover:bg-primary/70 transition-colors"
            >
              Upload & Assign
            </button>
            <button
              type="submit"
              onClick={() => setSubmitMode('publish')}
              className="px-5 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upload, Assign & Publish
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
