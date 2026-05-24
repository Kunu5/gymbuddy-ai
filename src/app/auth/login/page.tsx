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
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Beta mode
  const [betaMode, setBetaMode] = useState(false);
  const [betaName, setBetaName] = useState("");
  const [betaKey, setBetaKey] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (forgotMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setLoading(false);
      if (error) setError(error.message);
      else setResetSent(true);
      return;
    }

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

  async function handleBetaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/beta-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: betaName, key: betaKey }),
    });

    const data = await res.json();

    if (!res.ok || !data.valid) {
      setError(data.error ?? "Invalid beta key");
      setLoading(false);
      return;
    }

    // Sign in using derived credentials
    const normalizedKey = betaKey.trim().toUpperCase();
    const derivedEmail = `beta-${normalizedKey.toLowerCase()}@fitbetta-beta.app`;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: derivedEmail,
      password: normalizedKey,
    });

    if (signInError) {
      setError(signInError.message);
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
      {/* Brand + BETA badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <img src="/word-fit-amber.png" alt="Fit" style={{ height: 18, display: "block" }} />
          <img src="/word-betta-amber.png" alt="Betta" style={{ height: 17, display: "block" }} />
        </div>
        <button
          type="button"
          onClick={() => { setBetaMode(!betaMode); setError(null); }}
          style={{
            padding: "5px 10px",
            background: betaMode ? "#E8622A" : "rgba(232,98,42,0.12)",
            border: "1px solid rgba(232,98,42,0.35)",
            borderRadius: 8,
            fontFamily: "var(--font-mono)", fontSize: 9,
            fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: betaMode ? "#110" : "#E8622A",
            cursor: "pointer",
          }}
        >
          Beta
        </button>
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

      {/* ── BETA MODE ── */}
      {betaMode ? (
        <form onSubmit={handleBetaSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            background: "rgba(232,98,42,0.06)", border: "1px solid rgba(232,98,42,0.2)",
            borderRadius: 12, padding: "12px 14px", marginBottom: 4,
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#E8622A", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 4 }}>
              Beta access
            </div>
            <div style={{ fontSize: 12.5, color: "#aaa69e", lineHeight: 1.5 }}>
              Enter the name and key associated with your invite.
            </div>
          </div>

          {/* Name */}
          <div style={inputStyle}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const }}>
              Your name
            </div>
            <input
              type="text"
              value={betaName}
              onChange={(e) => setBetaName(e.target.value)}
              required
              placeholder="e.g. Kunal"
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#FAFAF8", fontSize: 14, fontWeight: 500,
                fontFamily: "var(--font-sans)", padding: 0,
              }}
            />
          </div>

          {/* Beta key */}
          <div style={inputStyle}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const }}>
              Beta key
            </div>
            <input
              type="text"
              value={betaKey}
              onChange={(e) => setBetaKey(e.target.value)}
              required
              placeholder="e.g. BETTA-2025"
              autoCapitalize="characters"
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#FAFAF8", fontSize: 14, fontWeight: 500,
                fontFamily: "var(--font-mono)", padding: 0, letterSpacing: "0.06em",
              }}
            />
          </div>

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
            {loading ? "Checking…" : <>Enter beta <span style={{ fontSize: 16 }}>→</span></>}
          </button>

          <button
            type="button"
            onClick={() => { setBetaMode(false); setError(null); }}
            style={{
              background: "none", border: "none", padding: 0,
              fontSize: 12, color: "#6B6862", cursor: "pointer",
              fontFamily: "var(--font-sans)", textAlign: "center",
            }}
          >← Back to sign in</button>
        </form>
      ) : (
        <>
          {/* Tab toggle — hidden in forgot mode */}
          {!forgotMode && (
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
          )}

          {/* Forgot password — success state */}
          {forgotMode && resetSent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 12, padding: "18px 16px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 8 }}>Check your inbox</div>
                <div style={{ fontSize: 14, color: "#FAFAF8", lineHeight: 1.5 }}>
                  We sent a reset link to <strong>{email}</strong>. Tap it to set a new password.
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setForgotMode(false); setResetSent(false); setError(null); }}
                style={{
                  padding: "14px 16px", background: "#E8622A", color: "#110", border: "none", borderRadius: 12,
                  fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}
              >Back to log in</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {forgotMode && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 4 }}>
                  Reset password
                </div>
              )}

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

              {/* Password — hidden in forgot mode */}
              {!forgotMode && (
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
              )}

              {/* Forgot password link — only on login tab */}
              {!isSignUp && !forgotMode && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(null); }}
                    style={{
                      background: "none", border: "none", padding: 0,
                      fontSize: 11, color: "#6B6862", cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >Forgot password?</button>
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
                {loading ? "Loading…" : forgotMode ? <>Send reset link <span style={{ fontSize: 16 }}>→</span></> : isSignUp ? <>Create account <span style={{ fontSize: 16 }}>→</span></> : <>Sign in <span style={{ fontSize: 16 }}>→</span></>}
              </button>

              {forgotMode && (
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError(null); }}
                  style={{
                    background: "none", border: "none", padding: 0,
                    fontSize: 12, color: "#6B6862", cursor: "pointer",
                    fontFamily: "var(--font-sans)", textAlign: "center",
                  }}
                >← Back to log in</button>
              )}
            </form>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#2a2826" }} />
            <div style={{ fontSize: 10, color: "#6B6862", fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}>OR</div>
            <div style={{ flex: 1, height: 1, background: "#2a2826" }} />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}
            style={{
              padding: "13px 16px",
              background: "transparent", border: "1px solid #2a2826",
              borderRadius: 12, color: "#FAFAF8",
              fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </>
      )}

      <div style={{ marginTop: "auto", fontSize: 10.5, color: "#6B6862", lineHeight: 1.5, textAlign: "center", paddingTop: 20 }}>
        By continuing you agree to our{" "}
        <span style={{ color: "#aaa69e" }}>Terms</span> and{" "}
        <span style={{ color: "#aaa69e" }}>Privacy Policy</span>.
      </div>
    </main>
  );
}
