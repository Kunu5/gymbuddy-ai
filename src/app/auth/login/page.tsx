"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/home";
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1A1916",
    border: "1px solid #2a2826",
    borderRadius: 12,
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    boxSizing: "border-box",
  };

  return (
    <main style={{
      minHeight: "100vh", background: "#111110", color: "#FAFAF8",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
      display: "flex", flexDirection: "column",
      padding: "70px 24px 40px",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 36 }}>
        <img src="/word-fit-amber.png" alt="Fit" style={{ height: 18, display: "block" }} />
        <img src="/word-betta-amber.png" alt="Betta" style={{ height: 17, display: "block" }} />
      </div>

      {/* Hero copy */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862", marginBottom: 10 }}>
          Welcome
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 10 }}>
          Know why you feel <br />the way you feel.
        </div>
        <div style={{ fontSize: 13, color: "#aaa69e", lineHeight: 1.5 }}>
          A two-minute morning check-in. One number that explains your day.
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: "#1A1916", border: "1px solid #2a2826",
        borderRadius: 12, padding: 4, marginBottom: 14,
      }}>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setError(null); }}
          style={{
            padding: "9px 0", textAlign: "center",
            background: isSignUp ? "#E8622A" : "transparent",
            color: isSignUp ? "#110" : "#aaa69e",
            borderRadius: 9, border: "none",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >Sign up</button>
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setError(null); }}
          style={{
            padding: "9px 0", textAlign: "center",
            background: !isSignUp ? "#E8622A" : "transparent",
            color: !isSignUp ? "#110" : "#aaa69e",
            borderRadius: 9, border: "none",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >Log in</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Email */}
        <div style={inputStyle}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const }}>
            Email
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "#FAFAF8", fontSize: 14, fontWeight: 500,
              fontFamily: "var(--font-sans)", padding: 0,
            }}
          />
        </div>

        {/* Password */}
        <div style={{ ...inputStyle, position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const }}>
            Password
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••"
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "#FAFAF8", fontSize: 14, fontWeight: 500,
              fontFamily: "var(--font-sans)", padding: 0, paddingRight: 28,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: 14, bottom: 10,
              background: "none", border: "none", color: "#6B6862", cursor: "pointer",
              display: "grid", placeItems: "center", padding: 0,
            }}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {!isSignUp && (
          <div style={{ fontSize: 11, color: "#6B6862", lineHeight: 1.4 }}>
            At least 8 characters.
          </div>
        )}

        {error && (
          <p style={{ fontSize: 13, color: "oklch(0.70 0.21 25)", fontFamily: "var(--font-mono)", margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 6, padding: "14px 16px",
            background: loading ? "rgba(232,98,42,0.5)" : "#E8622A",
            color: "#110", border: "none", borderRadius: 12,
            fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading…" : isSignUp ? <>Create account <span style={{ fontSize: 16 }}>→</span></> : <>Sign in <span style={{ fontSize: 16 }}>→</span></>}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#2a2826" }} />
        <div style={{ fontSize: 10, color: "#6B6862", fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}>OR</div>
        <div style={{ flex: 1, height: 1, background: "#2a2826" }} />
      </div>

      {/* Apple SSO stub */}
      <button
        type="button"
        onClick={() => alert("Apple Sign In coming soon.")}
        style={{
          padding: "13px 16px",
          background: "transparent", border: "1px solid #2a2826",
          borderRadius: 12, color: "#FAFAF8",
          fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 13.3c0-2 1.6-3 1.7-3-0.9-1.4-2.4-1.6-2.9-1.6-1.3-0.1-2.5 0.8-3.1 0.8-0.7 0-1.7-0.8-2.7-0.7-1.4 0-2.7 0.8-3.4 2.1-1.5 2.6-0.4 6.4 1 8.5 0.7 1 1.6 2.1 2.7 2.1 1.1 0 1.5-0.7 2.8-0.7 1.3 0 1.7 0.7 2.8 0.7 1.2 0 1.9-1 2.7-2.1 0.8-1.1 1.1-2.1 1.1-2.2-0.1 0-2.1-0.8-2.1-3.1z M15.3 6.6c0.6-0.7 1-1.7 0.9-2.6-0.9 0-2 0.6-2.6 1.3-0.5 0.6-1 1.6-0.9 2.6 1 0.1 2-0.6 2.6-1.3z"/>
        </svg>
        Continue with Apple
      </button>

      <div style={{ marginTop: "auto", fontSize: 10.5, color: "#6B6862", lineHeight: 1.5, textAlign: "center", paddingTop: 20 }}>
        By continuing you agree to our{" "}
        <span style={{ color: "#aaa69e" }}>Terms</span> and{" "}
        <span style={{ color: "#aaa69e" }}>Privacy Policy</span>.
      </div>
    </main>
  );
}
