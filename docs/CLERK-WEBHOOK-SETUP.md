# Clerk webhook setup

The app syncs Clerk users to Supabase via a webhook at **`/api/webhooks/clerk`**. To enable it:

---

## 1. Get a public URL for the webhook

Clerk must be able to send HTTP requests to your app.

### Local development: ngrok or Cloudflare Tunnel

Clerk must be able to POST to your app. Two options:

#### Option A: ngrok

1. **Get an ngrok auth token** (free): [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup). Add to `.env.local`:
   ```env
   NGROK_AUTHTOKEN=your_token_here
   ```
2. Start app + tunnel: `npm run dev:ngrok`. Use the printed URL, e.g. `https://xxxx.ngrok-free.app/api/webhooks/clerk`, in Clerk (step 2 below).

**Note:** On the free tier, ngrok sometimes returns **403** or an HTML page to non-browser requests (e.g. Clerk’s webhooks). If your deliveries show **Failed** and the response is 403 or HTML, use **Option B** instead.

#### Option B: Cloudflare Tunnel (recommended if ngrok fails)

No interstitial; works reliably for webhooks.

1. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) (one-time).
2. In one terminal, start your app: `npm run dev`.
3. In another terminal run:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
4. Copy the HTTPS URL (e.g. `https://something.trycloudflare.com`). Your webhook URL is:
   ```text
   https://something.trycloudflare.com/api/webhooks/clerk
   ```
   Use this in Clerk (step 2 below). The URL changes each time you restart the tunnel.

### Production (e.g. Vercel)

Use your deployed URL:

```text
https://your-app.vercel.app/api/webhooks/clerk
```

---

## 2. Add the endpoint in Clerk

1. Open **[Clerk Dashboard](https://dashboard.clerk.com)** and select your application.
2. Go to **Webhooks** in the sidebar.
3. Click **Add Endpoint**.
4. **Endpoint URL**: paste your URL, e.g.  
   `https://your-app.vercel.app/api/webhooks/clerk` or  
   `https://abc123.ngrok.io/api/webhooks/clerk`.
5. **Subscribe to events**: enable at least:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Click **Create**.

---

## 3. Copy the signing secret

1. On the new webhook’s page, open **Signing secret**.
2. Click **Reveal** and copy the value (starts with `whsec_`).

---

## 4. Set the secret in your app

Add it to `.env.local` (and to your hosting provider’s env vars in production):

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Restart the dev server after changing `.env.local`.

---

## 5. Confirm Supabase is configured

The webhook writes to Supabase. In `.env.local` you need:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

The **service role** key is required; the webhook uses it to bypass RLS and insert/update/delete in the `users` table.

---

## 6. Ensure the `users` table exists

Run your Supabase schema (including the `users` table and any enums it uses) in the Supabase SQL editor. The webhook expects:

- `users.id` (text, PK) — Clerk user ID  
- `users.email` (text)  
- `users.name` (text)  
- `users.role` (enum, e.g. `coach`)

See `lib/supabase/database.sql` for the full schema.

---

## 7. Test the webhook

1. In Clerk Dashboard, open your webhook and use **Testing** → **Send test event** (e.g. `user.created`).
2. Check your app logs and Supabase `users` table to confirm the request is accepted and the user is created/updated.

For local dev, send the test event while your app is running and ngrok (or your tunnel) is active.

---

## Troubleshooting

**See why a delivery failed:** In Clerk Dashboard → Webhooks → your endpoint → **Message Attempts** → click a **Failed** attempt. Check the **response status code** and (if shown) response body.

| Issue | What to check |
|-------|----------------|
| **Deliveries Failed with 403 or HTML response** | ngrok free tier can block server requests. Use Cloudflare Tunnel: run `npm run dev`, then `cloudflared tunnel --url http://localhost:3000`, and set Clerk endpoint to `https://<tunnel-url>/api/webhooks/clerk`. |
| **User created in Clerk but not in Supabase** | (1) Webhook must be reachable: use `npm run dev:ngrok` and set Clerk endpoint to `https://<ngrok-host>/api/webhooks/clerk`. (2) Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`. (3) Check Clerk Dashboard → Webhooks → your endpoint → delivery logs. |
| **503 Supabase not configured for webhook** | `SUPABASE_SERVICE_ROLE_KEY` is missing. Add it to `.env.local` and restart. |
| **501 Webhook secret not configured** | `CLERK_WEBHOOK_SECRET` is missing or not loaded (restart dev server, check env in production). |
| **400 Error verifying webhook** | Secret doesn’t match the one in Clerk (copy again, no extra spaces). |
| **500 Error creating user** | Supabase env vars set? `users` table and enums created? Check Supabase logs and app logs for the actual error. |
| **Clerk can’t reach URL** | Local: tunnel running and URL in Clerk matches. Production: deployment URL correct and not blocked by auth. |

---

## Security

- Do **not** commit `CLERK_WEBHOOK_SECRET` or `.env.local` to git.
- The route uses the **Svix** signature in the `svix-signature` header to verify that requests come from Clerk before touching the database.
