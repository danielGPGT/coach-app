-- Coach invitations: store pending invites by email; client accepts via /invite/[token]
-- Run this in Supabase SQL editor if you haven't already.

CREATE TABLE IF NOT EXISTS public.coach_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id text NOT NULL,
  email text NOT NULL,
  token text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coach_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT coach_invitations_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT coach_invitations_token_unique UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS coach_invitations_token_idx ON public.coach_invitations (token);
CREATE INDEX IF NOT EXISTS coach_invitations_coach_id_idx ON public.coach_invitations (coach_id);
