import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getInvitationByToken, acceptInvitation } from '@/actions/clients'
import { getCurrentUserRole } from '@/actions/workouts'

type Props = { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const invitation = await getInvitationByToken(token)
  if (!invitation) notFound()

  const { userId } = await auth()
  if (userId) {
    await acceptInvitation(token)
    const role = await getCurrentUserRole()
    redirect(role === 'client' ? '/dashboard' : '/clients')
  }

  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-6 p-8'>
      <div className='w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm'>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>
          You&apos;re invited
        </h1>
        <p className='text-muted-foreground text-sm'>
          Your coach has invited you to join CoachUp. Sign up or log in to accept and get started.
        </p>
        <div className='flex flex-col gap-3'>
          <Link
            href={`/signup?redirect_url=${encodeURIComponent(`/invite/${token}`)}`}
            className='inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90'
          >
            Sign up to accept
          </Link>
          <Link
            href={`/login?redirect_url=${encodeURIComponent(`/invite/${token}`)}`}
            className='inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background font-medium text-foreground hover:bg-muted'
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  )
}
