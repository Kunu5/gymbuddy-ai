import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { DailyLog } from "@/types/daily-log";
import type { Meal } from "@/types/meal";

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 10,
      letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862",
      ...style,
    }}>{children}</div>
  );
}

export default async function LogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const [{ data: log }, { data: rawMeals }, { data: rawWorkouts }] = await Promise.all([
    supabase.from("daily_logs").select("*").eq("user_id", user!.id).eq("date", today).maybeSingle(),
    supabase.from("meals").select("*").eq("user_id", user!.id).gte("logged_at", today).order("logged_at", { ascending: false }).limit(10),
    supabase.from("workout_sessions").select("title, date, created_at").eq("user_id", user!.id).eq("date", today).limit(5),
  ]);

  const todayLog = log as DailyLog | null;
  const meals = (rawMeals ?? []) as Meal[];
  const workouts = rawWorkouts ?? [];

  const checkedIn = todayLog != null;

  const todayTimeline: Array<{ time: string; what: string; ic: string; href: string }> = [];
  if (checkedIn) {
    todayTimeline.push({
      time: new Date(todayLog!.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      what: "Morning check-in",
      ic: "✓",
      href: "/check-in",
    });
  }
  for (const m of meals) {
    todayTimeline.push({
      time: new Date(m.logged_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      what: m.items.map((i) => i.name).join(", ") || m.raw_input || "Meal",
      ic: "+",
      href: "/food",
    });
  }
  for (const w of workouts) {
    todayTimeline.push({
      time: new Date(w.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      what: w.title,
      ic: "◼",
      href: "/workout",
    });
  }

  const quicks = [
    { id: "sleep", title: "Sleep", sub: "Hours · quality", stat: todayLog?.sleep_hours != null ? `${todayLog.sleep_hours}h` : "Not logged", href: "/check-in",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8z"/></svg> },
    { id: "caffeine", title: "Caffeine", sub: "Coffee · tea · energy", stat: todayLog?.caffeine_mg != null ? `${todayLog.caffeine_mg}mg` : "Not logged", href: "/check-in",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 9h2a3 3 0 0 1 0 6h-1"/><path d="M7 4c0 1 1 1 1 2M11 4c0 1 1 1 1 2"/></svg> },
    { id: "meals", title: "Meals", sub: "Type or photo", stat: meals.length > 0 ? `${meals.length} logged` : "None yet", href: "/food",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v18"/><path d="M5 12h4"/><path d="M15 22V12a3 3 0 0 1 3-3h0v13"/></svg> },
    { id: "exercise", title: "Exercise", sub: "Walk · strength · run", stat: workouts.length > 0 ? `${workouts.length} session${workouts.length > 1 ? "s" : ""}` : "Not yet", muted: workouts.length === 0, href: "/workout",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l3 3-3 3M18 14l-3 3 3 3M3 7h11a4 4 0 0 1 4 4v0M21 17H10a4 4 0 0 1-4-4v0"/></svg> },
  ];

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>Log · Today</Eyebrow>
        <div style={{ fontSize: 12, color: "#6B6862", fontFamily: "var(--font-mono)" }}>{dateLabel}</div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>What to log.</div>
        <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 6, lineHeight: 1.4 }}>Pick one. They all feed your score.</div>
      </div>

      {/* Morning check-in status */}
      {checkedIn ? (
        <div style={{
          background: "rgba(124,199,133,0.06)", border: "1px solid rgba(124,199,133,0.30)",
          borderRadius: 14, padding: "12px 14px", marginBottom: 14,
          display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 12, alignItems: "center",
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(124,199,133,0.18)", color: "#7cc785", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700 }}>✓</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#FAFAF8" }}>Morning check-in done</div>
            <div style={{ fontSize: 11, color: "#6B6862", marginTop: 2 }}>
              Score: {todayLog!.score ?? "—"} · contributing to today&apos;s breakdown
            </div>
          </div>
          <Link href="/check-in" style={{ fontSize: 11, color: "#7cc785", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textDecoration: "none" }}>EDIT</Link>
        </div>
      ) : (
        <Link href="/check-in" style={{
          background: "rgba(232,98,42,0.08)", border: "1px solid rgba(232,98,42,0.35)",
          borderRadius: 14, padding: "12px 14px", marginBottom: 14, textDecoration: "none",
          display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 12, alignItems: "center",
        } as React.CSSProperties}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(232,98,42,0.15)", color: "#E8622A", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700 }}>+</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#FAFAF8" }}>Start morning check-in</div>
            <div style={{ fontSize: 11, color: "#6B6862", marginTop: 2 }}>2 minutes to get your cognitive score</div>
          </div>
          <div style={{ color: "#E8622A", fontSize: 18 }}>›</div>
        </Link>
      )}

      {/* Quick log 2×2 */}
      <Eyebrow style={{ marginBottom: 10 }}>Quick log</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {quicks.map((q) => (
          <Link key={q.id} href={q.href} style={{
            background: "#1A1916", border: "1px solid #2a2826",
            borderRadius: 14, padding: "14px 14px 12px",
            display: "flex", flexDirection: "column", gap: 10,
            minHeight: 116, textDecoration: "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(232,98,42,0.10)", color: "#E8622A", display: "grid", placeItems: "center" }}>
                {q.icon}
              </div>
              <div style={{ fontSize: 16, color: "#6B6862", lineHeight: 1 }}>›</div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FAFAF8" }}>{q.title}</div>
              <div style={{ fontSize: 11, color: "#6B6862", marginTop: 2, marginBottom: 6 }}>{q.sub}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: (q as { muted?: boolean }).muted ? "#6B6862" : "#E8622A", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>{q.stat}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today timeline */}
      {todayTimeline.length > 0 && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>Today so far</Eyebrow>
          <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 14, overflow: "hidden" }}>
            {todayTimeline.map((l, i) => (
              <Link key={i} href={l.href} style={{
                padding: "10px 14px",
                borderTop: i ? "1px solid #2a2826" : "none",
                display: "grid", gridTemplateColumns: "52px 28px 1fr auto", gap: 10, alignItems: "center",
                textDecoration: "none",
              }}>
                <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#6B6862", letterSpacing: "0.04em" }}>{l.time}</div>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(232,98,42,0.10)", color: "#E8622A", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>{l.ic}</div>
                <div style={{ fontSize: 12.5, color: "#FAFAF8" }}>{l.what}</div>
                <div style={{ fontSize: 14, color: "#6B6862" }}>›</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
