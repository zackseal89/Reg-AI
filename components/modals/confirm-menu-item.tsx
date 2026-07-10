'use client'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
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

interface ConfirmMenuItemProps {
  /** Text shown on the dropdown menu item that opens the confirm dialog. */
  itemLabel: string
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  hiddenFields?: Record<string, string>
  action: (formData: FormData) => Promise<void>
}

/**
 * A dropdown menu item that opens a confirmation dialog.
 *
 * This exists so the `onSelect` handler stays inside a Client Component —
 * a Server Component cannot pass a function-bearing element across the
 * server/client boundary (which is what breaks when a raw `<DropdownMenuItem
 * onSelect={…}>` is handed to `<ConfirmModal trigger={…}>` from a page).
 */
export function ConfirmMenuItem({
  itemLabel,
  title,
  description,
  confirmLabel,
  destructive = false,
  hiddenFields = {},
  action,
}: ConfirmMenuItemProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          destructive={destructive}
          onSelect={e => e.preventDefault()}
        >
          {itemLabel}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent size="sm">
        <form action={action}>
          {Object.entries(hiddenFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogBody />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant={destructive ? 'destructive' : 'primary'}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
