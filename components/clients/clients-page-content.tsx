'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InviteClientDialog } from './invite-client-dialog'
import { ClientCard } from './client-card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { UsersIcon, PlusIcon, UserPlusIcon } from 'lucide-react'
import { seedDemoClient } from '@/actions/clients'
import { toast } from 'sonner'
import type { ClientRow } from '@/actions/clients'

type ClientsPageContentProps = {
  clients: ClientRow[]
  /** Open the invite dialog on mount (e.g. when navigating from "Invite client" in nav). */
  openInviteOnMount?: boolean
}

export function ClientsPageContent({ clients, openInviteOnMount }: ClientsPageContentProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (openInviteOnMount) setDialogOpen(true)
  }, [openInviteOnMount])

  async function handleSeedDemo() {
    setSeeding(true)
    try {
      const { ok, error } = await seedDemoClient()
      if (ok) {
        toast.success('Demo client added')
        router.refresh()
      } else {
        toast.error(error ?? 'Could not add demo client')
      }
    } finally {
      setSeeding(false)
    }
  }

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Clients
          </h1>
          <p className='mt-1 text-muted-foreground'>
            Invite clients and assign programs. They’ll show up here once they accept your invite.
          </p>
        </div>
        <InviteClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      {clients.length === 0 ? (
        <Empty className='rounded-2xl border-border bg-muted/50'>
          <EmptyHeader>
            <EmptyMedia variant='icon' className='rounded-xl bg-card'>
              <UsersIcon className='size-6 text-muted-foreground' />
            </EmptyMedia>
            <EmptyTitle>No clients yet</EmptyTitle>
            <EmptyDescription>
              Invite clients by email. They’ll get a link to sign up or log in and join your list.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className='flex flex-col items-center gap-3 sm:flex-row'>
            <Button
              onClick={() => setDialogOpen(true)}
              className='rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90'
            >
              <PlusIcon className='size-4' />
              Invite your first client
            </Button>
            <Button
              variant='outline'
              onClick={handleSeedDemo}
              disabled={seeding}
              className='rounded-xl border-border'
            >
              <UserPlusIcon className='size-4' />
              {seeding ? 'Adding…' : 'Add demo client'}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <p className='text-sm text-muted-foreground'>
            {clients.length} client{clients.length === 1 ? '' : 's'}
          </p>
          <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {clients.map((client) => (
              <li key={client.id}>
                <ClientCard client={client} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
