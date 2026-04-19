'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export default function FlashToast() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const success = params.get('success')
  const error = params.get('error')

  useEffect(() => {
    if (!success && !error) return

    if (success) toast.success(success)
    if (error) toast.error(error)

    const next = new URLSearchParams(params.toString())
    next.delete('success')
    next.delete('error')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [success, error, params, pathname, router])

  return null
}
