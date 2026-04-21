'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form-field'

type Jurisdiction = { id: string; name: string }

interface CreateClientModalProps {
  jurisdictions: Jurisdiction[]
  action: (formData: FormData) => Promise<void>
}

export function CreateClientModal({
  jurisdictions,
  action,
}: CreateClientModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4" />
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <form action={action}>
          <DialogHeader>
            <DialogTitle>Onboard new client</DialogTitle>
            <DialogDescription>
              Create a client account. They&apos;ll receive an invitation email to
              set their password.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Company Name" htmlFor="companyName" required>
                <Input
                  id="companyName"
                  name="companyName"
                  required
                  placeholder="Acme Fintech Ltd."
                />
              </FormField>
              <FormField label="Sector" htmlFor="sector" required>
                <Input
                  id="sector"
                  name="sector"
                  required
                  placeholder="Fintech, Crypto, Payments…"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" htmlFor="firstName" required>
                <Input id="firstName" name="firstName" required />
              </FormField>
              <FormField label="Last Name" htmlFor="lastName" required>
                <Input id="lastName" name="lastName" required />
              </FormField>
            </div>

            <FormField label="Contact Email" htmlFor="email" required>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@company.com"
              />
            </FormField>

            <FormField
              label="Assigned Regulators"
              hint="Select all regulators relevant to this client. RLS uses this to scope all content."
            >
              <div className="flex flex-wrap gap-3 mt-1">
                {jurisdictions.map(j => (
                  <label
                    key={j.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 border border-primary/10 rounded-xl hover:bg-primary/5 cursor-pointer group transition-all"
                  >
                    <Checkbox name="jurisdictions" value={j.id} />
                    <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      {j.name}
                    </span>
                  </label>
                ))}
              </div>
            </FormField>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create Client Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
