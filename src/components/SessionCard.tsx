"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { WorkoutSession } from "@/types/workout";

interface Props {
  session: WorkoutSession;
  onDelete: (id: string) => void;
}

export default function SessionCard({ session, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session as any;
  const muscleGroups: string[] = s.muscleGroups ?? s.muscle_groups ?? [];
  const exercises: WorkoutSession["exercises"] = s.exercises ?? [];
  const durationMinutes: number | undefined = s.durationMinutes ?? s.duration_minutes;

  // Calculate total volume (weight × sets × reps) for footer
  const volume = exercises.reduce((sum, ex) => {
    if (ex.weight && ex.sets && ex.reps) return sum + ex.weight * ex.sets * ex.reps;
    return sum;
  }, 0);

  // Count PRs inline (simplistic: any exercise with a weight > 0 is a candidate)
  const hasWeight = exercises.some((ex) => ex.weight && ex.weight > 0);

  async function handleDelete() {
    setDeleting(true);
    await onDelete(session.id);
    setDeleting(false);
  }

  return (
    <div style={{
      background: 'var(--card)',
      boxShadow: 'inset 0 0 0 1px var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{session.title}</div>
            <div className="metric" style={{ fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              {session.date}
              {durationMinutes && ` · ${durationMinutes} min`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {hasWeight && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '2px 6px', background: 'var(--primary-soft)',
                border: '1px solid color-mix(in oklab, var(--primary) 30%, transparent)',
                borderRadius: 4,
              }}>
                weights
              </span>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ color: 'var(--muted-foreground)', cursor: 'pointer', background: 'none', border: 'none', padding: 2, display: 'grid', placeItems: 'center' }}
              title="Delete workout"
            >
              <Trash2 size={13}/>
            </button>
          </div>
        </div>

        {/* Muscle group tags */}
        {muscleGroups.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {muscleGroups.map((mg) => (
              <span key={mg} style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '2px 7px', background: 'var(--secondary)', color: 'var(--muted-foreground)',
                borderRadius: 999,
              }}>
                {mg}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Exercise rows */}
      <div style={{ padding: '10px 14px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{ex.name}</span>
            <span className="metric" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
              {ex.sets && ex.reps && (
                <span style={{ color: 'var(--foreground)' }}>{ex.sets}×{ex.reps}</span>
              )}
              {ex.weight && <span> · {ex.weight}{ex.weightUnit ?? 'kg'}</span>}
              {ex.duration && !ex.weight && (
                <span style={{ color: 'var(--foreground)' }}>
                  {ex.duration >= 60 ? `${Math.round(ex.duration / 60)}min` : `${ex.duration}s`}
                </span>
              )}
              {ex.distance && <span style={{ color: 'var(--foreground)' }}> {ex.distance}{ex.distanceUnit ?? 'km'}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Footer strip */}
      <div style={{
        padding: '8px 14px',
        background: 'color-mix(in oklab, var(--muted) 40%, transparent)',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--muted-foreground)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>{volume > 0 ? `${(volume / 1000).toFixed(1)}k kg vol` : `${exercises.length} exercises`}</span>
        <span>view →</span>
      </div>
    </div>
  );
}
