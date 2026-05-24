import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { DailyLog } from "@/types/daily-log";

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.16em",
      textTransform: "uppercase" as const,
      color: "#6B6862",
      ...style,
    }}>{children}</div>
  );
}

export default async function HomePage() {
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
  const score = todayLog?.score ?? null;
  const yesterdayScore = (yesterday as { score?: number } | null)?.score ?? null;
  const delta = score != null && yesterdayScore != null ? score - yesterdayScore : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = (user!.email ?? "").split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div style={{
      background: "#111110",
      color: "#FAFAF8",
      minHeight: "100%",
      padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)",
      WebkitFontSmoothing: "antialiased",
      letterSpacing: "-0.005em",
    }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
          <img src="/word-fit-amber.png" alt="Fit" style={{ height: 14, display: "block" }} />
          <img src="/word-betta-amber.png" alt="Betta" style={{ height: 13, display: "block" }} />
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: "#1A1916",
          border: "1px solid #2a2826",
          display: "grid", placeItems: "center",
          fontSize: 12, fontWeight: 700, color: "#aaa69e",
          letterSpacing: "0.04em",
        }}>{initials}</div>
      </div>

      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.022em", lineHeight: 1.18 }}>
        {greeting},<br/>
        <span style={{ color: "#FAFAF8" }}>{name}.</span>
      </div>

      {/* Score */}
      <div style={{ marginTop: 28 }}>
        <Eyebrow>Your score today</Eyebrow>
        {score != null ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 6 }}>
              <div style={{ fontSize: 96, fontWeight: 700, color: "#E8622A", lineHeight: 0.92, letterSpacing: "-0.05em" }}>
                {score}
              </div>
              <div style={{ fontSize: 18, color: "#6B6862", fontWeight: 500, paddingBottom: 12 }}>/100</div>
            </div>
            {delta != null && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
                fontSize: 12, fontWeight: 600,
                color: delta >= 0 ? "#E8622A" : "#aaa69e",
                background: delta >= 0 ? "rgba(232,98,42,0.10)" : "rgba(255,255,255,0.05)",
                padding: "5px 10px", borderRadius: 999,
              }}>
                <span style={{ fontSize: 14 }}>{delta >= 0 ? "↑" : "↓"}</span>
                {Math.abs(delta)} vs yesterday
              </div>
            )}
          </>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 14, color: "#aaa69e", lineHeight: 1.5, marginBottom: 16 }}>
              {dayName}, {dateStr}. Log your morning check-in to get today&apos;s score.
            </div>
            <Link href="/check-in" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 20px",
              background: "#E8622A", color: "#110",
              borderRadius: 14, border: "none",
              fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700,
              textDecoration: "none",
            }}>
              Start morning check-in →
            </Link>
          </div>
        )}
      </div>

      {score != null && (
        <>
          <div style={{
            marginTop: 22,
            fontSize: 14, lineHeight: 1.5, color: "#aaa69e",
            paddingBottom: 18, borderBottom: "1px solid #2a2826",
          }}>
            {score >= 80
              ? "Strong day ahead. Keep the momentum going."
              : score >= 60
              ? "Solid foundation. Small wins this afternoon will push you higher."
              : "It's a recovery day. Light movement and good sleep will lift tomorrow's score."}
          </div>

          <Eyebrow style={{ marginTop: 18, marginBottom: 10 }}>For today</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { ic: "↗", t: "Log your meals", s: "Nutrition data improves your score accuracy.", href: "/food" },
              { ic: "◼", t: "Plan a workout", s: "AI picks the best move for today's score.", href: "/move" },
              { ic: "+", t: "Check weekly insights", s: "See what patterns are shaping your week.", href: "/insights" },
            ].map((a, i) => (
              <Link key={i} href={a.href} style={{
                background: "#1A1916",
                border: "1px solid #2a2826",
                borderRadius: 14,
                padding: "12px 14px",
                display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12,
                alignItems: "center",
                textDecoration: "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(232,98,42,0.12)", color: "#E8622A",
                  display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700,
                }}>{a.ic}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#FAFAF8" }}>{a.t}</div>
                  <div style={{ fontSize: 11.5, color: "#6B6862", marginTop: 2, lineHeight: 1.35 }}>{a.s}</div>
                </div>
                <div style={{ color: "#6B6862", fontSize: 18 }}>›</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
