import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { DailyLog, ScoreBreakdown } from "@/types/daily-log";

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10, letterSpacing: "0.16em",
      textTransform: "uppercase" as const, color: "#6B6862",
      ...style,
    }}>{children}</div>
  );
}

const CONTRIBUTORS = [
  { name: "Sleep",     key: "sleep"     as keyof ScoreBreakdown, max: 30, tint: "#E8622A" },
  { name: "Stress",    key: "stress"    as keyof ScoreBreakdown, max: 25, tint: "#E8A02A" },
  { name: "Energy",    key: "energy"    as keyof ScoreBreakdown, max: 25, tint: "#E8622A" },
  { name: "Lifestyle", key: "lifestyle" as keyof ScoreBreakdown, max: 20, tint: "#E8622A" },
];

export default async function ScorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];

  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user!.id)
    .eq("date", today)
    .maybeSingle();

  const { data: yesterday } = await supabase
    .from("daily_logs")
    .select("score")
    .eq("user_id", user!.id)
    .lt("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const todayLog = log as DailyLog | null;
  const score = todayLog?.score;
  const breakdown = todayLog?.score_breakdown;
  const yesterdayScore = (yesterday as { score?: number } | null)?.score;
  const delta = score != null && yesterdayScore != null ? score - yesterdayScore : null;

  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (!todayLog || score == null) {
    return (
      <div style={{ padding: "58px 20px 20px", background: "#111110", minHeight: "100%", color: "#FAFAF8" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>No score yet</div>
          <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 8 }}>Complete your morning check-in to see today&apos;s cognitive score.</div>
        </div>
        <Link href="/check-in" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "14px 20px", background: "#E8622A", color: "#110",
          borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: "none",
        }}>
          Start check-in →
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Link href="/home" style={{ fontSize: 22, color: "#6B6862", textDecoration: "none" }}>‹</Link>
        <Eyebrow>{dateLabel}</Eyebrow>
        <div style={{ width: 22 }} />
      </div>

      {/* Centered score */}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Eyebrow>Cognitive Score</Eyebrow>
        <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 6, marginTop: 8 }}>
          <div style={{ fontSize: 124, fontWeight: 700, color: "#E8622A", letterSpacing: "-0.06em", lineHeight: 0.85 }}>
            {score}
          </div>
          <div style={{ fontSize: 22, color: "#6B6862", fontWeight: 500, paddingBottom: 12 }}>/100</div>
        </div>
        {delta != null && (
          <div style={{ fontSize: 12, color: "#E8622A", fontWeight: 600, marginTop: 8 }}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta) > 0 ? `${Math.abs(delta)} from yesterday` : "Same as yesterday"}
          </div>
        )}
      </div>

      {/* Breakdown */}
      {breakdown && (
        <>
          <Eyebrow style={{ marginTop: 30, marginBottom: 12 }}>Where it came from</Eyebrow>
          <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: "#2a2826" }}>
              {CONTRIBUTORS.map((c, i) => (
                <div key={c.key} style={{
                  width: `${c.max}%`,
                  background: c.tint,
                  opacity: c.key === "stress" ? 0.65 : 1,
                  borderRight: i < CONTRIBUTORS.length - 1 ? "1px solid #111110" : "none",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CONTRIBUTORS.map((c) => (
                <div key={c.key} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.tint, opacity: c.key === "stress" ? 0.65 : 1 }} />
                  <div style={{ fontSize: 13, color: "#FAFAF8" }}>{c.name}</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#aaa69e" }}>
                    {breakdown[c.key]}<span style={{ color: "#6B6862" }}> / {c.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* AI explanation */}
      <Eyebrow style={{ marginTop: 18, marginBottom: 8 }}>What it means</Eyebrow>
      <div style={{ fontSize: 13.5, color: "#aaa69e", lineHeight: 1.55 }}>
        {score >= 80
          ? "Excellent — all your key metrics are well-aligned. Keep up the good habits and check back tomorrow."
          : score >= 60
          ? "A solid day with room to improve. Focus on sleep quality and managing stress to push higher tomorrow."
          : "Recovery mode. Prioritise rest, avoid late caffeine, and light movement today will help tomorrow's score."}
      </div>

      {/* Actions */}
      <Eyebrow style={{ marginTop: 18, marginBottom: 10 }}>What to do today</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { headline: "Log your meals", body: "Nutrition data adds confidence to your score.", href: "/food" },
          { headline: "Plan your workout", body: "AI picks the right move for today's energy level.", href: "/move" },
        ].map((r, i) => (
          <Link key={i} href={r.href} style={{
            background: "#1A1916", border: "1px solid #2a2826",
            borderRadius: 14, padding: "12px 14px",
            display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center",
            textDecoration: "none",
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#FAFAF8" }}>{r.headline}</div>
              <div style={{ fontSize: 11.5, color: "#6B6862", marginTop: 2, lineHeight: 1.35 }}>{r.body}</div>
            </div>
            <div style={{
              padding: "4px 10px", borderRadius: 999,
              background: "rgba(232,98,42,0.10)", color: "#E8622A",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
            }}>Go</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
