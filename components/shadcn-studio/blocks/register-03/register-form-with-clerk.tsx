'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSignUp } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

/** Clerk custom sign-up with email verification and proper error handling per Clerk docs */

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getClerkErrorMessage,
  formatLockoutMessage,
  isUserLockedError
} from '@/lib/auth/clerk-errors'

export default function RegisterFormWithClerk() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') ?? '/dashboard'
  const [isVisible, setIsVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    if (!agreed) {
      setError('Please agree to the terms and privacy policy.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const [firstName, ...lastParts] = name.trim().split(/\s+/)
      const lastName = lastParts.join(' ') || ''

      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })

      if (signUp.status === 'complete') {
        await setActive({ session: signUp.createdSessionId })
        router.push(redirectUrl)
        router.refresh()
        return
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp || !code.trim()) return
    setError('')
    setLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push(redirectUrl)
        router.refresh()
      } else {
        setError('Verification could not be completed.')
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

  if (pendingVerification) {
    return (
      <>
        <p className='text-muted-foreground text-sm'>
          We sent a verification code to <strong>{email}</strong>. Enter it below.
        </p>
        <form className='space-y-4' onSubmit={handleVerify}>
          <div className='space-y-1'>
            <Label className='leading-5' htmlFor='code'>
              Verification code
            </Label>
            <Input
              id='code'
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder='000000'
              disabled={!isLoaded}
              autoComplete='one-time-code'
            />
          </div>
          {error && (
            <p className='text-destructive text-sm' role='alert'>
              {error}
            </p>
          )}
          <Button className='w-full' type='submit' disabled={loading || !isLoaded}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
        <p className='text-muted-foreground text-center text-sm'>
          <button
            type='button'
            className='text-foreground hover:underline'
            onClick={() => setPendingVerification(false)}
          >
            Use a different email
          </button>
        </p>
      </>
    )
  }

  return (
    <>
      <form className='space-y-4' onSubmit={handleSubmit}>
        <div className='space-y-1'>
          <Label className='leading-5' htmlFor='username'>
            Name*
          </Label>
          <Input
            type='text'
            id='username'
            placeholder='Enter your name'
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={!isLoaded}
          />
        </div>

        <div className='space-y-1'>
          <Label className='leading-5' htmlFor='userEmail'>
            Email address*
          </Label>
          <Input
            type='email'
            id='userEmail'
            placeholder='Enter your email address'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!isLoaded}
          />
        </div>

        <div className='w-full space-y-1'>
          <Label className='leading-5' htmlFor='password'>
            Password*
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={isVisible ? 'text' : 'password'}
              placeholder='••••••••••••••••'
              className='pr-9'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={!isLoaded}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => setIsVisible(prev => !prev)}
              className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
            >
              {isVisible ? <EyeOffIcon /> : <EyeIcon />}
              <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Checkbox
            id='terms'
            className='size-6'
            checked={agreed}
            onCheckedChange={v => setAgreed(v === true)}
          />
          <Label htmlFor='terms' className='text-muted-foreground'>
            I agree to all Term, privacy Policy and Fees
          </Label>
        </div>

        {error && (
          <p className='text-destructive text-sm' role='alert'>
            {error}
          </p>
        )}

        <Button className='w-full' type='submit' disabled={loading || !isLoaded}>
          {loading ? 'Creating account...' : 'Sign up to CoachUp'}
        </Button>
      </form>

      <p className='text-muted-foreground'>
        Already have an account?{' '}
        <Link href='/login' className='text-foreground hover:underline'>
          Log in
        </Link>
      </p>
    </>
  )
}
