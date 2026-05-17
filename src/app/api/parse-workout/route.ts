import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseWorkout } from "@/lib/anthropic";
import { analyzeCoach } from "@/lib/coach";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { input } = await request.json();

  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const parsed = await parseWorkout(input.trim(), today);

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      raw_input: input.trim(),
      title: parsed.title,
      date: parsed.date,
      duration_minutes: parsed.durationMinutes,
      exercises: parsed.exercises,
      muscle_groups: parsed.muscleGroups,
      notes: parsed.notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Run coach analysis against last 30 days and cache result
  let coachAnalysis = null;
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentSessions } = await supabase
      .from("workout_sessions")
      .select("title, date, muscle_groups, exercises, duration_minutes")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    const analysis = await analyzeCoach(recentSessions ?? []);
    const generatedAt = new Date().toISOString();

    const { data: saved } = await supabase
      .from("coach_analyses")
      .upsert(
        {
          user_id: user.id,
          neglected_muscle_groups: analysis.neglectedMuscleGroups,
          next_session: analysis.nextSession,
          trend_observation: analysis.trendObservation,
          generated_at: generatedAt,
          trigger_session_id: data.id,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (saved) {
      coachAnalysis = {
        neglectedMuscleGroups: saved.neglected_muscle_groups,
        nextSession: saved.next_session,
        trendObservation: saved.trend_observation,
        generatedAt: saved.generated_at,
      };
    }
  } catch {
    // Coach analysis is non-critical — workout was saved successfully
  }

  return NextResponse.json({ session: data, coachAnalysis });
}
