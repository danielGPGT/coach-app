import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoginFormWithClerk from '@/components/shadcn-studio/blocks/login-page-03/login-form-with-clerk'
import LogoSvg from '@/public/liftkit-logo-v5.svg'
import heroBackground from '@/assets/images/auth-hero.jpg'

export default function LoginPageClerk() {
  return (
    <div className='relative grid min-h-dvh overflow-hidden lg:grid-cols-[420px_1fr]'>
      <Image
        src={heroBackground}
        alt='LiftKit training'
        fill
        priority
        className='object-cover opacity-30'
      />
      <div className='absolute inset-0 bg-linear-to-br from-background via-background/70 to-background/90' />
      <aside className='relative hidden h-full flex-col justify-between border-r border-border bg-card p-8 lg:flex'>
        <div className='space-y-6'>
          <Image src={LogoSvg} alt='CoachUp' priority className='h-12 w-auto' />
          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold text-foreground'>Log in to CoachUp</h1>
            <p className='text-sm text-muted-foreground'>
              Keep programming simple. Track clients, workouts, and progress in one place.
            </p>
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>
          © {new Date().getFullYear()} CoachUp. Built for strength coaches.
        </p>
      </aside>

      <main className='relative flex h-full flex-col items-center justify-center p-6 sm:p-10'>
        <div className='w-full max-w-md space-y-8 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur'>
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-semibold text-foreground'>Welcome back</h2>
            <p className='text-sm text-muted-foreground'>
              Sign in to pick up right where you left off.
            </p>
          </div>
          <Suspense fallback={<div className='animate-pulse rounded-lg bg-muted/50 py-12' />}>
            <LoginFormWithClerk />
          </Suspense>
            <p className='text-center text-xs text-muted-foreground'>
            New to CoachUp?{' '}
            <Button variant='link' asChild className='h-auto p-0 text-xs font-semibold text-primary'>
              <Link href='/signup'>Create an account</Link>
            </Button>
          </p>
        </div>
        <Card className='mt-8 hidden w-full max-w-xl border-none bg-linear-to-r from-primary/10 via-transparent to-transparent p-6 lg:flex'>
          <CardContent className='flex flex-col gap-3'>
            <h3 className='text-sm font-semibold text-primary'>Elevate your coaching</h3>
            <p className='text-sm text-muted-foreground'>
              Build smarter programs, track compliance, and visualize progress without spreadsheets.
            </p>
            <p className='text-xs text-muted-foreground'>
              Join hundreds of coaches leveraging CoachUp to deliver world-class training experiences.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
