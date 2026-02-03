'use client'

import {
  UserIcon,
  SettingsIcon,
  CreditCardIcon,
  UsersIcon,
  SquarePenIcon,
  CirclePlusIcon,
  LogOutIcon
} from 'lucide-react'
import Link from 'next/link'
import { useClerk, useUser } from '@clerk/nextjs'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type AppShellProfileProps = {
  user?: { name: string; email: string; imageUrl?: string }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function AppShellProfile({ user: userProp }: AppShellProfileProps) {
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()

  const name = userProp?.name ?? clerkUser?.firstName ?? 'User'
  const email = userProp?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? ''
  const imageUrl = userProp?.imageUrl ?? clerkUser?.imageUrl
  const initials = getInitials(name)

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-full p-0'>
          <Avatar className='size-9.5 rounded-md'>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align='end'>
        <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
          <div className='relative'>
            <Avatar className='size-10'>
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-success ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <span className='text-foreground text-lg font-semibold'>{name}</span>
            <span className='text-muted-foreground text-base'>{email || 'No email'}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-4 py-2.5 text-base' asChild>
            <Link href='/dashboard'>
              <UserIcon className='text-foreground size-5' />
              <span>My account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <SettingsIcon className='text-foreground size-5' />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <CreditCardIcon className='text-foreground size-5' />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <UsersIcon className='text-foreground size-5' />
            <span>Manage team</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <SquarePenIcon className='text-foreground size-5' />
            <span>Customization</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <CirclePlusIcon className='text-foreground size-5' />
            <span>Add team account</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant='destructive'
          className='px-4 py-2.5 text-base cursor-pointer'
          onSelect={e => {
            e.preventDefault()
            handleSignOut()
          }}
        >
          <LogOutIcon className='size-5' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
