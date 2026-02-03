'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  useAuth,
  useUser,
  useClerk,
} from '@clerk/nextjs'
import { z } from 'zod'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const nameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function AccountPage() {
  const { user } = useUser()
  const { isLoaded } = useAuth()
  const clerk = useClerk()
  const [isSavingName, startNameTransition] = useTransition()
  const [isSavingEmail, startEmailTransition] = useTransition()
  const [isSavingPassword, startPasswordTransition] = useTransition()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailNeedsVerification, setEmailNeedsVerification] = useState(false)
  const [newEmailId, setNewEmailId] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setEmail(user.primaryEmailAddress?.emailAddress ?? '')
  }, [user])

  const fullName = useMemo(() => {
    const parts = [firstName, lastName].filter(Boolean)
    return parts.length ? parts.join(' ') : '—'
  }, [firstName, lastName])

  const handleNameSave = () => {
    const parsed = nameSchema.safeParse({ firstName, lastName })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid name')
      return
    }

    startNameTransition(async () => {
      try {
        await user?.update({ firstName, lastName })
        toast.success('Name updated')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update name')
      }
    })
  }

  const handleEmailSave = () => {
    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid email')
      return
    }

    startEmailTransition(async () => {
      try {
        if (!user) return
        const newEmail = await user.createEmailAddress({ email })
        setNewEmailId(newEmail.id)
        await newEmail.prepareVerification({ strategy: 'email_code' })
        setEmailNeedsVerification(true)
        toast.success('Verification code sent')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update email')
      }
    })
  }

  const handleEmailVerify = () => {
    if (!emailCode || !newEmailId) {
      toast.error('Enter the verification code')
      return
    }

    startEmailTransition(async () => {
      try {
        const emailAddress = user?.emailAddresses?.find((e) => e.id === newEmailId)
        if (!emailAddress) throw new Error('Email address not found')
        const res = await emailAddress.attemptVerification({ code: emailCode })
        if (res.verification.status === 'verified') {
          await user?.update({ primaryEmailAddressId: emailAddress.id })
          setEmailNeedsVerification(false)
          setEmailCode('')
          toast.success('Email verified and updated')
        } else {
          toast.error('Verification failed. Check the code and try again.')
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Verification failed')
      }
    })
  }

  const handlePasswordSave = () => {
    const parsed = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid password')
      return
    }

    startPasswordTransition(async () => {
      try {
        await user?.updatePassword({
          currentPassword,
          newPassword,
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success('Password updated')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update password')
      }
    })
  }

  if (!isLoaded) {
    return null
  }

  return (
    <div className='space-y-8'>
      <Button variant='ghost' size='sm' className='-ml-2 text-muted-foreground' asChild>
        <Link href='/settings'>&larr; Back to settings</Link>
      </Button>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>Account</h1>
        <p className='mt-1 text-muted-foreground'>
          Manage your profile, email, and password.
        </p>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='rounded-2xl border-border'>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='firstName'>First name</Label>
              <Input id='firstName' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor='lastName'>Last name</Label>
              <Input id='lastName' value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <p className='text-sm text-muted-foreground'>Full name: {fullName}</p>
            <Button className='rounded-xl' onClick={handleNameSave} disabled={isSavingName}>
              {isSavingName ? 'Saving…' : 'Save profile'}
            </Button>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border'>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='email'>Email address</Label>
              <Input id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className='mt-1 text-xs text-muted-foreground'>
                Changing email requires verification.
              </p>
            </div>

            <Button variant='outline' className='rounded-xl' onClick={handleEmailSave} disabled={isSavingEmail}>
              {isSavingEmail ? 'Sending…' : 'Send verification code'}
            </Button>

            {emailNeedsVerification && (
              <>
                <Separator />
                <div>
                  <Label htmlFor='emailCode'>Verification code</Label>
                  <Input
                    id='emailCode'
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder='Enter the code from your inbox'
                  />
                </div>
                <Button className='rounded-xl' onClick={handleEmailVerify} disabled={isSavingEmail}>
                  {isSavingEmail ? 'Verifying…' : 'Verify & set as primary'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className='rounded-2xl border-border'>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='currentPassword'>Current password</Label>
            <Input
              id='currentPassword'
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='newPassword'>New password</Label>
            <Input
              id='newPassword'
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='confirmPassword'>Confirm new password</Label>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button className='rounded-xl' onClick={handlePasswordSave} disabled={isSavingPassword}>
            {isSavingPassword ? 'Updating…' : 'Update password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
