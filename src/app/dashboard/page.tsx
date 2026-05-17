import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardTabs from "@/components/DashboardTabs";
import { buildExerciseProgress, calculateStreak } from "@/lib/progress";
import type { CoachAnalysis } from "@/types/coach";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: allSessions }, { data: coachRow }] = await Promise.all([
    supabase.from("workout_sessions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("coach_analyses").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const sessions = allSessions ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exerciseProgress = buildExerciseProgress(sessions as any);
  const streak = calculateStreak(sessions);
  const userInitials = (user.email ?? "??").slice(0, 2).toUpperCase();

  const coachAnalysis: CoachAnalysis | null = coachRow ? {
    neglectedMuscleGroups: coachRow.neglected_muscle_groups,
    nextSession: coachRow.next_session,
    trendObservation: coachRow.trend_observation,
    generatedAt: coachRow.generated_at,
  } : null;

  return (
    <main className="min-h-screen bg-background">
      <DashboardTabs
        initialSessions={sessions.slice(0, 20)}
        initialCoachAnalysis={coachAnalysis}
        exerciseProgress={exerciseProgress}
        streak={streak}
        sessionCount={sessions.length}
        userEmail={user.email ?? ""}
        userInitials={userInitials}
      />
    </main>
  );
}
