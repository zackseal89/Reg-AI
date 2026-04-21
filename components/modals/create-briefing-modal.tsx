'use client'

import { useState } from 'react'
import { FilePen } from 'lucide-react'
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

type Jurisdiction = { id: string; name: string }
type Client = {
  id: string
  first_name: string
  last_name: string
  company_name: string | null
}

interface CreateBriefingModalProps {
  jurisdictions: Jurisdiction[]
  clients: Client[]
  action: (formData: FormData) => Promise<void>
}

export function CreateBriefingModal({
  jurisdictions,
  clients,
  action,
}: CreateBriefingModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FilePen className="w-4 h-4" />
          New Briefing
        </Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <form action={action}>
          <DialogHeader>
            <DialogTitle>Draft a new briefing</DialogTitle>
            <DialogDescription>
              Briefings are saved as drafts. They require approval before being
              sent to clients.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
              <FormField label="Title" htmlFor="title" required>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. CBK Circular on Mobile Money Licensing"
                />
              </FormField>
              <FormField
                label="Jurisdiction"
                htmlFor="jurisdictionId"
                required
              >
                <Select id="jurisdictionId" name="jurisdictionId" required>
                  <option value="">Select…</option>
                  {jurisdictions.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Content" htmlFor="content" required>
              <Textarea
                id="content"
                name="content"
                required
                rows={10}
                placeholder="Write the regulatory briefing content here…"
              />
            </FormField>

            <FormField
              label="Assign to Clients"
              hint="Clients selected here will receive this briefing once approved and sent."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
                {clients.length === 0 ? (
                  <p className="text-sm text-primary/50 col-span-full py-4 text-center bg-primary/5 rounded-xl">
                    No clients yet. Onboard one first.
                  </p>
                ) : (
                  clients.map(c => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 p-3 border border-primary/10 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group"
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
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save as Draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
