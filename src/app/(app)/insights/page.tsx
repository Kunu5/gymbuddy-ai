import { createClient } from "@/lib/supabase/server";
import type { WeeklyReport, WeeklyInsight } from "@/types/insight";

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 10,
      letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862",
      ...style,
    }}>{children}</div>
  );
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function InsightCard({ insight, index }: { insight: WeeklyInsight; index: number }) {
  return (
    <div style={{
      background: "#1A1916", border: "1px solid #2a2826",
      borderRadius: 16, padding: "16px 16px 14px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Eyebrow>{`0${index + 1} · ${insight.tag}`}</Eyebrow>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.22 }}>
        {insight.headline}
      </div>
      <div style={{ fontSize: 12.5, color: "#aaa69e", lineHeight: 1.5 }}>{insight.body}</div>
      <div style={{
        marginTop: 4, paddingTop: 12,
        borderTop: "1px solid #2a2826",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{
            fontSize: insight.stat.big ? 28 : 22, fontWeight: 700,
            color: "#E8622A", letterSpacing: "-0.03em", lineHeight: 1,
          }}>{insight.stat.val}</div>
          <div style={{ fontSize: 11, color: "#6B6862" }}>{insight.stat.label}</div>
        </div>
        {insight.sample_size && (
          <div style={{ fontSize: 11, color: "#6B6862", fontFamily: "var(--font-mono)" }}>n = {insight.sample_size}d</div>
        )}
      </div>
    </div>
  );
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekLabel = `${new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const { data: report } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", user!.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  const weeklyReport = report as WeeklyReport | null;
  const insights: WeeklyInsight[] = weeklyReport?.insights ?? [];

  const { data: logCount } = await supabase
    .from("daily_logs")
    .select("id", { count: "exact" })
    .eq("user_id", user!.id)
    .gte("date", weekStart);

  const daysLogged = (logCount as Array<{ id: string }> | null)?.length ?? 0;

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>{weekLabel}</Eyebrow>
        {insights.length > 0 && (
          <div style={{
            padding: "5px 10px", borderRadius: 999,
            background: "rgba(232,98,42,0.10)", color: "#E8622A",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
            fontFamily: "var(--font-mono)",
          }}>{insights.length} NEW</div>
        )}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>Your week.</div>
        <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 6, lineHeight: 1.4 }}>
          {insights.length > 0 ? "Here's what the data found." : "Log more days to unlock patterns."}
        </div>
      </div>

      {insights.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} index={i} />
          ))}
        </div>
      ) : (
        <div>
          <div style={{
            background: "#1A1916", border: "1px solid #2a2826",
            borderRadius: 16, padding: 20, marginBottom: 16,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {daysLogged >= 3 ? "Generating your insights…" : `${daysLogged} of 7 days logged this week`}
            </div>
            <div style={{ fontSize: 13, color: "#aaa69e", lineHeight: 1.5 }}>
              {daysLogged >= 3
                ? "Your weekly report is being prepared. Check back soon."
                : `Log ${7 - daysLogged} more day${7 - daysLogged !== 1 ? "s" : ""} to unlock pattern detection. Insights appear after 7 days of check-ins.`}
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "#2a2826", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(daysLogged / 7) * 100}%`, background: "#E8622A", borderRadius: 999, transition: "width 0.3s" }} />
            </div>
          </div>

          {[
            { tag: "Sleep", headline: "Does sleep under 6 hours tank your focus?", body: "Log 7 days to find out." },
            { tag: "Caffeine", headline: "When is caffeine helping vs. hurting?", body: "Timing data unlocks after a week." },
            { tag: "Stress", headline: "How does stress carry into the next day?", body: "Log stress daily to detect the pattern." },
          ].map((placeholder, i) => (
            <div key={i} style={{
              background: "#1A1916", border: "1px solid #2a2826",
              borderRadius: 16, padding: "16px 16px 14px",
              display: "flex", flexDirection: "column", gap: 10, marginBottom: 8,
              opacity: 0.5,
            }}>
              <Eyebrow>{`0${i + 1} · ${placeholder.tag}`}</Eyebrow>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.22 }}>{placeholder.headline}</div>
              <div style={{ fontSize: 12.5, color: "#aaa69e", lineHeight: 1.5 }}>{placeholder.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
