import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/home");

  return (
    <main style={{
      minHeight: "100vh", background: "#111110", color: "#FAFAF8",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
      overflowX: "hidden",
    }}>
      {/* Amber halo */}
      <div style={{
        position: "fixed", inset: "0 0 auto 0", height: 480, pointerEvents: "none",
        background: "radial-gradient(60% 60% at 50% 0%, rgba(232,98,42,0.12) 0%, transparent 70%)",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 420, margin: "0 auto", padding: "0 24px" }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
            <img src="/word-fit-amber.png" alt="Fit" style={{ height: 16, display: "block" }} />
            <img src="/word-betta-amber.png" alt="Betta" style={{ height: 15, display: "block" }} />
          </div>
          <Link href="/auth/login" style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "#6B6862",
            textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none",
          }}>
            Sign in →
          </Link>
        </nav>

        {/* Hero */}
        <div style={{ paddingTop: 48, paddingBottom: 64 }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.16em", textTransform: "uppercase", color: "#E8622A",
            marginBottom: 12,
          }}>Cognitive performance</div>

          <h1 style={{
            fontSize: "clamp(48px, 12vw, 64px)", lineHeight: 0.97,
            fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 20px",
          }}>
            Know why you feel<br/>
            <span style={{ color: "#E8622A" }}>the way</span><br/>
            you feel.
          </h1>

          <p style={{ color: "#aaa69e", fontSize: 15, lineHeight: 1.6, marginBottom: 36, maxWidth: 320 }}>
            A two-minute morning check-in. One number that explains your day. Patterns that tell you what to change.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/auth/login?signup=1" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              height: 52, borderRadius: 16,
              background: "#E8622A", color: "#110",
              fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700,
              textDecoration: "none",
            }}>
              Create your account →
            </Link>
            <Link href="/auth/login" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 52, borderRadius: 16,
              border: "1px solid #2a2826",
              background: "transparent", color: "#aaa69e",
              fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500,
              textDecoration: "none",
            }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature trio */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 48 }}>
          {[
            { label: "Check-in", sub: "Two minutes every morning. Sleep, energy, stress, caffeine." },
            { label: "Score",    sub: "One number from 1–100. Explains your cognitive state for the day." },
            { label: "Insights", sub: "Weekly patterns. What tanks your focus. What lifts it." },
            { label: "Move",     sub: "AI picks the right workout based on your last 7 days of data." },
            { label: "Food",     sub: "Log meals. AI tags each one: boosts focus, brain fog, neutral." },
          ].map((f) => (
            <div key={f.label} style={{
              background: "#1A1916", border: "1px solid #2a2826",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "#E8622A",
                marginBottom: 6,
              }}>{f.label}</div>
              <p style={{ fontSize: 13.5, color: "#aaa69e", margin: 0, lineHeight: 1.5 }}>{f.sub}</p>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10,
          color: "#3f3d39", textTransform: "uppercase", letterSpacing: "0.12em",
          paddingBottom: 32,
        }}>
          Powered by Groq · Llama 3.3
        </div>
      </div>
    </main>
  );
}
