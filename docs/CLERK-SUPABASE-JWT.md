# Clerk + Supabase JWT template

The app uses Supabase with **Clerk** for auth. To let Supabase recognize the signed-in user (for RLS), you need a **JWT template** in Clerk that issues tokens in the format Supabase expects.

If you see **`ClerkAPIResponseError: Not Found`** when loading protected pages (e.g. `/exercises`), the template is missing. Create it as below.

---

## 1. Create the template in Clerk

1. Open **[Clerk Dashboard](https://dashboard.clerk.com)** → your application.
2. Go to **JWT Templates** in the sidebar.
3. Click **New template** → choose **Supabase** (or **Blank** if Supabase isn’t listed).
4. **Name:** `supabase` (must be exactly this – the code uses `getToken({ template: 'supabase' })`).
5. If you used **Supabase** preset, Clerk fills in the claims. If **Blank**, use claims that match [Supabase’s expected JWT](https://supabase.com/docs/guides/auth/custom-claims#map-your-custom-claims-to-supabase-jwt-claims) (e.g. `sub` = user id, optional `role`).
6. Save.

---

## 2. Configure Supabase to trust Clerk’s JWTs

1. In Clerk, open your **Supabase** JWT template and copy the **Signing key** (JWKS URL or secret).
2. In **Supabase Dashboard** → **Authentication** → **Providers** → **JWT**, enable **Custom JWT** and set the issuer/audience and JWKS URL (or secret) from Clerk so Supabase can verify the token.

Details: [Supabase custom JWT](https://supabase.com/docs/guides/auth/custom-claims) and [Clerk Supabase integration](https://clerk.com/docs/integrations/databases/supabase).

---

## 3. Add RLS policies for exercises

RLS must allow the authenticated user to read and create rows. Run the policies in **`lib/supabase/rls-exercises.sql`** in the Supabase SQL Editor. They use `auth.jwt() ->> 'sub'` (Clerk user ID) so coaches can select global + their own exercises and insert/update/delete their own.

Without these policies you’ll see: **`new row violates row-level security policy for table "exercises"`** when adding an exercise.

## 4. Verify

Restart the dev server and open a protected route (e.g. `/exercises`). The `Not Found` error should be gone and Supabase RLS will see the user from the JWT. Adding an exercise should succeed.

If the template is still missing, the app falls back to the anon key (no user token) and you may see a dev console warning; RLS may then block access until the template is set up.
