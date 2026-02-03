# CoachUp – Spec alignment status

This doc tracks progress against [LIFTKIT-SPEC.md](./LIFTKIT-SPEC.md).

---

## Phase 1: Foundation ✅

| Item | Status |
|------|--------|
| Next.js + TypeScript | ✅ |
| Clerk auth | ✅ Login/signup at `/(auth)/login`, `/(auth)/signup` |
| Supabase | ✅ Client/server/admin in `lib/supabase/` |
| Clerk webhook | ✅ `api/webhooks/clerk` syncs users to Supabase |
| Protected layout | ✅ `(protected)/layout.tsx` + AppShell |
| Dashboard placeholder | ✅ `(protected)/dashboard` |

---

## Routes (per spec)

### Public
| Route | Status |
|-------|--------|
| `/` | ✅ Landing |
| `/login` | ✅ `(auth)/login` |
| `/signup` | ✅ `(auth)/signup` |
| `/invite/[token]` | ✅ Invite acceptance flow (signup/login redirect + accept) |

### Protected (Coach)
| Route | Status |
|-------|--------|
| `/dashboard` | ✅ Coach dashboard (stats, activity, client progress) |
| `/clients` | ✅ Client list + invite |
| `/clients/invite` | ✅ Redirects to invite dialog |
| `/clients/[id]` | ✅ Client detail (schedule, progress, assignments) |
| `/programs` | ✅ Program list + create/edit/delete |
| `/programs/new` | ✅ Create program |
| `/programs/[id]` | ✅ Program builder |
| `/programs/[id]/assign` | ✅ Assign program flow |
| `/exercises` | ✅ Exercise library (search, category filter, global + custom) |
| `/exercises/new` | ✅ Create custom exercise form |
| `/settings` | ✅ Basic account + placeholders for prefs/billing |

### Protected (Client)
| Route | Status |
|-------|--------|
| `/dashboard` | ✅ Client dashboard (coach card, program, next workout, today, notes) |
| `/workout/[id]` | ✅ Log workout + sets (client/coach) |
| `/history` | ✅ Workout history |
| `/settings` | ✅ Basic account + placeholders |

---

## Database

- Schema in `lib/supabase/database.sql` matches spec (users, coach_clients, exercises, programs, program_workouts, prescribed_exercises, client_assignments, workout_logs, set_logs).
- Enums and RLS must be applied in Supabase (run migration there).

---

## Next steps (spec phases)

1. **Phase 2 – Exercise library** ✅  
   `/exercises`: list (global + custom), search, category chips, empty states. `/exercises/new`: form (name, category grid). Server actions in `actions/exercises.ts`. Optional seed: `lib/supabase/seed-exercises.sql`.

2. **Phase 3 – Program builder** ✅  
   Programs list + builder + workout grid + add exercises + edit/delete.

3. **Phase 4 – Client management** ✅  
   Clients list + invite + detail + program assignment + schedule generation.

4. **Phase 5 – Workout logging** ✅  
   Client dashboard (today/next/notes), `/workout/[id]` (log sets), `/history`.

5. **Phase 6 – Coach views** ✅  
   Dashboard stats, today’s workouts, recent activity, client progress list, client history/progress.

6. **Phase 7 – Billing**  
   Stripe, subscription tiers, client limits.

---

## UI (spec)

- **Colours:** Emerald primary, slate grays (optional: update `globals.css` / theme).
- **Layout:** AppShell nav updated to Dashboard, Clients, Programs, Exercises, Settings.

---

## File structure vs spec

- `app/(auth)/login`, `app/(auth)/signup` ✅  
- `app/(protected)/*` with features + placeholders only where noted ✅  
- `app/invite/[token]` ✅  
- `components/app-shell.tsx` ✅  
- `actions/exercises.ts` ✅ (Phase 2). Add `programs`, `clients`, `workouts` with later phases.  
- `components/dashboard/`, `components/clients/`, etc. – add as features are built.
