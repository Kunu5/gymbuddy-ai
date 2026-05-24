"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Scale({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const active = n === value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: 30,
              display: "grid", placeItems: "center",
              borderRadius: 8,
              background: active ? "#E8622A" : "transparent",
              border: `1px solid ${active ? "#E8622A" : "#2a2826"}`,
              color: active ? "#110" : n <= value ? "#aaa69e" : "#6B6862",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}
          >{n}</button>
        );
      })}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[{ label: "Yes", val: true }, { label: "No", val: false }].map(({ label, val }) => {
        const active = value === val;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(val)}
            style={{
              flex: 1, padding: "10px 0",
              textAlign: "center",
              borderRadius: 10,
              background: active ? "#E8622A" : "transparent",
              border: `1px solid ${active ? "#E8622A" : "#2a2826"}`,
              color: active ? "#110" : "#aaa69e",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >{label}</button>
        );
      })}
    </div>
  );
}

function Row({ label, right, children }: { label: string; right?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#1A1916", border: "1px solid #2a2826",
      borderRadius: 14, padding: "12px 14px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#FAFAF8" }}>{label}</div>
        {right && <div style={{ fontSize: 12, fontWeight: 700, color: "#E8622A" }}>{right}</div>}
      </div>
      {children}
    </div>
  );
}

export default function CheckInPage() {
  const router = useRouter();
  const [sleepHours, setSleepHours] = useState(7.5);
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [stress, setStress] = useState(5);
  const [caffeine, setCaffeine] = useState(0);
  const [exercised, setExercised] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (exercised === null) { setError("Please answer the exercise question."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleep_hours: sleepHours,
          energy,
          focus,
          stress,
          caffeine_mg: caffeine,
          exercised,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      router.push("/score");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 120px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862" }}>
          Morning check-in
        </div>
        <div style={{ fontSize: 12, color: "#6B6862", fontFamily: "var(--font-mono)" }}>
          {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>Morning check-in</div>
        <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 6, lineHeight: 1.4 }}>Takes 2 minutes.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Sleep */}
        <Row label="Sleep" right={`${sleepHours}h`}>
          <input
            type="range" min={4} max={10} step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#E8622A" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6B6862", fontFamily: "var(--font-mono)" }}>
            <span>4h</span><span>6h</span><span>8h</span><span>10h</span>
          </div>
        </Row>

        <Row label="Energy" right={`${energy} / 10`}>
          <Scale value={energy} onChange={setEnergy} />
        </Row>

        <Row label="Focus" right={`${focus} / 10`}>
          <Scale value={focus} onChange={setFocus} />
        </Row>

        <Row label="Stress" right={`${stress} / 10`}>
          <Scale value={stress} onChange={setStress} />
        </Row>

        <Row label="Caffeine today (mg)">
          <input
            type="number" min={0} max={1000} step={50}
            value={caffeine}
            onChange={(e) => setCaffeine(Number(e.target.value))}
            placeholder="0"
            style={{
              width: "100%", background: "#111110",
              border: "1px solid #2a2826", borderRadius: 8,
              color: "#FAFAF8", fontSize: 14, padding: "8px 10px",
              fontFamily: "var(--font-mono)",
            }}
          />
          <div style={{ fontSize: 11, color: "#6B6862" }}>Coffee ≈ 95mg · espresso ≈ 63mg · energy drink ≈ 80–160mg</div>
        </Row>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Row label="Exercise today?">
            <YesNo value={exercised} onChange={setExercised} />
          </Row>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "oklch(0.70 0.21 25)", marginTop: 12, fontFamily: "var(--font-mono)" }}>{error}</p>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "17px 20px",
            background: loading ? "rgba(232,98,42,0.5)" : "#E8622A",
            color: "#110", border: "none", borderRadius: 16,
            fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading ? "Calculating…" : <>See my score <span style={{ fontSize: 18 }}>→</span></>}
        </button>
      </div>
    </div>
  );
}
