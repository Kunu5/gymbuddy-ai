"use client";

import { useState, useEffect } from "react";
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

export default function FoodPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/meals")
      .then((r) => r.json())
      .then((d) => setMeals(d.meals ?? []))
      .finally(() => setFetching(false));
  }, []);

  async function handleLog() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: input }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to log meal");
      const { meal } = await res.json();
      setMeals((prev) => [meal, ...prev]);
      setInput("");
      setSuccess(`Logged! ${meal.ai_tag}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>Food Log</Eyebrow>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>What did you eat?</div>
        <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 6, lineHeight: 1.4 }}>Type it in plain English. AI tags the cognitive impact.</div>
      </div>

      {/* Input */}
      <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 16, padding: "14px 14px", marginBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 8 }}>Describe your meal</Eyebrow>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`"Eggs, toast, and a coffee" or "Salad with grilled chicken and a Diet Coke"`}
          rows={3}
          style={{
            width: "100%", background: "transparent",
            border: "none", outline: "none",
            color: "#FAFAF8", fontSize: 14, lineHeight: 1.5,
            fontFamily: "var(--font-sans)", resize: "none",
          }}
        />
        <button
          onClick={handleLog}
          disabled={loading || !input.trim()}
          style={{
            marginTop: 8, width: "100%", padding: "13px 16px",
            background: loading || !input.trim() ? "rgba(232,98,42,0.4)" : "#E8622A",
            color: "#110", border: "none", borderRadius: 12,
            fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analysing…" : "Log meal →"}
        </button>
      </div>

      {success && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 12,
          background: "rgba(124,199,133,0.10)", border: "1px solid rgba(124,199,133,0.25)",
          fontSize: 13, color: "#7cc785", fontWeight: 600,
        }}>
          ✓ {success}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 13, color: "oklch(0.70 0.21 25)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>{error}</div>
      )}

      {/* Recent meals */}
      <Eyebrow style={{ marginTop: 10, marginBottom: 10 }}>Recent</Eyebrow>

      {fetching ? (
        <div style={{ fontSize: 13, color: "#6B6862" }}>Loading…</div>
      ) : meals.length === 0 ? (
        <div style={{ fontSize: 13, color: "#6B6862" }}>No meals logged yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {meals.map((m) => {
            const pos = m.ai_tag_kind === "positive";
            const warn = m.ai_tag_kind === "warn";
            const timeStr = new Date(m.logged_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
            const dateStr = new Date(m.logged_at).toLocaleDateString("en-US", { weekday: "short" });
            const isToday = new Date(m.logged_at).toDateString() === new Date().toDateString();
            const label = isToday ? timeStr : `${dateStr} ${timeStr}`;

            return (
              <div key={m.id} style={{
                background: "#1A1916", border: "1px solid #2a2826",
                borderRadius: 14, padding: "11px 14px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginRight: 8, color: "#FAFAF8" }}>
                    {m.items.map((i) => i.name).join(", ") || m.raw_input || "Meal"}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#6B6862", whiteSpace: "nowrap" }}>{label}</div>
                </div>
                {m.ai_tag && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 999, alignSelf: "flex-start",
                    background: pos ? "rgba(124,199,133,0.10)" : warn ? "rgba(232,160,42,0.10)" : "rgba(255,255,255,0.05)",
                    color: pos ? "#7cc785" : warn ? "#E8A02A" : "#aaa69e",
                    fontSize: 11, fontWeight: 700,
                    border: `1px solid ${pos ? "rgba(124,199,133,0.25)" : warn ? "rgba(232,160,42,0.25)" : "rgba(255,255,255,0.08)"}`,
                  }}>
                    {pos ? "✓" : warn ? "⚠" : "·"} {m.ai_tag}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
