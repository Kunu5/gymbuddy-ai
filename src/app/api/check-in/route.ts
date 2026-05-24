import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/score";
import type { CheckInInput } from "@/types/daily-log";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: CheckInInput = await request.json();
  const today = new Date().toISOString().split("T")[0];

  const { score, breakdown } = computeScore(body);

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: user.id,
        date: today,
        sleep_hours: body.sleep_hours,
        energy: body.energy,
        focus: body.focus,
        stress: body.stress,
        caffeine_mg: body.caffeine_mg,
        exercised: body.exercised,
        score,
        score_breakdown: breakdown,
      },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data, score, breakdown });
}
