import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/actions/workouts'
import { getUserSettings } from '@/actions/settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PreferencesCard } from '@/components/settings/preferences-card'

export default async function SettingsPage() {
  const user = await currentUser()
  const role = await getCurrentUserRole()
  const settings = await getUserSettings()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '—'

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>Settings</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage your account and preferences.
        </p>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl border-border'>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='text-sm text-muted-foreground'>Signed in as</p>
            <p className='font-medium text-foreground'>{name}</p>
            <p className='text-sm text-muted-foreground'>{email}</p>
            <p className='text-xs text-muted-foreground'>Role: {role}</p>
            <Button variant='outline' size='sm' className='mt-2 rounded-xl' asChild>
              <Link href='/account'>Manage account</Link>
            </Button>
          </CardContent>
        </Card>

        <PreferencesCard settings={settings} />
      </div>

      <Card className='rounded-2xl border-border'>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            {role === 'coach'
              ? 'Subscriptions and client limits will appear here once billing is enabled.'
              : 'Billing is handled by your coach.'}
          </p>
          <Button variant='outline' size='sm' className='mt-3 rounded-xl' disabled>
            Coming soon
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
