import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recommendWorkout } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessions } = await request.json();
  if (!sessions?.length) return NextResponse.json({ error: "No sessions provided" }, { status: 400 });

  const summary = sessions
    .map((s: { title: string; date: string; duration_minutes?: number; muscle_groups?: string[] }) =>
      `${s.date}: ${s.title}${s.duration_minutes ? ` (${s.duration_minutes}min)` : ""}${s.muscle_groups?.length ? ` — ${s.muscle_groups.join(", ")}` : ""}`
    )
    .join("\n");

  const recommendation = await recommendWorkout(summary);
  return NextResponse.json(recommendation);
}
