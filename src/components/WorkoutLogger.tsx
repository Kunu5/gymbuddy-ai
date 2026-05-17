"use client";

import { useRef, useState } from "react";
import AICaptureCard from "@/components/AICaptureCard";
import SessionCard from "@/components/SessionCard";
import type { WorkoutSession } from "@/types/workout";
import type { CoachAnalysis } from "@/types/coach";

interface Props {
  initialSessions: WorkoutSession[];
  onCoachUpdate?: (analysis: CoachAnalysis) => void;
}

export default function WorkoutLogger({ initialSessions, onCoachUpdate }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>(initialSessions);
  const [isListening, setIsListening] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const recognitionRef = useRef<unknown>(null);

  const allGroups = Array.from(new Set(
    sessions.flatMap((s) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = s as any;
      return (raw.muscle_groups ?? raw.muscleGroups ?? []) as string[];
    })
  )).sort();

  const displayed = filterGroup
    ? sessions.filter((s) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = s as any;
        const groups: string[] = raw.muscle_groups ?? raw.muscleGroups ?? [];
        return groups.includes(filterGroup);
      })
    : sessions;

  function toggleVoice() {
    if (isListening) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setIsListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice input is not supported in this browser."); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const t = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${t}` : t));
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
    try {
      const res = await fetch("/api/parse-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to log workout");
      }
      const { session, coachAnalysis } = await res.json();
      setSessions((prev) => [session, ...prev]);
      setInput("");
      if (coachAnalysis && onCoachUpdate) onCoachUpdate(coachAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <AICaptureCard
        value={input}
        onChange={setInput}
        onLog={handleLog}
        onToggleVoice={toggleVoice}
        isListening={isListening}
        loading={loading}
      />

      {error && <p style={{ fontSize: 13, color: 'var(--destructive)' }}>{error}</p>}

      {sessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Section header + filter chips */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="eyebrow">Recent</div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 2 }}>
                Past sessions
                <span className="metric" style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted-foreground)', marginLeft: 8 }}>
                  {sessions.length}
                </span>
              </div>
            </div>
            {allGroups.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allGroups.map((g) => (
                  <button key={g} onClick={() => setFilterGroup(filterGroup === g ? null : g)} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                    padding: '5px 10px', borderRadius: 999,
                    background: filterGroup === g ? 'var(--primary-soft)' : 'transparent',
                    color: filterGroup === g ? 'var(--primary)' : 'var(--muted-foreground)',
                    border: `1px solid ${filterGroup === g ? 'color-mix(in oklab, var(--primary) 30%, transparent)' : 'var(--border)'}`,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    cursor: 'pointer', transition: 'background 100ms, color 100ms',
                  }}>
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {displayed.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>No sessions match that filter.</p>
          ) : (
            displayed.map((session) => (
              <SessionCard key={session.id} session={session} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
