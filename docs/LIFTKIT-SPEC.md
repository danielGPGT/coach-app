# LiftKit - Project Specification

## Overview

LiftKit is a strength coaching platform that allows coaches to create training programs and assign them to clients. Clients view their assigned workouts and log their completed sets. Coaches monitor client progress and adjust programming accordingly.

**Target Revenue:** £200/month side project
**Target Users:** 20-30 paying coaches

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Payments | Stripe |
| Deployment | Vercel |

---

## User Roles

### Coach (Paying User)
- Signs up independently
- Creates training programs
- Invites clients via email/link
- Assigns programs to clients
- Views client workout logs
- Pays monthly subscription based on client count

### Client (Free User)
- Invited by coach (cannot sign up independently for MVP)
- Views assigned program
- Logs completed workouts (sets, reps, weight, RPE)
- Belongs to one coach (MVP)

---

## Subscription Tiers

| Tier | Price | Client Limit |
|------|-------|--------------|
| Free | £0 | 2 clients |
| Basic | £12/month | 10 clients |
| Pro | £25/month | 25 clients |

---

## MVP Features

### Authentication
- [x] Coach signup/login via Clerk
- [x] Client signup via invite link from coach
- [x] Protected routes for authenticated users
- [x] Role-based access (coach vs client views)

### Coach Features
- [ ] Dashboard with client overview and recent activity
- [ ] Client management (invite, view, deactivate)
- [ ] Exercise library (view global, create custom)
- [ ] Program builder (weeks, days, exercises with sets/reps/intensity)
- [ ] Assign programs to clients
- [ ] View client workout logs

### Client Features
- [ ] Dashboard showing current program
- [ ] View today's workout
- [ ] Log workout (record sets, reps, weight, RPE)
- [ ] View workout history

### Billing
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Client limit enforcement based on tier

---

## Future Features (Post-MVP)

- Client metrics tracking (weight, body fat, measurements)
- Progress photos
- Personal records (1RM tracking, auto-detection)
- Meal plans and nutrition tracking
- Solo user mode (train without a coach)
- Coach marketplace (clients find coaches)
- AI program generation
- AI weekly summaries

---

## Database Schema

### Core Tables

```
users
├── id (text, PK) — Clerk user ID
├── email (text, unique)
├── name (text)
├── role (enum: coach, client)
├── unit_preference (enum: kg, lb)
├── stripe_customer_id (text, nullable)
├── subscription_status (enum: trialing, active, past_due, canceled, none)
├── subscription_tier (enum: free, basic, pro)
├── subscription_current_period_end (timestamptz)
├── created_at (timestamptz)
└── updated_at (timestamptz)

coach_clients
├── id (uuid, PK)
├── coach_id (text, FK → users)
├── client_id (text, FK → users)
├── status (enum: active, inactive)
├── invited_at (timestamptz)
└── joined_at (timestamptz)

exercises
├── id (uuid, PK)
├── coach_id (text, FK → users, nullable) — null = global exercise
├── name (text)
├── category (enum: squat, hinge, push, pull, carry, core, accessory, cardio, other)
└── created_at (timestamptz)

programs
├── id (uuid, PK)
├── coach_id (text, FK → users)
├── name (text)
├── description (text)
├── duration_weeks (int)
├── days_per_week (int)
├── created_at (timestamptz)
└── updated_at (timestamptz)

program_workouts
├── id (uuid, PK)
├── program_id (uuid, FK → programs)
├── week_number (int)
├── day_number (int)
├── name (text) — e.g., "Upper A", "Lower B"
└── notes (text)

prescribed_exercises
├── id (uuid, PK)
├── program_workout_id (uuid, FK → program_workouts)
├── exercise_id (uuid, FK → exercises)
├── sort_order (int)
├── sets (int)
├── reps (text) — allows "5" or "6-8" or "AMRAP"
├── intensity_value (decimal) — e.g., 80.0 for 80% or 7.5 for RPE
├── intensity_type (enum: percentage, rpe, absolute)
├── rest_seconds (int)
└── notes (text)

client_assignments
├── id (uuid, PK)
├── client_id (text, FK → users)
├── program_id (uuid, FK → programs)
├── start_date (date)
├── status (enum: active, paused, completed)
└── created_at (timestamptz)

workout_logs
├── id (uuid, PK)
├── client_id (text, FK → users)
├── assignment_id (uuid, FK → client_assignments)
├── program_workout_id (uuid, FK → program_workouts)
├── scheduled_date (date)
├── completed_at (timestamptz)
├── notes (text)
└── created_at (timestamptz)

set_logs
├── id (uuid, PK)
├── workout_log_id (uuid, FK → workout_logs)
├── prescribed_exercise_id (uuid, FK → prescribed_exercises)
├── set_number (int)
├── reps_completed (int)
├── weight_kg (decimal) — stored canonical in kg, displayed per user preference
├── rpe (decimal)
└── notes (text)
```

