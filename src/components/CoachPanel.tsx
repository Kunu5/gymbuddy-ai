import { ArrowRight } from "lucide-react";
import type { CoachAnalysis } from "@/types/coach";

interface Props {
  analysis: CoachAnalysis | null;
}

export default function CoachPanel({ analysis }: Props) {
  if (!analysis) {
    return (
      <div style={{ background: 'var(--surface-1)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Log a workout to get your first coaching report.</p>
      </div>
    );
  }

  const topNeglected = analysis.neglectedMuscleGroups[0];
  const headline = topNeglected
    ? `You're skipping ${topNeglected}.`
    : "Your training looks balanced.";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Two-col on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-5" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Neglected muscle groups */}
          {analysis.neglectedMuscleGroups.length > 0 && (
            <div style={{ background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: 22 }}>
              <div className="eyebrow">Neglected · last 30 days</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 8 }}>{headline}</div>
              <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 6, lineHeight: 1.6 }}>
                These muscle groups are missing from your recent sessions. Add them before they fall further behind.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {analysis.neglectedMuscleGroups.map((mg) => (
                  <span key={mg} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '3px 9px',
                    background: 'color-mix(in oklab, var(--destructive) 15%, transparent)',
                    color: 'var(--destructive)',
                    borderRadius: 999,
                  }}>
                    {mg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trend */}
          <div style={{ background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: 22 }}>
            <div className="eyebrow">Trend</div>
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 10, lineHeight: 1.65 }}>
              {analysis.trendObservation}
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--subtle-foreground)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 16, textAlign: 'right' }}>
              Updated {new Date(analysis.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right column — feature card (next session) */}
        <div style={{
          background: 'linear-gradient(160deg, oklch(0.92 0.22 122 / 0.12) 0%, var(--surface-1) 50%)',
          boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--primary) 28%, var(--border))',
          borderRadius: 18, padding: 22,
          display: 'flex', flexDirection: 'column',
        }}>
          <div className="eyebrow" style={{ color: 'var(--primary)' }}>Recommended next session</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 6 }}>
            {analysis.nextSession.title}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
            {analysis.nextSession.exercises.length} exercises
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '18px 0 14px' }}/>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {analysis.nextSession.exercises.map((ex, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</span>
                <span className="metric" style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                  <span style={{ color: 'var(--foreground)' }}>{ex.sets}×{ex.reps}</span>
                  {ex.weight && <span> · {ex.weight}</span>}
                </span>
              </div>
            ))}
          </div>

          <button style={{
            marginTop: 24, width: '100%', height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'var(--primary)', color: 'var(--primary-foreground)',
            border: 'none', borderRadius: 10,
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}>
            Start session
            <ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}
