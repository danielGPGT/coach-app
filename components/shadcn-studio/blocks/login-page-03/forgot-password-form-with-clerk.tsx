'use client'

/**
 * Forgot password flow per Clerk docs:
 * https://clerk.com/docs/custom-flows/forgot-password
 *
 * 1. User enters email → signIn.create({ strategy: 'reset_password_email_code', identifier: email })
 * 2. User enters code + new password → signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code, password })
 * 3. On complete, set active session and redirect
 */
import { useState } from 'react'
import Link from 'next/link'
import { useSignIn, useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getClerkErrorMessage,
  formatLockoutMessage,
  isUserLockedError
} from '@/lib/auth/clerk-errors'

export default function ForgotPasswordFormWithClerk() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [secondFactor, setSecondFactor] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  if (authLoaded && isSignedIn) {
    router.push(redirectUrl)
    return null
  }

  if (!isLoaded) return null

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn) return
    setError('')
    setLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim()
      })
      setSuccessfulCreation(true)
      setError('')
    } catch (err) {
      if (isUserLockedError(err)) {
        setError(formatLockoutMessage(err))
      } else {
        setError(getClerkErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !setActive) return
    setError('')
    setLoading(true)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password
      })

      if (result.status === 'needs_second_factor') {
        setSecondFactor(true)
        setError('')
      } else if (result.status === 'complete') {
        await setActive({
          session: result.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Session tasks (e.g. reset password required) - let Clerk handle
              return
            }
            router.push(redirectUrl)
            router.refresh()
          }
        })
        router.push(redirectUrl)
        router.refresh()
        setError('')
      } else {
        setError(`Could not complete reset (${result.status}). Please try again.`)
      }
    } catch (err) {
      if (isUserLockedError(err)) {
        setError(formatLockoutMessage(err))
      } else {
        setError(getClerkErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  if (secondFactor) {
    return (
      <div className='space-y-4'>
        <p className='text-destructive text-sm' role='alert'>
          Two-factor authentication is required. Please sign in with your primary method, then
          complete 2FA to reset your password.
        </p>
        <Button variant='outline' asChild className='w-full'>
          <Link href='/login'>Back to sign in</Link>
        </Button>
      </div>
    )
  }

  if (successfulCreation) {
    return (
      <>
        <p className='text-muted-foreground text-sm'>
          We sent a password reset code to <strong>{email}</strong>. Enter the code and your new
          password below.
        </p>
        <form className='space-y-4' onSubmit={handleResetPassword}>
          <div className='space-y-1'>
            <Label htmlFor='code'>Verification code</Label>
            <Input
              id='code'
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder='000000'
              autoComplete='one-time-code'
              required
              disabled={!isLoaded}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='newPassword'>New password</Label>
            <div className='relative'>
              <Input
                id='newPassword'
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='••••••••••••••••'
                className='pr-9'
                required
                minLength={8}
                disabled={!isLoaded}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setPasswordVisible(prev => !prev)}
                className='absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
              >
                {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{passwordVisible ? 'Hide' : 'Show'} password</span>
              </Button>
            </div>
            <p className='text-muted-foreground text-xs'>Must be at least 8 characters.</p>
          </div>
          {error && (
            <p className='text-destructive text-sm' role='alert'>
              {error}
            </p>
          )}
          <Button className='w-full' type='submit' disabled={loading || !isLoaded}>
            {loading ? 'Resetting password...' : 'Reset password'}
          </Button>
        </form>
        <p className='text-muted-foreground text-center text-sm'>
          <button
            type='button'
            className='text-foreground hover:underline'
            onClick={() => {
              setSuccessfulCreation(false)
              setCode('')
              setPassword('')
              setError('')
            }}
          >
            Use a different email
          </button>
        </p>
      </>
    )
  }

  return (
    <>
      <p className='text-muted-foreground text-sm'>
        Enter your email address and we&apos;ll send you a code to reset your password.
      </p>
      <form className='space-y-4' onSubmit={handleSendCode}>
        <div className='space-y-1'>
          <Label htmlFor='email'>Email address</Label>
          <Input
            id='email'
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!isLoaded}
          />
        </div>
        {error && (
          <p className='text-destructive text-sm' role='alert'>
            {error}
          </p>
        )}
        <Button className='w-full' type='submit' disabled={loading || !isLoaded}>
          {loading ? 'Sending code...' : 'Send reset code'}
        </Button>
      </form>
      <p className='text-center text-sm'>
        <Link href='/login' className='text-foreground hover:underline'>
          Back to sign in
        </Link>
      </p>
    </>
  )
}
