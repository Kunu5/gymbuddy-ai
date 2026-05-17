import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "@/components/WorkoutLogger";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">GymBuddy AI</h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
        </div>
        <WorkoutLogger initialSessions={sessions ?? []} />
      </div>
    </main>
  );
}
