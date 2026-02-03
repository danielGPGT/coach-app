import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    return await handleWebhook(req)
  } catch (err) {
    console.error('[Clerk webhook] Unhandled error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}

async function handleWebhook(req: Request): Promise<Response> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.warn('CLERK_WEBHOOK_SECRET is not set – skipping webhook verification')
    return new Response('Webhook secret not configured', { status: 501 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent
  } catch (err) {
    console.error('[Clerk webhook] Verification failed:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      '[Clerk webhook] SUPABASE_SERVICE_ROLE_KEY is not set – cannot sync user to Supabase. Add it to .env.local.'
    )
    return new Response('Supabase not configured for webhook', { status: 503 })
  }

  const supabase = createAdminClient()

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses?.[0]?.email_address ?? `${id}@clerk.placeholder`
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || 'User'

    const { error } = await supabase.from('users').insert({
      id,
      email,
      name,
      role: 'coach',
    })

    if (error) {
      console.error('[Clerk webhook] Error creating user in Supabase:', error)
      return new Response('Error creating user', { status: 500 })
    }
    console.info('[Clerk webhook] user.created synced to Supabase:', id, email)
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const { error } = await supabase
      .from('users')
      .update({
        email: email_addresses[0]?.email_address,
        name: `${first_name ?? ''} ${last_name ?? ''}`.trim() || 'User'
      })
      .eq('id', id)

    if (error) {
      console.error('[Clerk webhook] Error updating user in Supabase:', error)
      return new Response('Error updating user', { status: 500 })
    }
    console.info('[Clerk webhook] user.updated synced to Supabase:', id)
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data

    if (id) {
      const { error } = await supabase.from('users').delete().eq('id', id)

      if (error) {
        console.error('[Clerk webhook] Error deleting user from Supabase:', error)
        return new Response('Error deleting user', { status: 500 })
      }
      console.info('[Clerk webhook] user.deleted removed from Supabase:', id)
    }
  }

  return new Response('OK', { status: 200 })
}

