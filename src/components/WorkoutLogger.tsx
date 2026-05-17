"use client";

import { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
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
  const recognitionRef = useRef<unknown>(null);

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
          <h2 className="text-xl font-semibold">Recent Workouts</h2>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: WorkoutSession }) {
  // Supabase returns snake_case columns; handle both shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session as any;
  const muscleGroups: string[] = s.muscleGroups ?? s.muscle_groups ?? [];
  const exercises: WorkoutSession["exercises"] = s.exercises ?? [];
  const durationMinutes: number | undefined = s.durationMinutes ?? s.duration_minutes;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{session.title}</CardTitle>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {session.date}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {muscleGroups.map((mg) => (
            <Badge key={mg} variant="secondary" className="text-xs">
              {mg}
            </Badge>
          ))}
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
                ex.duration && `${ex.duration}s`,
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
