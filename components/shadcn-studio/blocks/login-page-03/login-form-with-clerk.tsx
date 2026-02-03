'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSignIn } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

/** Clerk MCP: useSignIn – custom sign-in with identifier/password and OAuth redirect */

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginFormWithClerk() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') ?? '/dashboard'
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setError('')
    setLoading(true)
    try {
      const result = await signIn.create({
        identifier: email,
        password
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push(redirectUrl)
        router.refresh()
      } else {
        const statusMessage =
          result.status === 'needs_second_factor'
            ? 'Please complete two-factor authentication.'
            : result.status === 'needs_first_factor'
              ? 'Additional verification may be required. Try again or use "Forgot password" to reset.'
              : `Sign-in could not be completed (${result.status}). Please try again.`
        setError(statusMessage)
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array< { message?: string; code?: string }> }
      const msg = clerkErr?.errors?.[0]?.message
      const code = clerkErr?.errors?.[0]?.code
      if (msg) setError(msg)
      else if (code === 'form_identifier_not_found') setError('No account found with this email. Sign up first or check the address.')
      else if (code === 'form_password_incorrect') setError('Incorrect password. Try again or use "Forgot password".')
      else setError('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form className='space-y-4' onSubmit={handleSubmit}>
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

        <div className='flex items-center justify-between gap-y-2'>
          <div className='flex items-center gap-3'>
            <Checkbox
              id='rememberMe'
              className='size-6'
              checked={rememberMe}
              onCheckedChange={v => setRememberMe(v === true)}
            />
            <Label htmlFor='rememberMe' className='text-muted-foreground'>
              Remember Me
            </Label>
          </div>
            <Link href='/signup' className='hover:underline'>
              Forgot Password?
            </Link>
        </div>

        {error && (
          <p className='text-destructive text-sm' role='alert'>
            {error}
          </p>
        )}

        <Button className='w-full' type='submit' disabled={loading || !isLoaded}>
          {loading ? 'Signing in...' : 'Sign in to CoachUp'}
        </Button>
      </form>

      <p className='text-muted-foreground text-center'>
        New on our platform?{' '}
        <Link href='/signup' className='text-foreground hover:underline'>
          Create an account
        </Link>
      </p>
    </>
  )
}
