import {
  getCoachDashboardStats,
  getCoachForCurrentClient,
  getClientProgramSummary,
  getClientsWithProgressForCoach,
  getRecentActivityForCoach,
} from '@/actions/clients'
import {
  getCurrentUserRole,
  getNextWorkoutForClient,
  getRecentActivityWithNotesForClient,
  getTodaysWorkoutsForClient,
} from '@/actions/workouts'
import { ClientDashboardContent } from '@/components/dashboard/client-dashboard-content'
import { CoachDashboardContent } from '@/components/dashboard/coach-dashboard-content'

export default async function DashboardPage() {
  const role = await getCurrentUserRole()

  if (role === 'client') {
    const [
      todaysWorkouts,
      coach,
      programSummary,
      nextWorkout,
      recentActivityWithNotes,
    ] = await Promise.all([
      getTodaysWorkoutsForClient(),
      getCoachForCurrentClient(),
      getClientProgramSummary(),
      getNextWorkoutForClient(),
      getRecentActivityWithNotesForClient(),
    ])
    return (
      <ClientDashboardContent
        todaysWorkouts={todaysWorkouts}
        coach={coach}
        programSummary={programSummary}
        nextWorkout={nextWorkout}
        recentActivityWithNotes={recentActivityWithNotes}
      />
    )
  }

  const [stats, recentActivity, clientsWithProgress] = await Promise.all([
    getCoachDashboardStats(),
    getRecentActivityForCoach(),
    getClientsWithProgressForCoach(),
  ])
  return (
    <CoachDashboardContent
      stats={stats}
      recentActivity={recentActivity}
      clientsWithProgress={clientsWithProgress}
    />
  )
}
