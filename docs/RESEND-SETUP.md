# Resend setup (client invite emails)

Invite emails are sent via [Resend](https://resend.com) when you create a client invite.

## 1. Get an API key

1. Sign up at [resend.com](https://resend.com).
2. Go to **API Keys** and create a key.
3. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## 2. Sender address (optional)

Default sender is `LiftKit <onboarding@resend.dev>` (Resend’s sandbox; deliveries only to the email you signed up with).

For production, verify your domain in Resend and set:

```env
RESEND_FROM=LiftKit <invites@yourdomain.com>
```

## 3. App URL for invite links (localhost vs production)

The link in the invite email must point to where your app is running.

**Local dev (localhost):** set in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use a different port if you run one, e.g. `http://localhost:3001`.

**Production (or tunnel):** set to your real URL:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

If you use ngrok/Cloudflare Tunnel for local testing from another device, set this to the tunnel URL (e.g. `https://abc123.ngrok.io`) so the email link works for the recipient.

If unset, the app falls back to `VERCEL_URL` on Vercel, or `http://localhost:3000` otherwise.

## Behavior

- **No `RESEND_API_KEY`**: Invite is still created; the coach sees the link in the dialog and can copy/share it. No email is sent.
- **With `RESEND_API_KEY`**: After creating the invite, an email is sent to the client with the one-time invite link. The coach still sees the link in the dialog.
