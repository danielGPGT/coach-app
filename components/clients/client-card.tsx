'use client'

import Link from 'next/link'
import { MailIcon, UserIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ClientRow } from '@/actions/clients'

type ClientCardProps = {
  client: ClientRow
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-border bg-card shadow-sm transition-shadow hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      )}
    >
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-start gap-3 h-ful'>
          <Link
            href={`/clients/${client.id}`}
            className='flex min-w-0 flex-1 items-start gap-4'
          >
            <Avatar className='size-12 shrink-0 rounded-xl border border-border'>
              <AvatarImage src={client.image_url ?? undefined} />
              <AvatarFallback className='rounded-xl bg-accent text-primary text-sm font-medium'>
                {initials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='font-medium text-foreground'>{client.name}</p>
              <p className='mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground'>
                <MailIcon className='size-3.5 shrink-0' />
                {client.email}
              </p>
            </div>
          </Link>
          <div className='flex justify-end h-full items-center'>
          <Link
            href={`/clients/${client.id}`}
            className='inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            View
            <span aria-hidden>→</span>
          </Link>
        </div>
        </div>

      </CardContent>
    </Card>
  )
}
