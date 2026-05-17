"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { WorkoutSession } from "@/types/workout";

interface Props {
  initialSessions: WorkoutSession[];
}

export default function WorkoutLogger({ initialSessions }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>(initialSessions);

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

      const { session } = await res.json();
      setSessions((prev) => [session, ...prev]);
      setInput("");
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
          <Textarea
            placeholder="e.g. 'Did 4 sets of bench press at 80kg for 8 reps, then 3x12 dumbbell rows at 25kg, finished with a 20 min run'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="resize-none"
          />
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
          {session.muscleGroups?.map((mg) => (
            <Badge key={mg} variant="secondary" className="text-xs">
              {mg}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Separator />
        {session.exercises?.map((ex, i) => (
          <div key={i} className="text-sm flex items-baseline justify-between">
            <span className="font-medium">{ex.name}</span>
            <span className="text-muted-foreground text-xs">
              {[
                ex.sets && ex.reps && `${ex.sets}×${ex.reps}`,
                ex.weight && `${ex.weight}${ex.weightUnit ?? ""}`,
                ex.duration && `${ex.duration}s`,
                ex.distance &&
                  `${ex.distance}${ex.distanceUnit ?? ""}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        ))}
        {session.durationMinutes && (
          <p className="text-xs text-muted-foreground pt-1">
            Duration: {session.durationMinutes} min
          </p>
        )}
      </CardContent>
    </Card>
  );
}
