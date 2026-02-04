'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Root error boundary. Catches Server Component and other errors.
 * In production, the error message is sanitized; use error.digest to match in server logs.
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to your error reporting service (Sentry, etc.)
    console.error('[App Error]', error.message, error.digest ? `digest=${error.digest}` : '')
  }, [error])

  return (
    <div className='flex min-h-dvh flex-col items-center justify-center p-6'>
      <Card className='w-full max-w-md border-destructive/50'>
        <CardContent className='pt-6'>
          <h1 className='text-xl font-semibold text-foreground'>Something went wrong</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          {error.digest && (
            <p className='mt-3 font-mono text-xs text-muted-foreground'>
              Error ID: {error.digest}
            </p>
          )}
          <p className='mt-3 text-xs text-muted-foreground'>
            If this keeps happening, check your server logs for the digest above. In production,
            common causes include missing env vars (e.g. SUPABASE_SERVICE_ROLE_KEY,
            NEXT_PUBLIC_SUPABASE_URL) or Supabase/Clerk connectivity issues.
          </p>
          <div className='mt-6 flex flex-col gap-2 sm:flex-row'>
            <Button onClick={reset}>Try again</Button>
            <Button variant='outline' asChild>
              <Link href='/'>Go home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
