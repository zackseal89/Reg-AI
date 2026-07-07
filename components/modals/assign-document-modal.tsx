'use client'

import { useState } from 'react'
import { UserCheck } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'

type Client = {
  id: string
  first_name: string
  last_name: string
  company_name: string | null
}

interface AssignDocumentModalProps {
  documentId: string
  documentTitle: string
  label?: string
  clients: Client[]
  action: (formData: FormData) => Promise<void>
}

export function AssignDocumentModal({
  documentId,
  documentTitle,
  label = 'Assign',
  clients,
  action,
}: AssignDocumentModalProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="subtle" size="sm">
          <UserCheck className="w-3.5 h-3.5" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <form action={action}>
          <input type="hidden" name="documentId" value={documentId} />
          <DialogHeader>
            <DialogTitle>Assign document</DialogTitle>
            <DialogDescription>{documentTitle}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {clients.length === 0 ? (
                <p className="text-body-sm text-ink-muted col-span-full py-4 text-center bg-surface-low/60 rounded-lg">
                  No clients yet. Onboard one first.
                </p>
              ) : (
                clients.map(c => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 p-3 border border-hairline rounded-lg hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <Checkbox name="clientIds" value={c.id} />
                    <span className="text-body-sm font-medium text-primary group-hover:text-accent transition-colors">
                      {c.first_name} {c.last_name}
                      {c.company_name && (
                        <span className="text-ink-muted text-caption block font-normal">
                          {c.company_name}
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Assign & Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
