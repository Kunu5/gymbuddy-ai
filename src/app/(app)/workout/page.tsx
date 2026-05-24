"use client";

import { useState, useEffect, useRef } from "react";
import type { WorkoutSession, Exercise } from "@/types/workout";

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 10,
      letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#6B6862",
      ...style,
    }}>{children}</div>
  );
}

export default function WorkoutPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [fetching, setFetching] = useState(true);
  const [lastParsed, setLastParsed] = useState<WorkoutSession | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    fetch("/api/parse-workout", { method: "GET" })
      .then((r) => r.ok ? r.json() : { sessions: [] })
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  function toggleVoice() {
    if (isListening) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setIsListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice input not supported in this browser."); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const t = e.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${t}` : t);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  async function handleLog() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setLastParsed(null);
    try {
      const res = await fetch("/api/parse-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to log workout");
      const { session } = await res.json();
      setSessions((prev) => [session, ...prev]);
      setLastParsed(session);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const muscleGroups = lastParsed
    ? Array.from(new Set([
        ...(lastParsed.muscleGroups ?? []),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...((lastParsed as any).muscle_groups ?? []),
      ]))
    : [];

  return (
    <div style={{
      background: "#111110", color: "#FAFAF8",
      minHeight: "100%", padding: "58px 20px 20px",
      fontFamily: "var(--font-sans)", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>Workout · Log</Eyebrow>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 10, color: "#6B6862", fontFamily: "var(--font-mono)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8622A", display: "inline-block" }} />
          Groq · Llama 3.3
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>Log a workout.</div>
        <div style={{ fontSize: 14, color: "#aaa69e", marginTop: 6, lineHeight: 1.4 }}>Speak or type. AI structures it.</div>
      </div>

      {/* Input card */}
      <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 16, padding: "14px", marginBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 8 }}>Describe your workout</Eyebrow>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`"4 sets bench at 80kg 8 reps, then 3x12 pull-ups, 20 min run"`}
          rows={3}
          style={{
            width: "100%", background: "transparent",
            border: "none", outline: "none",
            color: "#FAFAF8", fontSize: 14, lineHeight: 1.5,
            fontFamily: "var(--font-sans)", resize: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={toggleVoice}
            style={{
              padding: "11px 14px",
              background: isListening ? "rgba(232,98,42,0.15)" : "transparent",
              border: `1px solid ${isListening ? "rgba(232,98,42,0.5)" : "#2a2826"}`,
              borderRadius: 12,
              color: isListening ? "#E8622A" : "#aaa69e",
              fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>
            </svg>
            {isListening ? "Listening…" : "Voice"}
          </button>
          <button
            onClick={handleLog}
            disabled={loading || !input.trim()}
            style={{
              flex: 1, padding: "11px 12px",
              background: loading || !input.trim() ? "rgba(232,98,42,0.4)" : "#E8622A",
              color: "#110", border: "none", borderRadius: 12,
              fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Parsing…" : "Log workout →"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "oklch(0.70 0.21 25)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>{error}</div>
      )}

      {/* Last parsed result */}
      {lastParsed && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Eyebrow>Just logged</Eyebrow>
            <div style={{
              fontSize: 9, fontFamily: "var(--font-mono)",
              color: "#E8622A", letterSpacing: "0.1em",
              padding: "2px 6px", borderRadius: 4,
              background: "rgba(232,98,42,0.10)",
              border: "1px solid rgba(232,98,42,0.25)",
            }}>PARSED</div>
          </div>
          <div style={{ background: "#1A1916", border: "1px solid #2a2826", borderRadius: 14, overflow: "hidden" }}>
            {lastParsed.exercises.map((e: Exercise, i: number) => (
              <div key={i} style={{
                padding: "11px 14px",
                borderTop: i ? "1px solid #2a2826" : "none",
                display: "grid", gridTemplateColumns: "1fr auto", gap: 6,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: "#6B6862", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
                    {[e.sets && `${e.sets}×`, e.reps && `${e.reps}`, e.weight && `${e.weight}${e.weightUnit ?? ""}`].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {muscleGroups.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {muscleGroups.map((g: string) => (
                <span key={g} style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 999,
                  background: "rgba(232,98,42,0.10)", color: "#E8622A",
                  fontFamily: "var(--font-mono)", border: "1px solid rgba(232,98,42,0.25)",
                }}>{g}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>Recent</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sessions.slice(0, 10).map((s) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const raw = s as any;
              const groups: string[] = raw.muscle_groups ?? raw.muscleGroups ?? [];
              return (
                <div key={s.id} style={{
                  background: "#1A1916", border: "1px solid #2a2826",
                  borderRadius: 12, padding: "10px 12px",
                  display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FAFAF8" }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#6B6862", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                      {s.date} · {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      {s.durationMinutes ? ` · ${s.durationMinutes}m` : ""}
                    </div>
                    {groups.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                        {groups.slice(0, 3).map((g) => (
                          <span key={g} style={{
                            fontSize: 10, padding: "2px 6px", borderRadius: 999,
                            background: "rgba(232,98,42,0.08)", color: "#E8622A",
                            fontFamily: "var(--font-mono)",
                          }}>{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {fetching && !sessions.length && (
        <div style={{ fontSize: 13, color: "#6B6862" }}>Loading history…</div>
      )}
    </div>
  );
}
