'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form-field'

const DOC_TYPES: Record<string, string> = {
  circular: 'Circular',
  gazette_notice: 'Gazette Notice',
  regulation: 'Regulation',
  guideline: 'Guidance Note',
  policy: 'Policy Brief',
  other: 'Other',
}

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

interface UploadDocumentModalProps {
  jurisdictions: Jurisdiction[]
  clients: Client[]
  action: (formData: FormData) => Promise<void>
}

export function UploadDocumentModal({
  jurisdictions,
  clients,
  action,
}: UploadDocumentModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('')
  const [issuingBody, setIssuingBody] = useState('')
  const [submitMode, setSubmitMode] = useState<
    'draft' | 'assign' | 'publish'
  >('draft')

  const selectedJurisdictionName =
    jurisdictions.find(j => j.id === selectedJurisdiction)?.name || ''

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <form action={action}>
          <input type="hidden" name="submitMode" value={submitMode} />
          <DialogHeader>
            <DialogTitle>Upload regulatory document</DialogTitle>
            <DialogDescription>
              Fields marked <span className="text-accent">*</span> are required.
              Publishing indexes the document into the client&apos;s AI store.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Document Title" htmlFor="title" required>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. CBK Circular on Mobile Money"
                />
              </FormField>
              <FormField
                label="Reference Number"
                htmlFor="referenceNumber"
              >
                <Input
                  id="referenceNumber"
                  name="referenceNumber"
                  placeholder="e.g. CBK/PG/82"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Type" htmlFor="docType" required>
                <Select id="docType" name="docType" required>
                  <option value="">Select…</option>
                  {Object.entries(DOC_TYPES).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label="Jurisdiction"
                htmlFor="jurisdictionId"
                required
              >
                <Select
                  id="jurisdictionId"
                  name="jurisdictionId"
                  required
                  value={selectedJurisdiction}
                  onChange={handleJurisdictionChange}
                >
                  <option value="">Select…</option>
                  {jurisdictions.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Regulatory Body" htmlFor="issuingBody">
                <Input
                  id="issuingBody"
                  name="issuingBody"
                  value={issuingBody}
                  onChange={e => setIssuingBody(e.target.value)}
                  placeholder="Auto-fills"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Effective Date"
                htmlFor="effectiveDate"
              >
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                />
              </FormField>
              <FormField
                label="Description"
                htmlFor="description"
                className="md:col-span-2"
              >
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of scope and purpose"
                />
              </FormField>
            </div>

            <FormField label="Lawyer's Summary" htmlFor="summary">
              <Textarea
                id="summary"
                name="summary"
                rows={3}
                placeholder="Key takeaways, compliance implications, action items. Visible to the client."
              />
            </FormField>

            <FormField
              label="Internal Notes"
              htmlFor="internalNotes"
              hint="Never visible to clients."
            >
              <Textarea
                id="internalNotes"
                name="internalNotes"
                rows={2}
                placeholder="Review flags, follow-up items, context…"
                className="bg-yellow-50/30"
              />
            </FormField>

            <FormField
              label="Assign to Clients"
              hint={
                selectedJurisdictionName
                  ? `Showing clients with ${selectedJurisdictionName} jurisdiction.`
                  : 'Select a jurisdiction to see matching clients.'
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {filteredClients.length === 0 ? (
                  <p className="text-sm text-primary/50 col-span-full py-3">
                    {selectedJurisdiction
                      ? `No clients with ${selectedJurisdictionName}.`
                      : 'Pick a jurisdiction above.'}
                  </p>
                ) : (
                  filteredClients.map(c => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 p-3 border border-primary/10 rounded-xl hover:bg-primary/5 cursor-pointer group transition-all"
                    >
                      <Checkbox name="clientIds" value={c.id} />
                      <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                        {c.first_name} {c.last_name}
                        {c.company_name && (
                          <span className="text-primary/50 text-xs block font-normal">
                            {c.company_name}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </FormField>

            <FormField label="PDF File" htmlFor="file" required>
              <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,application/pdf"
                required
                className="w-full px-4 py-3 border border-primary/15 rounded-xl text-sm file:mr-3 file:px-3 file:py-1.5 file:border-0 file:bg-primary/5 file:text-primary file:rounded-md file:text-xs file:font-semibold file:cursor-pointer file:hover:bg-primary/10 bg-white"
              />
              <p className="text-xs text-primary/50 mt-1.5">
                Max 50 MB. PDF only.
              </p>
            </FormField>
          </DialogBody>

          <DialogFooter className="flex-wrap">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="subtle"
              onClick={() => setSubmitMode('draft')}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="accent"
              onClick={() => setSubmitMode('assign')}
            >
              Upload & Assign
            </Button>
            <Button
              type="submit"
              onClick={() => setSubmitMode('publish')}
            >
              Upload, Assign & Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
