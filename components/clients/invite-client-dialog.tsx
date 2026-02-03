'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, CopyIcon, Loader2Icon, MailIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createInvitation } from '@/actions/clients'
import { toast } from 'sonner'

type InviteClientDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When true, no trigger button is rendered (e.g. on /clients/invite page). */
  hideTrigger?: boolean
}

export function InviteClientDialog({ open: controlledOpen, onOpenChange, hideTrigger }: InviteClientDialogProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setIsSubmitting(true)
    setInviteLink(null)
    setEmailSent(false)
    try {
      const { token, emailSent: sent } = await createInvitation(trimmed)
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      setInviteLink(`${base}/invite/${token}`)
      setEmailSent(sent)
      toast.success(sent ? `Invite sent to ${trimmed}` : 'Invite created — copy the link below to share')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCopy() {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose(open: boolean) {
    if (!open) {
      setInviteLink(null)
      setEmailSent(false)
      setEmail('')
    }
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button className='h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90'>
            <PlusIcon className='size-4' />
            Invite client
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='max-w-md gap-6 rounded-2xl border-border bg-card p-6 sm:p-8'>
        <DialogHeader>
          <DialogTitle className='text-left text-xl'>
            {inviteLink ? 'Share invite link' : 'Invite client'}
          </DialogTitle>
          <p className='text-left text-sm text-muted-foreground'>
            {inviteLink
              ? emailSent
                ? "We've sent the invite to their email. They can also use the link below if needed."
                : 'Copy and share this link with your client. When they sign up or log in, they’ll be added to your clients.'
              : 'Enter their email to generate a one-time invite link. We’ll send it to them if Resend is configured.'}
          </p>
        </DialogHeader>
        {!inviteLink ? (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='invite-email' className='text-foreground'>
                Email address
              </Label>
              <div className='relative'>
                <MailIcon className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
                <Input
                  id='invite-email'
                  type='email'
                  placeholder='client@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='h-11 rounded-xl border-border pl-10'
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleClose(false)}
                className='rounded-xl'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className='size-4 animate-spin' />
                    Creating…
                  </>
                ) : (
                  'Create invite link'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className='space-y-4'>
            <div className='rounded-xl border border-border bg-muted/50 p-3'>
              <p className='break-all text-sm text-foreground'>{inviteLink}</p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                onClick={handleCopy}
                variant='outline'
                className='rounded-xl'
              >
                {copied ? (
                  <CheckIcon className='size-4 text-primary' />
                ) : (
                  <CopyIcon className='size-4' />
                )}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button
                type='button'
                onClick={() => handleClose(false)}
                className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
