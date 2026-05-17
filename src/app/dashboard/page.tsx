import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardTabs from "@/components/DashboardTabs";
import { buildExerciseProgress, calculateStreak } from "@/lib/progress";
import type { CoachAnalysis } from "@/types/coach";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: allSessions }, { data: coachRow }] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("coach_analyses")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const sessions = allSessions ?? [];
  const recentSessions = sessions.slice(0, 20);

  const streak = calculateStreak(sessions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exerciseProgress = buildExerciseProgress(sessions as any);

  const coachAnalysis: CoachAnalysis | null = coachRow
    ? {
        neglectedMuscleGroups: coachRow.neglected_muscle_groups,
        nextSession: coachRow.next_session,
        trendObservation: coachRow.trend_observation,
        generatedAt: coachRow.generated_at,
      }
    : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">GymBuddy AI</h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          {streak.current > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold">{streak.current} day streak</p>
              {streak.longest > streak.current && (
                <p className="text-xs text-muted-foreground">Best: {streak.longest} days</p>
              )}
            </div>
          )}
        </div>
        <DashboardTabs
          initialSessions={recentSessions}
          initialCoachAnalysis={coachAnalysis}
          exerciseProgress={exerciseProgress}
        />
      </div>
    </main>
  );
}
