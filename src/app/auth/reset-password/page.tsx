"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash; exchanging it sets the session
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
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
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 36 }}>
        <img src="/word-fit-amber.png" alt="Fit" style={{ height: 18, display: "block" }} />
        <img src="/word-betta-amber.png" alt="Betta" style={{ height: 17, display: "block" }} />
      </div>

      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862", marginBottom: 10 }}>
          Reset password
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Set a new password.
        </div>
      </div>

      {done ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 8 }}>Done</div>
            <div style={{ fontSize: 14, color: "#FAFAF8", lineHeight: 1.5 }}>
              Your password has been updated. You can now log in.
            </div>
          </div>
          <a
            href="/auth/login"
            style={{
              padding: "14px 16px", background: "#E8622A", color: "#110", borderRadius: 12,
              fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              textDecoration: "none",
            }}
          >Go to log in →</a>
        </div>
      ) : !ready ? (
        <div style={{ fontSize: 13, color: "#6B6862", lineHeight: 1.6 }}>
          Waiting for verification… make sure you opened this link from the reset email.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...inputStyle, position: "relative" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6B6862", letterSpacing: "0.16em", textTransform: "uppercase" as const }}>
              New password
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
            {loading ? "Updating…" : <>Update password <span style={{ fontSize: 16 }}>→</span></>}
          </button>
        </form>
      )}
    </main>
  );
}
