import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/actions/workouts'
import { AppShell } from '@/components/app-shell'

/** Clerk: Server-Side Auth + role-based shell for protected routes */

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/login')
  }

  const user = await currentUser()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const role = await getCurrentUserRole()

  return (
    <AppShell
      role={role}
      user={{
        name,
        email,
        imageUrl: user?.imageUrl
      }}
    >
      {children}
    </AppShell>
  )
}
