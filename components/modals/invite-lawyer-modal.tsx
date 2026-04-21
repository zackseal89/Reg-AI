'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
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
import { FormField } from '@/components/ui/form-field'

interface InviteLawyerModalProps {
  action: (formData: FormData) => Promise<void>
}

export function InviteLawyerModal({ action }: InviteLawyerModalProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Scale className="w-4 h-4" />
          Invite Lawyer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action}>
          <DialogHeader>
            <DialogTitle>Invite a lawyer</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an invitation at their MNL email to set a
              password.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" htmlFor="firstName" required>
                <Input id="firstName" name="firstName" required />
              </FormField>
              <FormField label="Last Name" htmlFor="lastName" required>
                <Input id="lastName" name="lastName" required />
              </FormField>
            </div>
            <FormField label="MNL Email" htmlFor="email" required>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@mnladvocates.com"
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send Invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
