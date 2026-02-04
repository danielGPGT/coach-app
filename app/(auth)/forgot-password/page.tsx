import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import ForgotPasswordFormWithClerk from '@/components/shadcn-studio/blocks/login-page-03/forgot-password-form-with-clerk'
import LogoSvg from '@/public/liftkit-logo-v5.svg'
import heroBackground from '@/assets/images/auth-hero.jpg'

export default function ForgotPasswordPage() {
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
            <h1 className='text-3xl font-semibold text-foreground'>Reset your password</h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email and we&apos;ll send you a code to set a new password.
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
            <h2 className='text-2xl font-semibold text-foreground'>Forgot password?</h2>
            <p className='text-sm text-muted-foreground'>
              No worries. Enter your email and we&apos;ll send you a reset code.
            </p>
          </div>
          <Suspense fallback={<div className='animate-pulse rounded-lg bg-muted/50 py-12' />}>
            <ForgotPasswordFormWithClerk />
          </Suspense>
          <p className='text-center text-xs text-muted-foreground'>
            Remember your password?{' '}
            <Link href='/login' className='text-foreground hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
