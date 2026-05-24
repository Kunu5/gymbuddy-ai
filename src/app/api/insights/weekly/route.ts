import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInsights } from "@/lib/insights";
import type { DailyLog } from "@/types/daily-log";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekStart = getWeekStart(new Date());

  const { data } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  return NextResponse.json({ report: data });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Look at last 4 weeks of logs for pattern detection
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const { data: logs, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", fourWeeksAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!logs || logs.length < 5) {
    return NextResponse.json({ error: "Not enough data yet — log at least 5 days first." }, { status: 400 });
  }

  const insights = await generateInsights(logs as DailyLog[]);
  if (!insights.length) {
    return NextResponse.json({ message: "No significant patterns detected yet. Keep logging!" });
  }

  const weekStart = getWeekStart(new Date());

  const { data: report, error: upsertError } = await supabase
    .from("weekly_reports")
    .upsert(
      { user_id: user.id, week_start: weekStart, insights },
      { onConflict: "user_id,week_start" }
    )
    .select()
    .single();

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
  return NextResponse.json({ report });
}
