import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseWorkout } from "@/lib/anthropic";

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

  return NextResponse.json({ session: data, parsed });
}
