/**
 * Clerk error handling utilities per Clerk docs:
 * https://clerk.com/docs/guides/development/custom-flows/error-handling
 */
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import type { ClerkAPIError } from '@clerk/types'

/** Get user-friendly error message from Clerk errors. Prefer longMessage when available. */
export function getClerkErrorMessage(err: unknown): string {
  if (isClerkAPIResponseError(err) && err.errors?.length) {
    const first = err.errors[0] as ClerkAPIError
    return first.longMessage ?? first.message ?? 'Something went wrong. Please try again.'
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

/** Get all Clerk API errors (for displaying multiple validation errors). */
export function getClerkErrors(err: unknown): ClerkAPIError[] | undefined {
  if (isClerkAPIResponseError(err) && err.errors?.length) {
    return err.errors as ClerkAPIError[]
  }
  return undefined
}

/** Check if error is user_locked (account lockout). */
export function isUserLockedError(err: unknown): boolean {
  if (isClerkAPIResponseError(err) && err.errors?.length) {
    return (err.errors[0] as ClerkAPIError).code === 'user_locked'
  }
  return false
}

/** Check if error is form_password_compromised (password marked compromised). */
export function isPasswordCompromisedError(err: unknown): boolean {
  if (isClerkAPIResponseError(err) && err.errors?.length) {
    return (err.errors[0] as ClerkAPIError).code === 'form_password_compromised'
  }
  return false
}

/** Get lockout expiry in seconds from user_locked error meta. */
export function getLockoutExpiresInSeconds(err: unknown): number | undefined {
  if (isClerkAPIResponseError(err) && err.errors?.length) {
    const meta = (err.errors[0] as ClerkAPIError & { meta?: { lockout_expires_in_seconds?: number } }).meta
    return meta?.lockout_expires_in_seconds
  }
  return undefined
}

/** Format lockout message with retry time. */
export function formatLockoutMessage(err: unknown): string {
  const seconds = getLockoutExpiresInSeconds(err)
  if (seconds != null) {
    const date = new Date()
    date.setSeconds(date.getSeconds() + seconds)
    return `Your account is locked. You can try again at ${date.toLocaleTimeString()}. For more information, contact support.`
  }
  return 'Your account is locked. Please try again later or contact support.'
}
