import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 10,
      letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862",
      ...style,
    }}>{children}</div>
  );
}

const TYPES = [
  { id: "walk", name: "Walk", ic: "↗" },
  { id: "strength", name: "Strength", ic: "◼" },
  { id: "run", name: "Run", ic: "↑" },
  { id: "yoga", name: "Yoga", ic: "◯" },
  { id: "cycle", name: "Cycle", ic: "⊙" },
  { id: "stretch", name: "Stretch", ic: "∼" },
];

export default async function MovePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: rawSessions } = await supabase
    .from("workout_sessions")
    .select("title, date, duration_minutes, muscle_groups, exercises")
    .eq("user_id", user!.id)
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false })
    .limit(10);

  const sessions = rawSessions ?? [];

  let recommendation: { title: string; description: string; duration_minutes: number; type: string } | null = null;
  let recError = false;

  if (sessions.length > 0) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/move/recommend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessions }),
          cache: "no-store",
        }
      );
      if (res.ok) recommendation = await res.json();
    } catch {
      recError = true;
    }
  }

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>Move</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#6B6862", fontFamily: "var(--font-mono)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8622A", display: "inline-block" }} />
          Groq · Llama 3.3
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>What to move.</div>
        <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 6, lineHeight: 1.4 }}>Tuned to your last 7 days.</div>
      </div>

      {/* AI recommendation */}
      {recommendation ? (
        <div style={{
          background: "linear-gradient(180deg, rgba(232,98,42,0.08) 0%, rgba(232,98,42,0.02) 100%)",
          border: "1px solid rgba(232,98,42,0.35)",
          borderRadius: 18, padding: 16,
          display: "flex", flexDirection: "column", gap: 14,
          marginBottom: 22,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em",
              textTransform: "uppercase" as const, color: "#E8622A",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8622A" }} />
              Recommended
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              {recommendation.title}
            </div>
            <div style={{ fontSize: 13, color: "#aaa69e", marginTop: 6, lineHeight: 1.45 }}>
              {recommendation.description}
            </div>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 2, paddingTop: 10, borderTop: "1px solid rgba(232,98,42,0.18)",
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#6B6862", fontFamily: "var(--font-mono)" }}>Duration</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{recommendation.duration_minutes} min</div>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#6B6862", fontFamily: "var(--font-mono)" }}>Type</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, textTransform: "capitalize" as const }}>{recommendation.type}</div>
            </div>
          </div>
          <Link href="/workout" style={{
            padding: "11px 12px",
            background: "#E8622A", color: "#110",
            border: "none", borderRadius: 12,
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
            textDecoration: "none", textAlign: "center",
          }}>
            Log this workout →
          </Link>
        </div>
      ) : sessions.length === 0 ? (
        <div style={{
          background: "#1A1916", border: "1px solid #2a2826",
          borderRadius: 18, padding: 16, marginBottom: 22,
          fontSize: 14, color: "#aaa69e", lineHeight: 1.5,
        }}>
          Log a few workouts first and AI will recommend what to do next based on your recent history.
        </div>
      ) : (
        <div style={{
          background: "#1A1916", border: "1px solid #2a2826",
          borderRadius: 18, padding: 16, marginBottom: 22,
          fontSize: 14, color: "#aaa69e",
        }}>
          {recError ? "Couldn't generate a recommendation right now. Try again." : "Generating recommendation…"}
        </div>
      )}

      {/* Manual log */}
      <Eyebrow style={{ marginBottom: 10 }}>Log something</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
        {TYPES.map((t, i) => (
          <Link key={t.id} href="/workout" style={{
            background: i === 0 ? "rgba(232,98,42,0.08)" : "#1A1916",
            border: `1px solid ${i === 0 ? "rgba(232,98,42,0.4)" : "#2a2826"}`,
            borderRadius: 12, padding: "10px 8px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            textDecoration: "none",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: i === 0 ? "#E8622A" : "rgba(255,255,255,0.04)",
              color: i === 0 ? "#110" : "#aaa69e",
              display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700,
            }}>{t.ic}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? "#FAFAF8" : "#aaa69e" }}>{t.name}</div>
          </Link>
        ))}
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>Last few</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sessions.slice(0, 5).map((s, i) => (
              <div key={i} style={{
                background: "#1A1916", border: "1px solid #2a2826",
                borderRadius: 12, padding: "10px 12px",
                display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 10, alignItems: "center",
              }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#6B6862", letterSpacing: "0.04em" }}>
                  {new Date(s.date).toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#FAFAF8" }}>{s.title}</div>
                </div>
                {s.duration_minutes && (
                  <div style={{ fontSize: 11, color: "#aaa69e", fontFamily: "var(--font-mono)" }}>{s.duration_minutes}m</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
