import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardTabs from "@/components/DashboardTabs";
import type { CoachAnalysis } from "@/types/coach";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: sessions }, { data: coachRow }] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20),
    supabase
      .from("coach_analyses")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

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
        </div>
        <DashboardTabs
          initialSessions={sessions ?? []}
          initialCoachAnalysis={coachAnalysis}
        />
      </div>
    </main>
  );
}
