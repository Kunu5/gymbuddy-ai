"use client";

import { useRef, useState } from "react";
import { Mic, MicOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  // Collect all unique muscle groups from session history
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
    if (!SR) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
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

      if (coachAnalysis && onCoachUpdate) {
        onCoachUpdate(coachAnalysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log a Workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="e.g. 'Did 4 sets of bench press at 80kg for 8 reps, then 3x12 dumbbell rows at 25kg, finished with a 20 min run'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="resize-none pr-12"
            />
            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? "Stop recording" : "Speak your workout"}
              className={`absolute bottom-3 right-3 p-1.5 rounded-md transition-colors ${
                isListening
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleLog} disabled={loading || !input.trim()}>
            {loading ? "Parsing…" : "Log Workout"}
          </Button>
        </CardContent>
      </Card>

      {sessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Recent Workouts</h2>
            {allGroups.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allGroups.map((g) => (
                  <button key={g} onClick={() => setFilterGroup(filterGroup === g ? null : g)}>
                    <Badge variant={filterGroup === g ? "default" : "outline"} className="text-xs cursor-pointer">
                      {g}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {displayed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions match that filter.</p>
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

function formatDuration(seconds: number): string {
  if (seconds >= 60) return `${Math.round(seconds / 60)}min`;
  return `${seconds}s`;
}

function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session as any;
  const muscleGroups: string[] = s.muscleGroups ?? s.muscle_groups ?? [];
  const exercises: WorkoutSession["exercises"] = s.exercises ?? [];
  const durationMinutes: number | undefined = s.durationMinutes ?? s.duration_minutes;

  async function handleDelete() {
    setDeleting(true);
    await onDelete(session.id);
    setDeleting(false);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{session.title}</CardTitle>
            <div className="flex flex-wrap gap-1 pt-1">
              {muscleGroups.map((mg) => (
                <Badge key={mg} variant="secondary" className="text-xs">
                  {mg}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">{session.date}</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
              title="Delete workout"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Separator />
        {exercises.map((ex, i) => (
          <div key={i} className="text-sm flex items-baseline justify-between">
            <span className="font-medium">{ex.name}</span>
            <span className="text-muted-foreground text-xs">
              {[
                ex.sets && ex.reps && `${ex.sets}×${ex.reps}`,
                ex.weight && `${ex.weight}${ex.weightUnit ?? ""}`,
                ex.duration && formatDuration(ex.duration),
                ex.distance && `${ex.distance}${ex.distanceUnit ?? ""}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        ))}
        {durationMinutes && (
          <p className="text-xs text-muted-foreground pt-1">
            Duration: {durationMinutes} min
          </p>
        )}
      </CardContent>
    </Card>
  );
}
