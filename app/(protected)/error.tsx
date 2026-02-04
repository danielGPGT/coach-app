'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Error boundary for protected routes (dashboard, clients, etc.).
 * Catches errors in layout + page Server Components.
 * Use error.digest in production logs to find the actual error.
 */
export default function ProtectedError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Protected Route Error]', error.message, error.digest ? `digest=${error.digest}` : '')
  }, [error])

  return (
    <div className='flex min-h-dvh flex-col items-center justify-center p-6'>
      <Card className='w-full max-w-md border-destructive/50'>
        <CardContent className='pt-6'>
          <h1 className='text-xl font-semibold text-foreground'>Something went wrong</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            We couldn&apos;t load this page. This may be due to a configuration issue or
            temporary service unavailability.
          </p>
          {error.digest && (
            <p className='mt-3 font-mono text-xs text-muted-foreground'>
              Error ID: {error.digest}
            </p>
          )}
          <p className='mt-3 text-xs text-muted-foreground'>
            Check your production logs (e.g. Vercel Function Logs) for this digest. Common
            causes: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL, or your
            user not yet synced from Clerk to Supabase.
          </p>
          <div className='mt-6 flex flex-col gap-2 sm:flex-row'>
            <Button onClick={reset}>Try again</Button>
            <Button variant='outline' asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </Button>
            <Button variant='ghost' asChild>
              <Link href='/login'>Sign out and log in again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