### Key Relationships

```
Coach → has many → Clients (via coach_clients)
Coach → has many → Programs
Coach → has many → Custom Exercises
Program → has many → Program Workouts (weeks × days)
Program Workout → has many → Prescribed Exercises
Client → has many → Client Assignments
Client Assignment → links → Client to Program
Client → has many → Workout Logs
Workout Log → has many → Set Logs
```

---

## Row Level Security

All tables have RLS enabled. Access rules:

| Table | Coach Access | Client Access |
|-------|--------------|---------------|
| users | Own profile + their clients | Own profile |
| coach_clients | Full CRUD on own relationships | Read own relationship |
| exercises | Global + own custom exercises | None (accessed via program) |
| programs | Full CRUD on own programs | Read assigned programs |
| program_workouts | Full CRUD on own programs' workouts | Read assigned |
| prescribed_exercises | Full CRUD on own | Read assigned |
| client_assignments | Full CRUD for their clients | Read own |
| workout_logs | Read their clients' logs | Full CRUD on own |
| set_logs | Read their clients' logs | Full CRUD on own |

---

## Application Routes

### Public Routes
```
/                   → Landing page
/login              → Clerk SignIn
/signup             → Clerk SignUp
/invite/[token]     → Client invite acceptance
```

### Protected Routes (Coach)
```
/dashboard          → Coach dashboard (overview, recent activity)
/clients            → Client list
/clients/[id]       → Individual client view (logs, progress)
/clients/invite     → Invite new client
/programs           → Program list
/programs/new       → Create program
/programs/[id]      → View/edit program
/programs/[id]/assign → Assign program to client
/exercises          → Exercise library
/exercises/new      → Create custom exercise
/settings           → Account settings, billing
```

### Protected Routes (Client)
```
/dashboard          → Client dashboard (today's workout, current program)
/workout/[id]       → Log workout
/history            → Workout history
/settings           → Account settings
```

---

## UI/UX Guidelines

### Design Principles
- Clean, minimal interface
- Mobile-first but desktop-optimized for coaches
- Emerald green as primary accent color
- Slate grays for structure
- Generous whitespace
- Rounded corners (border-radius: xl/2xl)

### Color Palette
```
Primary:    emerald-500 (#10b981) → emerald-600 (#059669)
Background: slate-50 (#f8fafc)
Cards:      white with slate-200 border
Text:       slate-900 (headings), slate-600 (body), slate-400 (muted)
Success:    emerald-500
Warning:    amber-500
Error:      red-500
```

### Typography
- Font: System font stack (default Tailwind)
- Headings: font-bold, slate-900
- Body: font-normal, slate-600
- Small/muted: text-sm, slate-400

### Component Patterns
- Cards: `bg-white rounded-2xl border border-slate-200 shadow-sm`
- Buttons (primary): `bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl`
- Buttons (secondary): `bg-white border border-slate-200 text-slate-700 rounded-xl`
- Inputs: shadcn/ui defaults with rounded-lg
- Status indicators: Small colored dots (emerald for active, amber for warning)

### Navigation
- Top nav on desktop (logo, main nav items, user menu)
- Bottom tab bar on mobile
- Hamburger menu as fallback on tablet

### Responsive Breakpoints
- Mobile: < 640px (single column, bottom nav)
- Tablet: 640px - 1024px (flexible, top nav)
- Desktop: > 1024px (multi-column layouts)

---

## Key User Flows

### Coach Signup Flow
1. Coach visits /signup
2. Creates account via Clerk
3. Clerk webhook creates user in Supabase with role='coach'
4. Redirected to /dashboard
5. Dashboard prompts to invite first client or create first program

### Client Invite Flow
1. Coach clicks "Invite Client" in dashboard
2. Enters client email
3. System creates coach_clients record with status='pending'
4. Email sent to client with invite link
5. Client clicks link, creates account via Clerk
6. Clerk webhook creates user with role='client'
7. System updates coach_clients record with joined_at timestamp
8. Client redirected to their dashboard

### Program Creation Flow
1. Coach navigates to /programs/new
2. Enters program name, duration (weeks), days per week
3. System creates program and generates empty program_workouts grid
4. Coach clicks on a day to add exercises
5. Coach searches/selects exercises from library
6. Coach sets sets, reps, intensity, rest for each exercise
7. Coach can copy days or weeks to speed up entry
8. Coach saves program

### Program Assignment Flow
1. Coach views client profile
2. Clicks "Assign Program"
3. Selects from their programs
4. Sets start date
5. System creates client_assignment
6. System generates workout_logs for each scheduled workout
7. Client sees new program in their dashboard

### Workout Logging Flow (Client)
1. Client opens app, sees today's workout
2. Views prescribed exercises with sets/reps/intensity
3. For each set, enters: weight used, reps completed, RPE (optional)
4. Can add notes per set or per workout
5. Marks workout complete
6. System updates workout_log.completed_at
7. Coach can view logged data in real-time

---

## API Patterns

### Data Fetching
- Server Components for initial page loads
- Supabase client with Clerk JWT for authenticated requests
- RLS handles authorization automatically

### Mutations
- Server Actions for form submissions
- Optimistic updates where appropriate
- Revalidate paths after mutations

### Example Server Action
```typescript
'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProgram(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('programs')
    .insert({
      coach_id: userId,
      name: formData.get('name') as string,
      duration_weeks: parseInt(formData.get('duration_weeks') as string),
      days_per_week: parseInt(formData.get('days_per_week') as string),
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/programs')
  return data
}
```

---

## File Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx              # Auth check + AppShell wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx            # Client list
│   │   │   ├── invite/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Client detail
│   │   ├── programs/
│   │   │   ├── page.tsx            # Program list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Program detail/edit
│   │   │       └── assign/
│   │   │           └── page.tsx
│   │   ├── exercises/
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── workout/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Workout logging (client)
│   │   ├── history/
│   │   │   └── page.tsx            # Workout history (client)
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       ├── clerk/
│   │       │   └── route.ts
│   │       └── stripe/
│   │           └── route.ts
│   ├── invite/
│   │   └── [token]/
│   │       └── page.tsx            # Client invite acceptance
│   ├── layout.tsx                  # Root layout with ClerkProvider
│   └── page.tsx                    # Landing page
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── app-shell.tsx               # Main app layout (nav, sidebar)
│   ├── dashboard/
│   │   ├── coach-dashboard.tsx
│   │   └── client-dashboard.tsx
│   ├── clients/
│   │   ├── client-list.tsx
│   │   ├── client-card.tsx
│   │   └── invite-form.tsx
│   ├── programs/
│   │   ├── program-list.tsx
│   │   ├── program-card.tsx
│   │   ├── program-builder.tsx
│   │   └── workout-day-editor.tsx
│   ├── exercises/
│   │   ├── exercise-list.tsx
│   │   ├── exercise-picker.tsx
│   │   └── exercise-form.tsx
│   └── workout/
│       ├── workout-view.tsx
│       ├── set-logger.tsx
│       └── workout-history.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts                # Generated from Supabase
│   ├── utils.ts                    # Utility functions
│   └── constants.ts                # App constants
├── actions/
│   ├── clients.ts                  # Client-related server actions
│   ├── programs.ts                 # Program-related server actions
│   ├── exercises.ts                # Exercise-related server actions
│   └── workouts.ts                 # Workout logging server actions
├── hooks/
│   ├── use-user.ts                 # Current user hook
│   └── use-supabase.ts             # Supabase client hook
├── types/
│   └── index.ts                    # Shared TypeScript types
├── middleware.ts                   # Clerk auth middleware
└── .env.local
```

---

## Development Priorities

### Phase 1: Foundation (Week 1)
1. ✅ Set up Next.js with TypeScript
2. ✅ Configure Clerk authentication
3. ✅ Configure Supabase + run schema
4. ✅ Set up Clerk webhook to sync users
5. ✅ Create protected layout with AppShell
6. ✅ Basic dashboard page (placeholder)

### Phase 2: Exercise Library (Week 1-2)
1. Exercise list page with global exercises
2. Create custom exercise form
3. Exercise categories and filtering

### Phase 3: Program Builder (Week 2-3)
1. Program list page
2. Create program form (name, weeks, days)
3. Program workout grid view
4. Add exercises to workout days
5. Set prescription details (sets, reps, intensity)
6. Copy/duplicate functionality

### Phase 4: Client Management (Week 3)
1. Client list page
2. Invite client flow
3. Client detail page
4. Assign program to client

### Phase 5: Workout Logging (Week 3-4)
1. Client dashboard with today's workout
2. Workout logging interface
3. Set logging (weight, reps, RPE)
4. Mark workout complete
5. Workout history view

### Phase 6: Coach Views (Week 4)
1. View client workout logs
2. Dashboard activity feed
3. Client progress overview

### Phase 7: Billing (Week 4-5)
1. Stripe integration
2. Subscription checkout
3. Client limit enforcement
4. Billing portal

---

## Testing Checklist

### Auth
- [ ] Coach can sign up
- [ ] Coach can log in
- [ ] User syncs to Supabase on signup
- [ ] Protected routes redirect to login
- [ ] Client can accept invite and create account

### Exercises
- [ ] Coach can view global exercises
- [ ] Coach can create custom exercise
- [ ] Custom exercises only visible to creator

### Programs
- [ ] Coach can create program
- [ ] Coach can add workouts to program
- [ ] Coach can add exercises to workouts
- [ ] Coach can edit/delete programs
- [ ] Programs only visible to creator

### Clients
- [ ] Coach can invite client
- [ ] Client receives invite
- [ ] Client can accept invite
- [ ] Coach can view client list
- [ ] Coach can assign program to client

### Workout Logging
- [ ] Client sees assigned program
- [ ] Client can view today's workout
- [ ] Client can log sets
- [ ] Client can complete workout
- [ ] Coach can view client's logs

### Billing
- [ ] Coach can subscribe
- [ ] Client limit enforced per tier
- [ ] Coach can upgrade/downgrade
- [ ] Coach can cancel

---

## Notes for AI Assistant

1. **Always use Server Components** for data fetching where possible
2. **Use Server Actions** for mutations, not API routes
3. **RLS handles auth** — don't duplicate authorization logic in code
4. **Weights stored in kg** — convert on display based on user.unit_preference
5. **Keep components small** — extract into separate files when > 100 lines
6. **Use shadcn/ui** for base components, customize with Tailwind
7. **Mobile-first** — design for mobile, enhance for desktop
8. **Optimistic updates** — for better UX on logging actions
9. **Error handling** — use try/catch, show user-friendly messages
10. **Loading states** — use Suspense and loading.tsx files

---

## Questions to Ask Before Building a Feature

1. Does this exist in the schema? If not, is it MVP or future?
2. Who can access this? (Coach only, client only, both?)
3. What's the mobile experience?
4. What happens on error?
5. What's the loading state?
6. Does this need real-time updates?
